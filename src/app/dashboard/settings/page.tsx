'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface Settings {
  company_name: string;
  company_logo: string;
  openai_api_key: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    company_name: '',
    company_logo: '',
    openai_api_key: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Преобразуем массив настроек в объект
      const settingsObject = data.reduce((acc: Settings, setting: { key: string; value: string }) => {
        acc[setting.key as keyof Settings] = setting.value;
        return acc;
      }, {} as Settings);

      setSettings({
        company_name: settingsObject.company_name || '',
        company_logo: settingsObject.company_logo || '',
        openai_api_key: settingsObject.openai_api_key || '',
      });
    } catch (err) {
      setError('Не удалось загрузить настройки');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setSuccessMessage('Настройки успешно сохранены');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Не удалось сохранить настройки');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#00ff41] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-[#00ff41]" />
          <h1 className="text-xl lg:text-2xl font-bold text-white">
            Настройки
          </h1>
        </div>
        <p className="text-[#667177] mt-2 text-sm lg:text-base">
          Управление настройками системы
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#19242a] rounded-lg border border-[#667177]/10 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-white mb-4">Настройки компании</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#667177] mb-1">
                  Название компании
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={settings.company_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                  placeholder="Введите название компании"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#667177] mb-1">
                  URL логотипа
                </label>
                <input
                  type="text"
                  name="company_logo"
                  value={settings.company_logo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                  placeholder="Введите URL логотипа"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-4">API ключи</h2>
            <div>
              <label className="block text-sm font-medium text-[#667177] mb-1">
                OpenAI API ключ
              </label>
              <input
                type="password"
                name="openai_api_key"
                value={settings.openai_api_key}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                placeholder="Введите API ключ OpenAI"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-[#00ff41] text-sm"
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded-lg bg-[#00ff41] text-[#161b1e] font-medium hover:bg-[#00ff41]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
} 