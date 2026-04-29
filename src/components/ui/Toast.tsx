import { useEffect, useRef, useState } from 'react';
import { useToastStore, type Toast, type ToastType } from '../../store/useToastStore';

const borderColors: Record<ToastType, string> = {
  success: 'var(--consensus-strong)',
  error: 'var(--consensus-conflict)',
  info: 'var(--accent-primary)',
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 8, pointerEvents: 'none' }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [phase, setPhase] = useState<'in' | 'visible' | 'out'>('in');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Animate in
    const inTimer = setTimeout(() => setPhase('visible'), 10);
    // Auto dismiss
    timerRef.current = setTimeout(() => {
      setPhase('out');
      setTimeout(() => removeToast(toast.id), 150);
    }, toast.duration);
    return () => {
      clearTimeout(inTimer);
      clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, removeToast]);

  const translateX = phase === 'in' ? 'translateX(120%)' : phase === 'out' ? 'translateX(120%)' : 'translateX(0)';
  const opacity = phase === 'out' ? 0 : 1;

  return (
    <div
      style={{
        pointerEvents: 'auto',
        background: 'var(--bg-primary)',
        border: '0.5px solid var(--border-default)',
        borderLeft: `3px solid ${borderColors[toast.type]}`,
        borderRadius: 'var(--radius-md)',
        padding: '10px 16px',
        fontSize: '0.875rem',
        color: 'var(--text-primary)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        maxWidth: 340,
        transform: translateX,
        opacity,
        transition: phase === 'in' ? 'transform 200ms ease-out, opacity 200ms ease-out' : 'transform 150ms ease-in, opacity 150ms ease-in',
      }}
    >
      {toast.message}
    </div>
  );
}
