'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '@prisma/client';
type Language = 'KYRGYZ' | 'RUSSIAN';
import Image from 'next/image';

interface User {
  id: number;
  fullname: string;
  username: string;
  phoneNumber: string | null;
  telegramId: string | null;
  points: number;
  role: UserRole;
  language: Language;
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
  STUDENT: 'Ученик',
};

const languageLabels: Record<Language, string> = {
  KYRGYZ: 'Кыргызский',
  RUSSIAN: 'Русский',
};

const languageColors: Record<Language, string> = {
  KYRGYZ: 'text-blue-400',
  RUSSIAN: 'text-purple-400',
};

const roleColors: Record<UserRole, string> = {
  ADMIN: 'text-red-400',
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
          className="bg-[#19242a] rounded-lg w-full max-w-xl p-6 space-y-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#00ff41]/20 to-[#19242a] border-2 border-[#00ff41]/20 shadow-lg shadow-[#00ff41]/5">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullname}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-[#00ff41]/40" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">
                {user.fullname}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`${roleColors[user.role]} text-sm px-2 py-0.5 rounded-full bg-[#161b1e] border border-[#667177]/10`}>
                  {roleLabels[user.role]}
                </span>
                <span className={`${languageColors[user.language]} text-sm px-2 py-0.5 rounded-full bg-[#161b1e] border border-[#667177]/10`}>
                  {languageLabels[user.language]}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#161b1e] rounded-xl border border-[#667177]/10 overflow-hidden">
            {/* Статусная информация */}
            <div className="grid grid-cols-3 divide-x divide-[#667177]/10">
              <div className="p-3 text-center">
                <p className="text-sm text-[#667177] mb-1">Роль</p>
                <p className={`text-base font-medium ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </p>
              </div>
              <div className="p-3 text-center">
                <p className="text-sm text-[#667177] mb-1">Язык</p>
                <p className={`text-base font-medium ${languageColors[user.language]}`}>
                  {languageLabels[user.language]}
                </p>
              </div>
              <div className="p-3 text-center">
                <p className="text-sm text-[#667177] mb-1">Баллы</p>
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4 text-[#00ff41]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p className="text-base font-medium text-[#00ff41]">{user.points}</p>
                </div>
              </div>
            </div>

            {/* Основная информация */}
            <div className="p-6 space-y-2">
              {/* Контактная информация */}
              <div>
                <h3 className="text-sm font-medium text-[#00ff41] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Контактная информация
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 bg-[#19242a] rounded-lg border border-[#667177]/10 hover:border-[#00ff41]/20 transition-colors">
                    <p className="text-sm text-[#667177] mb-1">Логин</p>
                    <p className="text-white">{user.username}</p>
                  </div>
                  <div className="p-2 bg-[#19242a] rounded-lg border border-[#667177]/10 hover:border-[#00ff41]/20 transition-colors">
                    <p className="text-sm text-[#667177] mb-1">Телефон</p>
                    <p className="text-white">{user.phoneNumber || '—'}</p>
                  </div>
                  <div className="col-span-2 p-2 bg-[#19242a] rounded-lg border border-[#667177]/10 hover:border-[#00ff41]/20 transition-colors">
                    <p className="text-sm text-[#667177] mb-1">Telegram ID</p>
                    <p className="text-white">{user.telegramId || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Временная информация */}
              <div>
                <h3 className="text-sm font-medium text-[#00ff41] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Временная информация
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 bg-[#19242a] rounded-lg border border-[#667177]/10 hover:border-[#00ff41]/20 transition-colors">
                    <p className="text-sm text-[#667177] mb-1">Дата регистрации</p>
                    <p className="text-white">{formatDate(user.createdAt)}</p>
                  </div>
                  <div className="p-2 bg-[#19242a] rounded-lg border border-[#667177]/10 hover:border-[#00ff41]/20 transition-colors">
                    <p className="text-sm text-[#667177] mb-1">Последнее обновление</p>
                    <p className="text-white">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 rounded-lg bg-[#00ff41] text-[#161b1e] font-medium 
                hover:bg-[#00ff41]/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00ff41]/20
                transition-all duration-200 ease-in-out"
            >
              Редактировать
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-2 rounded-lg border border-red-500 text-red-500 
                hover:bg-red-500/10 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20
                transition-all duration-200 ease-in-out"
            >
              Удалить
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 