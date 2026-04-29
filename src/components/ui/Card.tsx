import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'primary' | 'secondary' | 'danger' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
}) => {
  const glowStyles = {
    primary: 'hover:shadow-[0_0_30px_rgba(232,255,71,0.3)]',
    secondary: 'hover:shadow-[0_0_30px_rgba(77,255,184,0.3)]',
    danger: 'hover:shadow-[0_0_30px_rgba(255,77,77,0.3)]',
    none: '',
  };
  
  return (
    <div
      className={`bg-surface border border-border rounded-12px p-6 transition-all duration-300 ${glowStyles[glow]} ${className}`}
    >
      {children}
    </div>
  );
};
