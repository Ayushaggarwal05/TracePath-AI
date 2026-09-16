import React from 'react';
import { useToast, ToastMessage } from '../../hooks/useToast';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/40',
    error: 'border-rose-500/30 bg-rose-950/40',
    warning: 'border-amber-500/30 bg-amber-950/40',
    info: 'border-indigo-500/30 bg-indigo-950/40',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast: ToastMessage) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-200 animate-in slide-in-from-right-5 ${borders[toast.type]}`}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
