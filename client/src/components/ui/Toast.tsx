import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ isVisible, message, type, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 ${bgColor} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[500px]`}
        >
          <div className="flex items-center">
            <Icon className={`w-5 h-5 mr-3 ${iconColor}`} />
            <p className={`flex-1 text-sm font-medium ${textColor}`}>{message}</p>
            <button
              onClick={onClose}
              className={`ml-3 p-1 hover:bg-opacity-20 hover:bg-gray-500 rounded transition-colors ${textColor}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};