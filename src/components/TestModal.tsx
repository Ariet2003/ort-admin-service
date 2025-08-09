'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/contexts/ToastContext';

type Language = 'KYRGYZ' | 'RUSSIAN';

interface Test {
  id: number;
  title: string;
  description: string;
  language: Language;
  type: string;
  durationMinutes: number;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (testData: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  test?: Test | null;
}

const languageLabels: Record<Language, string> = {
  KYRGYZ: 'Кыргызский',
  RUSSIAN: 'Русский',
};

const typeLabels: Record<string, string> = {
  free: 'Бесплатный',
  paid: 'Платный',
};

export default function TestModal({ isOpen, onClose, onSubmit, test }: Props) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'KYRGYZ' as Language,
    type: 'paid',
    durationMinutes: '150',
    totalQuestions: '210',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title,
        description: test.description,
        language: test.language,
        type: test.type || 'paid',
        durationMinutes: String(test.durationMinutes) || '150',
        totalQuestions: String(test.totalQuestions) || '210',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        language: 'KYRGYZ',
        type: 'paid',
        durationMinutes: '150',
        totalQuestions: '210',
      });
    }
  }, [test]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Очищаем ошибку при изменении любого поля
  };

  const validateRequiredFields = () => {
    // Проверяем, что все обязательные поля заполнены
    const hasTitle = Boolean(formData.title.trim());
    const hasDescription = Boolean(formData.description.trim());
    const hasLanguage = Boolean(formData.language);

    console.log('Form Validation:', {
      title: formData.title,
      description: formData.description,
      language: formData.language,
      hasTitle,
      hasDescription,
      hasLanguage
    });

    return hasTitle && hasDescription && hasLanguage;
  };

  const handleSubmit = async () => {
    if (!validateRequiredFields()) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Преобразуем числовые поля
    const submitData = {
      ...formData,
      durationMinutes: parseInt(formData.durationMinutes),
      totalQuestions: parseInt(formData.totalQuestions),
    };

    console.log('Submitting test data:', submitData);

    setIsLoading(true);

    try {
      await onSubmit(submitData);
      showToast(
        test 
          ? 'Тест успешно обновлен' 
          : 'Тест успешно создан',
        'success'
      );
      setFormData({
        title: '',
        description: '',
        language: 'KYRGYZ',
        type: 'paid',
        durationMinutes: '150',
        totalQuestions: '210',
      });
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Произошла ошибка при сохранении теста';
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
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
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#00ff41]/20 to-[#19242a] border-2 border-[#00ff41]/20 shadow-lg shadow-[#00ff41]/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#00ff41]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">
              {test ? 'Редактировать тест' : 'Создать тест'}
            </h2>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }} className="space-y-6">
            <div className="bg-[#161b1e] rounded-xl border border-[#667177]/10 overflow-hidden">
              {/* Основная информация */}
              <div className="p-4 space-y-4">
                <h3 className="text-sm font-medium text-[#00ff41] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Основная информация
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#667177] mb-1">
                      Название
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#667177]/10 bg-[#19242a] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41] hover:border-[#00ff41]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#667177] mb-1">
                      Описание
                    </label>
                    <textarea
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-[#667177]/10 bg-[#19242a] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41] hover:border-[#00ff41]/20 transition-colors resize-none"
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
                      Тип теста
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#667177]/10 bg-[#19242a] text-white focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41] hover:border-[#00ff41]/20 transition-colors"
                    >
                      {Object.entries(typeLabels).map(([type, label]) => (
                        <option key={type} value={type}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#667177] mb-1">
                      Длительность (минут)
                    </label>
                    <input
                      type="number"
                      name="durationMinutes"
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-[#667177]/10 bg-[#19242a] text-white focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41] hover:border-[#00ff41]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#667177] mb-1">
                      Количество вопросов
                    </label>
                    <input
                      type="number"
                      name="totalQuestions"
                      value={formData.totalQuestions}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-[#667177]/10 bg-[#19242a] text-white focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41] hover:border-[#00ff41]/20 transition-colors"
                    />
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
                disabled={isLoading || !validateRequiredFields()}
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
