'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { initials } from '@/lib/data';
import { IconClose, IconChevronDown, type IconProps } from './icons';

// ── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps { name: string; hue?: number; size?: number; src?: string; }
export const Avatar = ({ name, hue = 210, size = 36, src }: AvatarProps) => {
  const bg = `hsl(${hue} 70% 92%)`;
  const fg = `hsl(${hue} 60% 30%)`;
  return (
    <div
      className="inline-flex items-center justify-center rounded-full font-semibold select-none shrink-0 overflow-hidden"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.4 }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
};

// ── Badge ────────────────────────────────────────────────────────────────────
type BadgeTone = 'gray' | 'green' | 'red' | 'orange' | 'blue' | 'violet';
interface BadgeProps { tone?: BadgeTone; children: React.ReactNode; dot?: boolean; }
export const Badge = ({ tone = 'gray', children, dot = false }: BadgeProps) => {
  const tones: Record<BadgeTone, string> = {
    gray:   'bg-slate-100 text-slate-700 ring-slate-200',
    green:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
    red:    'bg-rose-50 text-rose-700 ring-rose-200',
    orange: 'bg-amber-50 text-amber-800 ring-amber-200',
    blue:   'bg-brand-50 text-brand-700 ring-brand-200',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  };
  const dots: Record<BadgeTone, string> = {
    gray: 'bg-slate-400', green: 'bg-emerald-500', red: 'bg-rose-500',
    orange: 'bg-amber-500', blue: 'bg-brand-600', violet: 'bg-violet-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />}
      {children}
    </span>
  );
};

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> { className?: string; children: React.ReactNode; }
export const Card = ({ className = '', children, ...rest }: CardProps) => (
  <div className={`bg-white rounded-xl border border-slate-200/80 shadow-card ${className}`} {...rest}>
    {children}
  </div>
);

// ── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
type ButtonSize = 'sm' | 'md' | 'lg';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentType<IconProps>;
}
export const Button = ({ variant = 'primary', size = 'md', icon: Icon, children, className = '', ...rest }: ButtonProps) => {
  const variants: Record<ButtonVariant, string> = {
    primary:   'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    ghost:     'text-slate-600 hover:bg-slate-100',
    danger:    'bg-rose-600 text-white hover:bg-rose-700',
    soft:      'bg-brand-50 text-brand-700 hover:bg-brand-100',
  };
  const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-[13px] gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-11 px-5 text-sm gap-2',
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  );
};

// ── IconButton ────────────────────────────────────────────────────────────────
type IconButtonTone = 'default' | 'danger';
interface IconButtonProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  onClick?: () => void;
  tone?: IconButtonTone;
  className?: string;
}
export const IconButton = ({ icon: Icon, label, onClick, tone = 'default', className = '' }: IconButtonProps) => {
  const tones: Record<IconButtonTone, string> = {
    default: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
    danger:  'text-slate-500 hover:text-rose-600 hover:bg-rose-50',
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${tones[tone]} ${className}`}
    >
      <Icon size={16} />
    </button>
  );
};

// ── Field ─────────────────────────────────────────────────────────────────────
interface FieldProps { label: string; hint?: string; children: React.ReactNode; required?: boolean; className?: string; }
export const Field = ({ label, hint, children, required, className = '' }: FieldProps) => (
  <label className={`block ${className}`}>
    <div className="mb-1.5 flex items-center justify-between">
      <span className="text-[13px] font-medium text-slate-700">
        {label}{required && <span className="text-rose-500"> *</span>}
      </span>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
    {children}
  </label>
);

const inputBase = 'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition';

export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={`${inputBase} ${p.className || ''}`} />
);

export const Select = ({ children, className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select {...p} className={`${inputBase} appearance-none pr-9 ${className || ''}`}>
      {children}
    </select>
    <IconChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
  </div>
);

export const Textarea = ({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...p}
    rows={p.rows || 4}
    className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition ${className || ''}`}
  />
);

// ── Detail (shared) ───────────────────────────────────────────────────────────
interface DetailProps { label: string; value?: string; }
export const Detail = ({ label, value }: DetailProps) => (
  <div>
    <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</div>
    <div className="text-sm text-slate-900">{value || '—'}</div>
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}
export const Modal = ({ open, onClose, title, subtitle, children, footer, maxWidth = 'max-w-lg' }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-pop overflow-hidden pop-in`}>
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <IconButton icon={IconClose} label="Close" onClick={onClose} />
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Drawer ────────────────────────────────────────────────────────────────────
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}
export const Drawer = ({ open, onClose, title, subtitle, children, footer, width = 'max-w-md' }: DrawerProps) => {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 fade-in">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full ${width} bg-white shadow-pop flex flex-col slide-in-right`}>
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <IconButton icon={IconClose} label="Close" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 nice-scroll">{children}</div>
        {footer && (
          <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
type ToastFn = (msg: string, tone?: 'success' | 'error') => void;
const ToastContext = createContext<ToastFn | null>(null);

interface ToastHostProps { children: React.ReactNode; }
export const ToastHost = ({ children }: ToastHostProps) => {
  const [toasts, setToasts] = useState<{ id: string; msg: string; tone: string }[]>([]);
  const push = useCallback<ToastFn>((msg, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="pop-in bg-slate-900 text-white text-sm rounded-lg px-4 py-2.5 shadow-pop flex items-center gap-2 max-w-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${t.tone === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// ── PageHeader ────────────────────────────────────────────────────────────────
interface PageHeaderProps { title: string; subtitle?: string; actions?: React.ReactNode; }
export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
    <div>
      <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
