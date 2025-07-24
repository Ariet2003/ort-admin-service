'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '@prisma/client';
import Image from 'next/image';

interface User {
  id: number;
  fullname: string;
  username: string;
  phoneNumber: string | null;
  telegramId: string | null;
  points: number;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  user: User | null;
}

const UserIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  TRAINER: 'Преподаватель',
  STUDENT: 'Ученик',
};

const roleColors: Record<UserRole, string> = {
  ADMIN: 'text-red-400',
  MANAGER: 'text-blue-400',
  TRAINER: 'text-yellow-400',
  STUDENT: 'text-green-400',
};

export default function UserDetailsModal({ isOpen, onClose, onEdit, onDelete, user }: Props) {
  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#19242a] rounded-lg w-full max-w-md p-6 space-y-6"
        >
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#161b1e] border border-[#667177]/20 mb-4">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullname}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-[#667177]" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-white text-center">
              {user.fullname}
            </h2>
            <span className={`${roleColors[user.role]} text-sm mt-1`}>
              {roleLabels[user.role]}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#667177]">Логин</p>
              <p className="text-white">{user.username}</p>
            </div>

            <div>
              <p className="text-sm text-[#667177]">Телефон</p>
              <p className="text-white">{user.phoneNumber || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-[#667177]">Telegram ID</p>
              <p className="text-white">{user.telegramId || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-[#667177]">Баллы</p>
              <p className="text-white">{user.points}</p>
            </div>

            <div>
              <p className="text-sm text-[#667177]">Дата регистрации</p>
              <p className="text-white">{formatDate(user.createdAt)}</p>
            </div>

            <div>
              <p className="text-sm text-[#667177]">Последнее обновление</p>
              <p className="text-white">{formatDate(user.updatedAt)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 rounded-lg bg-[#00ff41] text-[#161b1e] font-medium hover:bg-[#00ff41]/90 transition-colors"
            >
              Редактировать
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              Удалить
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 