'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    // Генерируем действительно уникальный ID
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Удаляем дубликаты сообщений
    setToasts(prev => {
      const isDuplicate = prev.some(toast => 
        toast.message === message && 
        toast.type === type && 
        Date.now() - parseInt(toast.id.split('-')[0]) < 3000 // Проверяем, прошло ли меньше 3 секунд
      );
      
      if (isDuplicate) {
        return prev;
      }
      
      return [...prev, { id, message, type }];
    });

    // Автоматически удаляем уведомление через 5 секунд
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`flex items-center gap-3 min-w-[320px] p-4 rounded-lg shadow-lg pointer-events-auto
                ${toast.type === 'success'
                  ? 'bg-[#19242a] border border-[#00ff41]/20 shadow-[#00ff41]/5'
                  : 'bg-[#19242a] border border-red-500/20 shadow-red-500/5'
                }`}
            >
              {toast.type === 'success' ? (
                <CheckCircleIcon className="w-6 h-6 text-[#00ff41]" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500" />
              )}
              <p className={`flex-1 text-sm ${
                toast.type === 'success' ? 'text-[#00ff41]' : 'text-red-400'
              }`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`p-1 rounded-full hover:bg-white/5 transition-colors ${
                  toast.type === 'success' ? 'text-[#00ff41]' : 'text-red-400'
                }`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
