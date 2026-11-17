import React from 'react';
import { useWebApp } from '../context/WebAppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast } = useWebApp();

  if (!toast.show) return null;

  return (
    <div className={`toast-notification toast-${toast.type}`}>
      <div className="toast-icon">
        {toast.type === 'success' && <CheckCircle2 size={18} color="#10B981" />}
        {toast.type === 'error' && <AlertCircle size={18} color="#EF4444" />}
        {toast.type === 'info' && <Info size={18} color="#3B82F6" />}
      </div>
      <span className="toast-message">{toast.message}</span>
    </div>
  );
}
