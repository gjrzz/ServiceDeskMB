import React from "react";
import { GlassEffect, GlassFilter } from "./liquid-glass";

interface GlassWrapperProps {
  children: React.ReactNode;
  className?: string;
  variant?: "card" | "button" | "input" | "sidebar" | "modal";
  onClick?: () => void;
}

export const GlassWrapper: React.FC<GlassWrapperProps> = ({
  children,
  className = "",
  variant = "card",
  onClick,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "card":
        return "glass-card rounded-xl p-6";
      case "button":
        return "glass-button rounded-xl px-4 py-2 cursor-pointer";
      case "input":
        return "glass-input rounded-xl px-3 py-2";
      case "sidebar":
        return "glass-sidebar rounded-none p-0";
      case "modal":
        return "glass-card rounded-xl p-8";
      default:
        return "glass-effect rounded-xl p-4";
    }
  };

  return (
    <>
      <GlassFilter />
      <GlassEffect 
        className={`${getVariantClasses()} ${className}`}
        style={{
          backdropFilter: "blur(15px)",
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div onClick={onClick} className="w-full h-full">
          {children}
        </div>
      </GlassEffect>
    </>
  );
};

// Componentes específicos para diferentes usos
export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <GlassWrapper variant="card" className={className}>
    {children}
  </GlassWrapper>
);

export const GlassButton: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => (
  <GlassWrapper variant="button" className={className} onClick={onClick}>
    {children}
  </GlassWrapper>
);

export const GlassInput: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = "" }) => (
  <GlassWrapper variant="input" className={className}>
    {children}
  </GlassWrapper>
);

export const GlassSidebar: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = "" }) => (
  <GlassWrapper variant="sidebar" className={className}>
    {children}
  </GlassWrapper>
);

export const GlassModal: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = "" }) => (
  <GlassWrapper variant="modal" className={className}>
    {children}
  </GlassWrapper>
);