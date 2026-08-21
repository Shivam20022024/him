import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg active:scale-[0.97] active:brightness-95";
  
  const variants = {
    primary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 active:bg-slate-900 active:text-white active:border-slate-900 shadow-sm",
    secondary: "bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 active:bg-white active:text-slate-900 active:border-slate-200 shadow-sm",
    outline: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-900 active:text-white active:border-slate-900",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-900 active:text-white",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 h-8",
    md: "text-sm px-4 py-2 h-10",
    lg: "text-base px-6 py-3 h-12",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
