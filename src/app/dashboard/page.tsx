'use client';

import { motion } from 'framer-motion';

const ManagerIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TeacherIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

const StudentIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const TestIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const PaymentIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  delay 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02 }}
    className="bg-[#19242a] p-4 lg:p-6 rounded-lg border border-[#667177]/10 relative overflow-hidden group"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[#667177] text-xs lg:text-sm font-medium mb-2">{title}</p>
        <p className="text-[#00ff41] text-xl lg:text-2xl font-bold">{value}</p>
      </div>
      <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-[#667177] group-hover:text-[#00ff41] transition-colors duration-200" />
    </div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00ff41]/0 group-hover:bg-[#00ff41]/20 transition-all duration-200" />
  </motion.div>
);

export default function DashboardPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl lg:text-2xl font-bold text-white">Панель управления</h1>
        <p className="text-[#667177] mt-2 text-sm lg:text-base">Добро пожаловать в панель управления</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-6">
        <StatCard
          title="Менеджеры"
          value="0"
          icon={ManagerIcon}
          delay={0.1}
        />
        <StatCard
          title="Преподаватели"
          value="0"
          icon={TeacherIcon}
          delay={0.2}
        />
        <StatCard
          title="Ученики"
          value="0"
          icon={StudentIcon}
          delay={0.3}
        />
        <StatCard
          title="Активные тесты"
          value="0"
          icon={TestIcon}
          delay={0.4}
        />
        <StatCard
          title="Оплаты за месяц"
          value="0 сом"
          icon={PaymentIcon}
          delay={0.5}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-[#19242a] p-4 lg:p-6 rounded-lg border border-[#667177]/10"
      >
        <h2 className="text-white font-medium mb-4 text-sm lg:text-base">Последние действия</h2>
        <div className="text-[#667177] text-xs lg:text-sm">
          Пока нет действий для отображения
        </div>
      </motion.div>
    </div>
  );
} 