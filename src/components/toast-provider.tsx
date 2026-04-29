"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const AUTO_DISMISS_MS = 3500;

type ToastItem = { id: number; message: string };

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const idRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    const text = message.trim();
    if (!text) return;
    idRef.current += 1;
    const id = idRef.current;
    setToast({ id, message: text });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
    }, AUTO_DISMISS_MS);
  }, []);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div
          className="mp-toast"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
