// Utility functions to convert regular classes to glass effect classes

export const convertToGlass = (className: string): string => {
  return className
    // Convert background classes
    .replace(/bg-bg-surface/g, 'glass-card')
    .replace(/bg-bg-primary/g, 'glass-effect')
    .replace(/bg-bg-elevated/g, 'glass-card')
    .replace(/bg-bg-sidebar/g, 'glass-sidebar')
    .replace(/bg-bg-input/g, 'glass-input')
    .replace(/bg-white\/5/g, 'glass-effect')
    .replace(/bg-white\/10/g, 'glass-card')
    .replace(/bg-black\/20/g, 'glass-effect')
    .replace(/bg-black\/60/g, 'glass-modal')
    .replace(/bg-black\/70/g, 'glass-modal')
    .replace(/bg-black\/80/g, 'glass-modal')
    // Keep accent colors but make them glass
    .replace(/bg-accent-primary\/20/g, 'glass-card bg-accent-primary/10')
    .replace(/bg-accent-primary\/5/g, 'glass-effect bg-accent-primary/5')
    // Convert danger/success/warning backgrounds
    .replace(/bg-danger\/20/g, 'glass-effect bg-danger/10')
    .replace(/bg-success\/20/g, 'glass-effect bg-success/10')
    .replace(/bg-warning\/20/g, 'glass-effect bg-warning/10')
    // Remove solid backgrounds
    .replace(/bg-white/g, 'glass-card')
    .replace(/bg-black/g, 'glass-effect')
    .replace(/bg-gray-\d+/g, 'glass-effect')
    .replace(/bg-slate-\d+/g, 'glass-effect');
};

// Component wrapper that automatically applies glass effect
export const withGlass = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { glassVariant?: 'card' | 'button' | 'input' | 'sidebar' | 'modal' }> => {
  return ({ glassVariant = 'card', ...props }) => {
    const glassClass = `glass-${glassVariant}`;
    
    return (
      <div className={glassClass}>
        <Component {...(props as P)} />
      </div>
    );
  };
};

// Hook to get glass-compatible styles
export const useGlassStyles = (variant: 'card' | 'button' | 'input' | 'sidebar' | 'modal' = 'card') => {
  const baseStyles = {
    backdropFilter: 'blur(15px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  };

  const variantStyles = {
    card: {
      ...baseStyles,
      borderRadius: '16px',
      padding: '24px',
    },
    button: {
      ...baseStyles,
      borderRadius: '12px',
      padding: '8px 16px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 2.2)',
    },
    input: {
      ...baseStyles,
      borderRadius: '8px',
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.12)',
    },
    sidebar: {
      ...baseStyles,
      background: 'rgba(255, 255, 255, 0.06)',
      borderRadius: '0px',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    },
    modal: {
      ...baseStyles,
      borderRadius: '24px',
      padding: '32px',
      background: 'rgba(255, 255, 255, 0.08)',
    },
  };

  return variantStyles[variant];
};