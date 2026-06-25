import React, { useEffect } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borderColors = {
    success: "border-emerald-100 dark:border-emerald-950/50 bg-white dark:bg-slate-900 shadow-emerald-100/50 dark:shadow-none",
    warning: "border-amber-100 dark:border-amber-950/50 bg-white dark:bg-slate-900 shadow-amber-100/50 dark:shadow-none",
    error: "border-rose-100 dark:border-rose-950/50 bg-white dark:bg-slate-900 shadow-rose-100/50 dark:shadow-none",
    info: "border-blue-100 dark:border-blue-950/50 bg-white dark:bg-slate-900 shadow-blue-100/50 dark:shadow-none",
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 border rounded-xl shadow-lg w-80 md:w-96 transition-all duration-300 animate-slide-in ${borderColors[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="p-1 text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};
