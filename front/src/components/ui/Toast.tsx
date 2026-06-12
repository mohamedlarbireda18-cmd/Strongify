import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  icon?: string;
  duration?: number;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  icon, 
  duration = 3000, 
  onClose,
  type = 'success'
}) => {
  const [visible, setVisible] = useState(false);

  // Icône par défaut selon le type
  const defaultIcons: Record<string, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const displayIcon = icon || defaultIcons[type];

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type} ${visible ? 'visible' : ''}`}>
      <span className="toast-icon">{displayIcon}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
};