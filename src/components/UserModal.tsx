'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '@prisma/client';

type Language = 'KYRGYZ' | 'RUSSIAN';
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
  language: Language;
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
  STUDENT: 'Ученик',
};

const languageLabels: Record<Language, string> = {
  KYRGYZ: 'Кыргызский',
  RUSSIAN: 'Русский',
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
    language: 'KYRGYZ' as Language,
    password: '',
    avatarUrl: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname,
        username: user.username,
        phoneNumber: user.phoneNumber ? user.phoneNumber.replace(/\s+/g, '') : '',
        telegramId: user.telegramId || '',
        role: user.role,
        language: user.language,
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
        language: 'KYRGYZ',
        password: '',
        avatarUrl: '',
      });
    }
    setErrors({});
  }, [user]);

  const checkUsername = useCallback(async (username: string) => {
    if (!username) {
      setErrors(prev => ({ ...prev, username: undefined }));
      return;
    }
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
      // Убираем ошибку при ошибке запроса, чтобы не блокировать форму
      setErrors(prev => ({ ...prev, username: undefined }));
    } finally {
      setIsCheckingUsername(false);
    }
  }, [user]);

  const validatePhoneNumber = useCallback(async (phoneNumber: string) => {
    if (!phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: undefined }));
      return;
    }

    try {
      // Проверяем формат номера
      if (isValidPhoneNumber(phoneNumber)) {
        const parsedNumber = parsePhoneNumber(phoneNumber);
        // Форматируем номер без пробелов
        const formattedNumber = parsedNumber.format('INTERNATIONAL').replace(/\s+/g, '');
        
        setFormData(prev => ({
          ...prev,
          phoneNumber: formattedNumber
        }));

        // Проверяем уникальность номера только если номер изменился
        if (formattedNumber !== user?.phoneNumber) {
          setIsCheckingPhone(true);
          const params = new URLSearchParams({ phoneNumber: formattedNumber });
          if (user?.id) {
            params.append('excludeUserId', user.id.toString());
          }
          
          const response = await fetch(`/api/users/check-phone?${params}`);
          const data = await response.json();
          
          if (!data.available) {
            setErrors(prev => ({ ...prev, phoneNumber: 'Этот номер уже используется' }));
          } else {
            setErrors(prev => ({ ...prev, phoneNumber: undefined }));
          }
        }
      } else {
        setErrors(prev => ({ ...prev, phoneNumber: 'Неверный формат номера' }));
      }
    } catch (err) {
      console.error('Failed to validate phone number:', err);
      setErrors(prev => ({ ...prev, phoneNumber: 'Неверный формат номера' }));
    } finally {
      setIsCheckingPhone(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Сбрасываем ошибки при изменении любого поля
    setErrors({});

    // Проверяем username при изменении
    if (name === 'username') {
      checkUsername(value);
    }

    // Валидируем телефон при изменении
    if (name === 'phoneNumber') {
      validatePhoneNumber(value);
    }
  };

  // Проверка обязательных полей
  const validateRequiredFields = () => {
    // Проверяем только обязательные поля: ФИО, логин и пароль (при создании)
    return Boolean(formData.fullname.trim()) && 
           Boolean(formData.username.trim()) && 
           (!user ? Boolean(formData.password.trim()) : true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем наличие ошибок и обязательных полей
    if (Object.keys(errors).length > 0 || !validateRequiredFields()) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Подготавливаем данные, удаляя пустые значения
      const cleanedData = {
        ...formData,
        phoneNumber: formData.phoneNumber.trim() || null,
        telegramId: formData.telegramId.trim() || null,
        avatarUrl: formData.avatarUrl.trim() || null,
        points: user ? undefined : 0
      };

      await onSubmit(cleanedData);
      // Очищаем форму перед закрытием
      setFormData({
        fullname: '',
        username: '',
        phoneNumber: '',
        telegramId: '',
        role: 'STUDENT',
        language: 'KYRGYZ',
        password: '',
        avatarUrl: '',
      });
      setErrors({});
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'error' in err) {
        // Если сервер вернул объект с ошибкой
        setError((err as { error: string }).error);
      } else {
        setError('Произошла ошибка');
      }
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
          className="bg-[#19242a] rounded-lg w-full max-w-xl p-6 space-y-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#00ff41]/20 to-[#19242a] border-2 border-[#00ff41]/20 shadow-lg shadow-[#00ff41]/5">
              {formData.avatarUrl ? (
                <Image
                  src={formData.avatarUrl}
                  alt="Avatar"
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
                {user ? 'Редактировать пользователя' : 'Создать пользователя'}
              </h2>
              <input
                type="text"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="URL фотографии (необязательно)"
                className="w-full px-3 py-1.5 rounded-lg border border-[#667177]/10 bg-[#161b1e] text-white placeholder-[#667177] text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#161b1e] rounded-xl border border-[#667177]/10 overflow-hidden">
              {/* Основная информация */}
              <div className="p-4 space-y-4">
                <h3 className="text-sm font-medium text-[#00ff41] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Основная информация
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-[#667177] mb-1">
                      ФИО
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      required
                      value={formData.fullname}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#667177]/10 bg-[#19242a] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41] hover:border-[#00ff41]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#667177] mb-1">
                      Логин
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.username 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-[#667177]/10 focus:ring-[#00ff41] hover:border-[#00ff41]/20'
                        } bg-[#19242a] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
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
                      <label className="block text-sm text-[#667177] mb-1">
                        Пароль
                      </label>
                      <input
                        type="password"
                        name="password"
                        required={!user}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-[#667177]/10 bg-[#19242a] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41] hover:border-[#00ff41]/20 transition-colors"
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* Контактная информация */}
              <div className="p-4 space-y-4 border-t border-[#667177]/10">
                <h3 className="text-sm font-medium text-[#00ff41] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Контактная информация
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#667177] mb-1">
                      Телефон
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="+996700123456"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.phoneNumber 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-[#667177]/10 focus:ring-[#00ff41] hover:border-[#00ff41]/20'
                        } bg-[#19242a] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                      />
                      {isCheckingPhone && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin w-4 h-4 border-2 border-[#00ff41] border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-[#667177] mb-1">
                      Telegram ID
                    </label>
                    <input
                      type="text"
                      name="telegramId"
                      value={formData.telegramId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#667177]/10 bg-[#19242a] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41] hover:border-[#00ff41]/20 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Настройки */}
              <div className="p-4 space-y-4 border-t border-[#667177]/10">
                <h3 className="text-sm font-medium text-[#00ff41] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Настройки
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#667177] mb-1">
                      Язык
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#667177]/10 bg-[#19242a] text-white focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41] hover:border-[#00ff41]/20 transition-colors"
                    >
                      {Object.entries(languageLabels).map(([lang, label]) => (
                        <option key={lang} value={lang}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#667177] mb-1">
                      Роль
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#667177]/10 bg-[#19242a] text-white focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41] hover:border-[#00ff41]/20 transition-colors"
                    >
                      {Object.entries(roleLabels).map(([role, label]) => (
                        <option key={role} value={role}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-center text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading || isCheckingUsername || isCheckingPhone || Object.keys(errors).length > 0 || !validateRequiredFields()}
                className="flex-1 px-4 py-2 rounded-lg bg-[#00ff41] text-[#161b1e] font-medium 
                  hover:bg-[#00ff41]/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00ff41]/20
                  transition-all duration-200 ease-in-out
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-[#667177]/10 text-white 
                  hover:bg-[#161b1e] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#667177]/20
                  transition-all duration-200 ease-in-out"
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