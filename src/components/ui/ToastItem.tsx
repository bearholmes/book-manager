import { useSetAtom } from 'jotai';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { removeToastAtom, type Toast } from '@/store/uiAtom';
import clsx from 'clsx';

interface ToastItemProps {
  toast: Toast;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
};

export function ToastItem({ toast }: ToastItemProps) {
  const removeToast = useSetAtom(removeToastAtom);
  const Icon = icons[toast.type || 'info'];

  return (
    <div
      className={clsx(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg',
        'animate-slide-down',
        colors[toast.type || 'info'],
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={() => removeToast(toast.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
