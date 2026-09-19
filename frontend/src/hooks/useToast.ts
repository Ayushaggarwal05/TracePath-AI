import { useState, useCallback, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

let toastListeners: Array<(toasts: ToastMessage[]) => void> = [];
let memoryToasts: ToastMessage[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...memoryToasts]));
}

export function showToast(
  type: 'success' | 'error' | 'info' | 'warning',
  title: string,
  message?: string,
  duration = 4000
) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastMessage = { id, type, title, message, duration };
  memoryToasts = [...memoryToasts, newToast];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      memoryToasts = memoryToasts.filter((t) => t.id !== id);
      notifyListeners();
    }, duration);
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>(memoryToasts);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => {
      setToasts(newToasts);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    memoryToasts = memoryToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  const success = useCallback(
    (title: string, message?: string) => showToast('success', title, message),
    []
  );
  const error = useCallback(
    (title: string, message?: string) => showToast('error', title, message),
    []
  );
  const info = useCallback(
    (title: string, message?: string) => showToast('info', title, message),
    []
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast('warning', title, message),
    []
  );

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}
