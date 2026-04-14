'use client';
import { cn } from '../../lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface DottedSurfaceProps extends Omit<React.ComponentProps<'div'>, 'ref'> {
  theme?: 'claro' | 'escuro';
}

export function DottedSurface({ className, theme = 'claro', ...props }: DottedSurfaceProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		particles: THREE.Points[];
		animationId: number;
		count: number;
	} | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const SEPARATION = 100;
		const AMOUNTX = 50;
		const AMOUNTY = 30;

		// Scene setup
		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(theme === 'claro' ? 0xffffff : 0x000000, 2000, 10000);

		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			1,
			10000,
		);
		// Posição da câmera mais próxima e centralizada
		camera.position.set(0, 200, 800);

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(scene.fog.color, theme === 'claro' ? 1 : 0);
		
		// Configurar canvas para ser fixo
		const canvas = renderer.domElement;
		canvas.style.position = 'fixed';
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.style.width = '100vw';
		canvas.style.height = '100vh';
		canvas.style.objectFit = 'cover';
		canvas.style.zIndex = '-10';

		containerRef.current.appendChild(renderer.domElement);

		// Create particles
		const particles: THREE.Points[] = [];
		const positions: number[] = [];
		const colors: number[] = [];

		// Create geometry for all particles
		const geometry = new THREE.BufferGeometry();

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
				const y = 0; // Will be animated
				const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

				positions.push(x, y, z);
				if (theme === 'escuro') {
					colors.push(200, 200, 200);
				} else {
					// Roxo escuro bem definido para tema claro
					colors.push(0.2, 0.0, 0.3); // Valores normalizados (0-1) para roxo escuro
				}
			}
		}

		geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(positions, 3),
		);
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		// Create material
		const material = new THREE.PointsMaterial({
			size: theme === 'claro' ? 4 : 6, // Pontos mais finos
			vertexColors: true,
			transparent: true,
			opacity: theme === 'claro' ? 0.9 : 0.8,
			sizeAttenuation: false,
		});

		// Create points object
		const points = new THREE.Points(geometry, material);
		scene.add(points);

		let count = 0;
		let animationId: number;

		// Animation function
		const animate = () => {
			animationId = requestAnimationFrame(animate);

			const positionAttribute = geometry.attributes.position;
			const positions = positionAttribute.array as Float32Array;

			let i = 0;
			for (let ix = 0; ix < AMOUNTX; ix++) {
				for (let iy = 0; iy < AMOUNTY; iy++) {
					const index = i * 3;

					// Animate Y position with sine waves - movimento mais sutil
					positions[index + 1] =
						Math.sin((ix + count) * 0.15) * 30 +
						Math.sin((iy + count) * 0.2) * 25 +
						Math.cos((ix + iy + count) * 0.08) * 20;

					i++;
				}
			}

			positionAttribute.needsUpdate = true;

			renderer.render(scene, camera);
			count += 0.08; // Animação mais sutil
		};

		// Handle window resize - mantém tamanho fixo
		const handleResize = () => {
			// Usar tamanho fixo baseado no viewport inicial
			const fixedWidth = 1920;
			const fixedHeight = 1080;
			
			camera.aspect = fixedWidth / fixedHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
			
			// Ajustar escala do canvas para manter proporção
			const canvas = renderer.domElement;
			canvas.style.width = '100vw';
			canvas.style.height = '100vh';
			canvas.style.objectFit = 'cover';
		};

		window.addEventListener('resize', handleResize);

		// Start animation
		animate();

		// Store references
		sceneRef.current = {
			scene,
			camera,
			renderer,
			particles: [points],
			animationId,
			count,
		};

		// Cleanup function
		return () => {
			window.removeEventListener('resize', handleResize);

			if (sceneRef.current) {
				cancelAnimationFrame(sceneRef.current.animationId);

				// Clean up Three.js objects
				sceneRef.current.scene.traverse((object) => {
					if (object instanceof THREE.Points) {
						object.geometry.dispose();
						if (Array.isArray(object.material)) {
							object.material.forEach((material) => material.dispose());
						} else {
							object.material.dispose();
						}
					}
				});

				sceneRef.current.renderer.dispose();

				if (containerRef.current && sceneRef.current.renderer.domElement) {
					containerRef.current.removeChild(
						sceneRef.current.renderer.domElement,
					);
				}
			}
		};
	}, [theme]);

	return (
		<div
			ref={containerRef}
			className={cn('pointer-events-none fixed inset-0 -z-10', className)}
			style={{
				width: '100vw',
				height: '100vh',
				overflow: 'hidden',
				position: 'fixed',
				top: 0,
				left: 0,
			}}
			{...props}
		/>
	);
}
