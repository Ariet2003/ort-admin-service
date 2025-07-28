'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '@prisma/client';
import Image from 'next/image';
import UserModal from '@/components/UserModal';
import UserDetailsModal from '@/components/UserDetailsModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

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

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

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

const EditIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SortIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const UserIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const UsersIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

type SortOption = 'fullname_asc' | 'fullname_desc' | 'points_desc' | 'points_asc';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [sortBy, setSortBy] = useState<SortOption>('fullname_asc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pageInput, setPageInput] = useState('1');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
      });

      if (search) searchParams.set('search', search);
      if (selectedRole) searchParams.set('role', selectedRole);

      const response = await fetch(`/api/users?${searchParams}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setUsers(data.users);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить список пользователей');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search, selectedRole, sortBy]);

  const handleDelete = async (user: User) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      const response = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      fetchUsers();
      setIsDeleteModalOpen(false);
      setDeletingUser(null);
      if (viewingUser?.id === deletingUser.id) {
        setIsDetailsModalOpen(false);
        setViewingUser(null);
      }
    } catch (err) {
      setError('Не удалось удалить пользователя');
      console.error(err);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (userData: any) => {
    try {
      const url = editingUser 
        ? `/api/users/${editingUser.id}`
        : '/api/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Произошла ошибка');
      }

      fetchUsers();
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      throw err;
    }
  };

  const handleRowClick = (user: User) => {
    setViewingUser(user);
    setIsDetailsModalOpen(true);
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const renderPageButton = (page: number) => (
      <button
        key={page}
        onClick={() => setPagination(prev => ({ ...prev, page }))}
        className={`px-3 py-1 rounded ${
          pagination.page === page
            ? 'bg-[#00ff41] text-[#161b1e]'
            : 'text-[#667177] hover:text-white'
        }`}
      >
        {page}
      </button>
    );

    const renderEllipsis = (key: string) => (
      <span key={key} className="px-2 text-[#667177]">...</span>
    );

    let pages = [];
    const lastPage = pagination.pages;

    // Первые 3 страницы
    for (let i = 1; i <= Math.min(3, lastPage); i++) {
      pages.push(renderPageButton(i));
    }

    // Средняя часть
    if (pagination.page > 4) {
      pages.push(renderEllipsis('start'));
    }

    // Текущая страница и её окружение
    if (pagination.page > 3 && pagination.page < lastPage - 2) {
      pages.push(
        <div key="current" className="flex items-center gap-2">
          <input
            type="number"
            value={pageInput}
            onChange={(e) => {
              const value = e.target.value;
              setPageInput(value);
              const page = parseInt(value);
              if (page >= 1 && page <= pagination.pages) {
                setPagination(prev => ({ ...prev, page }));
              }
            }}
            onBlur={() => {
              setPageInput(pagination.page.toString());
            }}
            className="w-16 px-2 py-1 rounded bg-[#161b1e] border border-[#667177] text-white text-center"
            min={1}
            max={pagination.pages}
          />
        </div>
      );
    }

    if (pagination.page < lastPage - 3) {
      pages.push(renderEllipsis('end'));
    }

    // Последние 3 страницы
    if (lastPage > 3) {
      for (let i = Math.max(lastPage - 2, 4); i <= lastPage; i++) {
        pages.push(renderPageButton(i));
      }
    }

    return (
      <div className="flex gap-2 items-center">
        {pages}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <UsersIcon className="w-8 h-8 text-[#00ff41]" />
          <h1 className="text-xl lg:text-2xl font-bold text-white">
            Пользователи
          </h1>
        </div>
        <p className="text-[#667177] mt-2 text-sm lg:text-base">
          Управление пользователями системы
        </p>
      </div>

      {/* Поиск и добавление */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Поиск по имени или логину"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#667177] bg-[#19242a] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
          />
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="px-6 py-2.5 rounded-lg bg-[#00ff41] text-[#161b1e] font-medium hover:bg-[#00ff41]/90 transition-colors whitespace-nowrap"
        >
          Добавить
        </button>
      </div>

      {/* Фильтры и сортировка */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
          className="px-4 py-2 rounded-lg border border-[#667177] bg-[#19242a] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
        >
          <option value="">Все роли</option>
          {Object.entries(roleLabels).map(([role, label]) => (
            <option key={role} value={role}>
              {label}
            </option>
          ))}
        </select>
        <button
          className={`px-4 py-2 rounded-lg border border-[#667177] bg-[#19242a] text-white text-xs hover:bg-[#161b1e] transition-colors ${sortBy.startsWith('fullname') ? 'bg-[#00ff41] text-[#161b1e]' : ''}`}
          onClick={() => setSortBy(sortBy === 'fullname_asc' ? 'fullname_desc' : 'fullname_asc')}
        >
          Сортировать по ФИО {sortBy.startsWith('fullname') && (sortBy.endsWith('asc') ? '▲' : '▼')}
        </button>
        <button
          className={`px-4 py-2 rounded-lg border border-[#667177] bg-[#19242a] text-white text-xs hover:bg-[#161b1e] transition-colors ${sortBy.startsWith('points') ? 'bg-[#00ff41] text-[#161b1e]' : ''}`}
          onClick={() => setSortBy(sortBy === 'points_asc' ? 'points_desc' : 'points_asc')}
        >
          Сортировать по баллам {sortBy.startsWith('points') && (sortBy.endsWith('asc') ? '▲' : '▼')}
        </button>
      </div>

      {/* Таблица пользователей */}
      <div className="bg-[#19242a] rounded-lg border border-[#667177]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#667177]/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-[#667177]">Фото</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#667177]">ФИО</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#667177]">Логин</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#667177]">Телефон</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#667177]">Роль</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#667177]">Баллы</th>
                <th className="px-4 py-3 w-20 text-right text-sm font-medium text-[#667177]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleRowClick(user)}
                  className="border-b border-[#667177]/10 hover:bg-[#161b1e] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-2">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#161b1e] border border-[#667177]/20">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.fullname}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-[#667177]" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{user.fullname}</td>
                  <td className="px-4 py-3 text-sm text-white">{user.username}</td>
                  <td className="px-4 py-3 text-sm text-white">{user.phoneNumber || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{user.points}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-[#00ff41] hover:text-[#00ff41]/80 transition-colors"
                        title="Изменить"
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1 text-red-400 hover:text-red-400/80 transition-colors"
                        title="Удалить"
                      >
                        <DeleteIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-[#667177]/10 flex justify-between items-center">
            <div className="text-sm text-[#667177]">
              Всего: {pagination.total}
            </div>
            {renderPagination()}
          </div>
        )}
      </div>

      {/* Модальные окна */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleSubmit}
        user={editingUser}
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingUser(null);
        }}
        onEdit={() => {
          setIsDetailsModalOpen(false);
          setEditingUser(viewingUser);
          setIsModalOpen(true);
        }}
        onDelete={() => {
          if (viewingUser) handleDelete(viewingUser);
        }}
        user={viewingUser}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUser(null);
        }}
        onConfirm={confirmDelete}
        userName={deletingUser?.fullname || ''}
      />

      {/* Сообщение об ошибке */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <p className="text-sm text-center text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Индикатор загрузки */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="bg-[#19242a] p-6 rounded-lg">
              <div className="animate-spin w-8 h-8 border-4 border-[#00ff41] border-t-transparent rounded-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 