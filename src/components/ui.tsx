import React from 'react';
import { cn } from '../lib/utils';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-[#1e293b] rounded-xl border border-[#334155] shadow-sm overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-b border-[#334155] flex justify-between items-center bg-[#0f172a]">
      <div>
        <h3 className="text-lg font-semibold text-[#f8fafc]">{title}</h3>
        {subtitle && <p className="text-sm text-[#94a3b8] mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const variants = {
    default: "bg-[#334155] text-[#f8fafc]",
    success: "bg-emerald-500/10 text-[#10b981]",
    warning: "bg-amber-500/10 text-[#f59e0b]",
    danger: "bg-rose-500/10 text-[#ef4444]",
    info: "bg-sky-400/10 text-[#38bdf8]",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' }) {
  const variants = {
    primary: "bg-[#38bdf8] text-[#0f172a] hover:opacity-90 shadow-sm",
    secondary: "bg-[#334155] text-[#f8fafc] hover:bg-[#1e293b]",
    outline: "border border-[#334155] text-[#94a3b8] hover:bg-[#334155]",
    ghost: "text-[#94a3b8] hover:bg-[#334155]",
    danger: "bg-[#ef4444] text-[#f8fafc] hover:opacity-90 shadow-sm",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  return (
    <button className={cn("inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none", variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
