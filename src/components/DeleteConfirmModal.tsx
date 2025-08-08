'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, userName }: Props) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#19242a] rounded-lg w-full max-w-md p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-white">
            Подтверждение удаления
          </h2>
          
          <p className="text-[#667177]">
            Вы действительно хотите удалить пользователя <span className="text-white">{userName}</span>? Это действие нельзя будет отменить.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium 
                hover:bg-red-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20
                transition-all duration-200 ease-in-out"
            >
              Удалить
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-[#667177] text-white 
                hover:bg-[#161b1e] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#667177]/20
                transition-all duration-200 ease-in-out"
            >
              Отмена
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 