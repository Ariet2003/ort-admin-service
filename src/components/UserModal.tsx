'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '@prisma/client';
import Image from 'next/image';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

interface User {
  id: number;
  fullname: string;
  username: string;
  phoneNumber: string | null;
  telegramId: string | null;
  points: number;
  role: UserRole;
  avatarUrl: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => Promise<void>;
  user?: User | null;
}

interface ValidationErrors {
  username?: string;
  phoneNumber?: string;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  TRAINER: 'Преподаватель',
  STUDENT: 'Ученик',
};

const UserIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function UserModal({ isOpen, onClose, onSubmit, user }: Props) {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    phoneNumber: '',
    telegramId: '',
    role: 'STUDENT' as UserRole,
    password: '',
    avatarUrl: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname,
        username: user.username,
        phoneNumber: user.phoneNumber || '',
        telegramId: user.telegramId || '',
        role: user.role,
        password: '',
        avatarUrl: user.avatarUrl || '',
      });
    } else {
      setFormData({
        fullname: '',
        username: '',
        phoneNumber: '',
        telegramId: '',
        role: 'STUDENT',
        password: '',
        avatarUrl: '',
      });
    }
    setErrors({});
  }, [user]);

  const checkUsername = useCallback(async (username: string) => {
    if (!username) return;
    setIsCheckingUsername(true);
    try {
      const params = new URLSearchParams({ username });
      if (user?.id) {
        params.append('excludeUserId', user.id.toString());
      }
      
      const response = await fetch(`/api/users/check-username?${params}`);
      const data = await response.json();
      
      if (!data.available) {
        setErrors(prev => ({ ...prev, username: 'Этот логин уже занят' }));
      } else {
        setErrors(prev => ({ ...prev, username: undefined }));
      }
    } catch (err) {
      console.error('Failed to check username:', err);
    } finally {
      setIsCheckingUsername(false);
    }
  }, [user]);

  const validatePhoneNumber = useCallback((phoneNumber: string) => {
    if (!phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: undefined }));
      return;
    }

    try {
      if (isValidPhoneNumber(phoneNumber)) {
        const parsedNumber = parsePhoneNumber(phoneNumber);
        setFormData(prev => ({
          ...prev,
          phoneNumber: parsedNumber.format('INTERNATIONAL')
        }));
        setErrors(prev => ({ ...prev, phoneNumber: undefined }));
      } else {
        setErrors(prev => ({ ...prev, phoneNumber: 'Неверный формат номера' }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Неверный формат номера' }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Проверяем username при изменении
    if (name === 'username') {
      checkUsername(value);
    }

    // Валидируем телефон при изменении
    if (name === 'phoneNumber') {
      validatePhoneNumber(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем наличие ошибок
    if (Object.keys(errors).length > 0) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const submitData = user ? formData : { ...formData, points: 0 };
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
          className="bg-[#19242a] rounded-lg w-full max-w-md p-6 space-y-2"
        >
          <h2 className="text-xl font-bold text-white">
            {user ? 'Редактировать пользователя' : 'Создать пользователя'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Аватар */}
            <div>
              <label className="block text-sm font-medium text-[#667177] mb-1">
                Фото профиля
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#161b1e] border border-[#667177]/20">
                  {formData.avatarUrl ? (
                    <Image
                      src={formData.avatarUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-[#667177]" />
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="URL фотографии"
                  className="flex-1 px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#667177] mb-1">
                ФИО
              </label>
              <input
                type="text"
                name="fullname"
                required
                value={formData.fullname}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#667177] mb-1">
                Логин
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.username 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#667177] focus:ring-[#00ff41]'
                  } bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin w-4 h-4 border-2 border-[#00ff41] border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>

            {!user && (
              <div>
                <label className="block text-sm font-medium text-[#667177] mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  name="password"
                  required={!user}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#667177] mb-1">
                Телефон
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+996700123456"
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.phoneNumber 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-[#667177] focus:ring-[#00ff41]'
                } bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#667177] mb-1">
                Telegram ID
              </label>
              <input
                type="text"
                name="telegramId"
                value={formData.telegramId}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#667177] mb-1">
                Роль
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
              >
                {Object.entries(roleLabels).map(([role, label]) => (
                  <option key={role} value={role}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-center text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || Object.keys(errors).length > 0}
                className="flex-1 px-4 py-2 rounded-lg bg-[#00ff41] text-[#161b1e] font-medium hover:bg-[#00ff41]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-[#667177] text-white hover:bg-[#161b1e] transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}