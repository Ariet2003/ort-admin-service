'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon: (props: { className: string }) => JSX.Element;
}

interface Settings {
  company_name: string;
  company_logo: string;
}

const DashboardIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const UsersIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const TestIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const SettingsIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ReportsIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const navItems: NavItem[] = [
  { label: 'Дашборд', href: '/dashboard', icon: DashboardIcon },
  { label: 'Пользователи', href: '/dashboard/users', icon: UsersIcon },
  { label: 'Пробный тест', href: '/dashboard/test', icon: TestIcon },
  { label: 'Настройки', href: '/dashboard/settings', icon: SettingsIcon },
  { label: 'Отчеты', href: '/dashboard/reports', icon: ReportsIcon },
];

const MenuIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    company_name: 'ORT Admin',
    company_logo: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        // Находим нужные настройки из массива
        const companyName = data.find((setting: { key: string }) => setting.key === 'company_name')?.value || '';
        const companyLogo = data.find((setting: { key: string }) => setting.key === 'company_logo')?.value || '';

        setSettings({
          company_name: companyName,
          company_logo: companyLogo
        });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Закрываем меню при изменении маршрута на мобильных
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <>
      <div className="p-6">
        <div className="flex items-center gap-3">
          {settings.company_logo ? (
            <Image
              src={settings.company_logo}
              alt={settings.company_name}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : null}
          <h2 className="text-xl font-bold text-white">{settings.company_name}</h2>
        </div>
      </div>
      <nav className="mt-6 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg mb-1 ${
                isActive 
                  ? 'text-[#00ff41] bg-[#161b1e] border border-[#00ff41]' 
                  : 'text-[#667177] hover:text-white hover:bg-[#161b1e] border border-transparent'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${
                isActive ? 'text-[#00ff41]' : 'text-[#667177]'
              }`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Мобильная кнопка меню */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-[#19242a] text-[#667177] hover:text-white transition-colors"
      >
        {isOpen ? (
          <CloseIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      {/* Десктопная версия */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-64 bg-[#19242a] border-r border-[#667177]/10">
        {sidebarContent}
      </div>

      {/* Мобильная версия */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-[#19242a] border-r border-[#667177]/10 z-50 overflow-y-auto"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Отступ для контента на десктопе */}
      <div className="hidden lg:block w-64" />
    </>
  );
} 