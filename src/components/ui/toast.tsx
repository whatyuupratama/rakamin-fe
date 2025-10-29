'use client';

import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
type ToastVariant = 'success' | 'error' | 'info';

export type ToastPayload = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastMessage = ToastPayload & {
  id: string;
};

type ToastContextValue = {
  publish: (payload: ToastPayload) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; className: string }
> = {
  success: {
    icon: (
      <CheckCircle2 className='h-5 w-5 text-emerald-500' aria-hidden='true' />
    ),
    className: 'border-emerald-200 shadow-emerald-100/70',
  },
  error: {
    icon: <XCircle className='h-5 w-5 text-rose-500' aria-hidden='true' />,
    className: 'border-rose-200 shadow-rose-100/70',
  },
  info: {
    icon: <Info className='h-5 w-5 text-sky-500' aria-hidden='true' />,
    className: 'border-sky-200 shadow-sky-100/70',
  },
};

const baseToastClasses =
  'w-full max-w-sm rounded-2xl border bg-white px-4 py-3 shadow-lg shadow-black/5 '; // trailing space for variants

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      timersRef.current = {};
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timerId = timersRef.current[id];
    if (timerId) {
      window.clearTimeout(timerId);
      delete timersRef.current[id];
    }
  }, []);

  const publish = useCallback(
    ({ duration = 4000, variant = 'info', ...rest }: ToastPayload) => {
      const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [...prev, { id, variant, ...rest }]);

      if (duration > 0) {
        timersRef.current[id] = window.setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  const contextValue = useMemo(
    () => ({ publish, dismiss }),
    [publish, dismiss]
  );

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {portalTarget
        ? createPortal(
            <div className='pointer-events-none fixed inset-0 z-60 flex flex-col items-end justify-end gap-3 px-4 py-6 sm:py-8'>
              {toasts.map(({ id, title, description, variant = 'info' }) => {
                const config = variantConfig[variant];
                return (
                  <div
                    key={id}
                    className={`${baseToastClasses}${config.className} pointer-events-auto flex items-start gap-3`}
                    role='status'
                    aria-live='polite'
                  >
                    <div className='mt-0.5'>{config.icon}</div>
                    <div className='flex-1 text-sm text-gray-900'>
                      <p className='font-medium'>{title}</p>
                      {description ? (
                        <p className='mt-1 text-xs text-gray-500'>
                          {description}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type='button'
                      onClick={() => dismiss(id)}
                      className='ml-2 rounded-full p-1 text-gray-400 transition hover:text-gray-600'
                      aria-label='Dismiss notification'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                );
              })}
            </div>,
            portalTarget
          )
        : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
