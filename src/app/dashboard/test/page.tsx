'use client';

import { useState, useEffect } from 'react';

const mockTests = [
  {
    id: 1,
    title: 'Математика 1',
    description: 'Пробный тест по математике (базовый уровень)',
    type: 'free',
    status: 'created',
    durationMinutes: 60,
    totalQuestions: 20,
    createdAt: '2024-07-28T10:00:00Z',
    updatedAt: '2024-07-28T10:00:00Z',
  },
  {
    id: 2,
    title: 'Аналогии',
    description: 'Пробный тест по аналогиям',
    type: 'paid',
    status: 'ready',
    durationMinutes: 45,
    totalQuestions: 15,
    createdAt: '2024-07-27T09:00:00Z',
    updatedAt: '2024-07-28T09:00:00Z',
  },
  // ... другие тесты
];

const typeLabels: Record<string, string> = { free: 'Бесплатный', paid: 'Платный' };
const statusLabels: Record<string, string> = { created: 'Создан', in_progress: 'В работе', ready: 'Готов' };
const typeColors: Record<string, string> = { free: 'text-green-400', paid: 'text-blue-400' };

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

// Вместо UsersIcon вставляю inline SVG file.svg
const TestIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clipRule="evenodd" fill="#00ff41" fillRule="evenodd"/>
  </svg>
);

export default function TestPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Модалка создания теста
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'free',
    durationMinutes: '',
    totalQuestions: '',
    trainers: [] as string[],
  });
  const [trainers, setTrainers] = useState<{id: number, fullname: string}[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [trainerSearch, setTrainerSearch] = useState('');
  const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setLoadingTrainers(true);
      fetch('/api/users?role=TRAINER&limit=100')
        .then(res => res.json())
        .then(data => setTrainers(data.users || []))
        .finally(() => setLoadingTrainers(false));
    }
  }, [isModalOpen]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, multiple, options } = e.target as HTMLSelectElement;
    if (multiple) {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setForm(f => ({ ...f, [name]: selected }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const filtered = mockTests
    .filter(t =>
      (!search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())) &&
      (!typeFilter || t.type === typeFilter) &&
      (!statusFilter || t.status === statusFilter)
    )
    .sort((a, b) => {
      if (sort === 'createdAt') {
        return sortDir === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === 'title') {
        return sortDir === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <TestIcon className="w-8 h-8" />
          <h1 className="text-xl lg:text-2xl font-bold text-white">Пробные тесты</h1>
        </div>
        <p className="text-[#667177] mt-2 text-sm lg:text-base">Управление пробными тестами</p>
      </div>

      {/* Поиск и добавление */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Поиск по названию или описанию"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#667177] bg-[#19242a] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
          />
        </div>
        <button
          className="px-6 py-2.5 rounded-lg bg-[#00ff41] text-[#161b1e] font-medium hover:bg-[#00ff41]/90 transition-colors whitespace-nowrap"
          onClick={() => setIsModalOpen(true)}
        >
          Добавить
        </button>
      </div>

      {/* Модальное окно создания теста */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#19242a] rounded-lg w-full max-w-md p-6 space-y-2" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Создать пробный тест</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#667177] mb-1">Название теста</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                  placeholder="Введите название"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#667177] mb-1">Описание теста</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                  placeholder="Введите описание"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#667177] mb-1">Тип теста</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                  required
                >
                  <option value="free">Бесплатный</option>
                  <option value="paid">Платный</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#667177] mb-1">Время (минут)</label>
                  <input
                    name="durationMinutes"
                    type="number"
                    min={1}
                    value={form.durationMinutes}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                    placeholder="150"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#667177] mb-1">Количество вопросов</label>
                  <input
                    name="totalQuestions"
                    type="number"
                    min={1}
                    value={form.totalQuestions}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                    placeholder="210"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#667177] mb-1">Тренеры</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск тренера..."
                    value={trainerSearch}
                    onChange={e => {
                      setTrainerSearch(e.target.value);
                      setShowTrainerDropdown(true);
                    }}
                    onFocus={() => setShowTrainerDropdown(true)}
                    className="w-full px-4 py-2 rounded-lg border border-[#667177] bg-[#161b1e] text-white placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
                  />
                  {showTrainerDropdown && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-[#161b1e] border border-[#667177] rounded-lg max-h-40 overflow-y-auto shadow-lg">
                      {loadingTrainers ? (
                        <div className="p-2 text-[#667177] text-sm">Загрузка...</div>
                      ) : trainers.length === 0 ? (
                        <div className="p-2 text-[#667177] text-sm">Нет тренеров</div>
                      ) : (
                        trainers
                          .filter(tr =>
                            tr.fullname.toLowerCase().includes(trainerSearch.toLowerCase()) &&
                            !form.trainers.includes(String(tr.id))
                          )
                          .slice(0, 10)
                          .map(tr => (
                            <div
                              key={tr.id}
                              className="px-4 py-2 cursor-pointer hover:bg-[#232f36] text-white"
                              onClick={() => {
                                setForm(f => ({ ...f, trainers: [...f.trainers, String(tr.id)] }));
                                setTrainerSearch('');
                                setShowTrainerDropdown(false);
                              }}
                            >
                              {tr.fullname}
                            </div>
                          ))
                      )}
                    </div>
                  )}
                  {/* Выбранные тренеры */}
                  {form.trainers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.trainers.map(id => {
                        const tr = trainers.find(t => String(t.id) === id);
                        if (!tr) return null;
                        return (
                          <span key={id} className="flex items-center bg-[#232f36] text-white px-3 py-1 rounded-full text-xs">
                            {tr.fullname}
                            <button
                              type="button"
                              className="ml-2 text-[#00ff41] hover:text-red-400"
                              onClick={() => setForm(f => ({ ...f, trainers: f.trainers.filter(tid => tid !== id) }))}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#667177] text-white hover:bg-[#161b1e] transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-[#00ff41] text-[#161b1e] font-medium hover:bg-[#00ff41]/90 transition-colors"
                  disabled
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Фильтры и сортировка */}
      <div className="flex flex-wrap gap-4">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[#667177] bg-[#19242a] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
        >
          <option value="">Все типы</option>
          <option value="free">Бесплатный</option>
          <option value="paid">Платный</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[#667177] bg-[#19242a] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]"
        >
          <option value="">Все статусы</option>
          <option value="created">Создан</option>
          <option value="in_progress">В работе</option>
          <option value="ready">Готов</option>
        </select>
        <button
          className={`px-4 py-2 rounded-lg border border-[#667177] bg-[#19242a] text-white text-xs hover:bg-[#161b1e] transition-colors ${sort === 'createdAt' ? 'bg-[#00ff41] text-[#161b1e]' : ''}`}
          onClick={() => { setSort('createdAt'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}
        >
          Сортировать по дате {sort === 'createdAt' && (sortDir === 'asc' ? '▲' : '▼')}
        </button>
        <button
          className={`px-4 py-2 rounded-lg border border-[#667177] bg-[#19242a] text-white text-xs hover:bg-[#161b1e] transition-colors ${sort === 'title' ? 'bg-[#00ff41] text-[#161b1e]' : ''}`}
          onClick={() => { setSort('title'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}
        >
          Сортировать по названию {sort === 'title' && (sortDir === 'asc' ? '▲' : '▼')}
        </button>
      </div>

      {/* Таблица тестов */}
      <div className="bg-[#19242a] rounded-lg border border-[#667177]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#667177]/10 text-[#667177]">
                <th className="px-4 py-3">Название</th>
                <th className="px-4 py-3">Описание</th>
                <th className="px-4 py-3">Тип</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Вопросов</th>
                <th className="px-4 py-3">Длительность</th>
                <th className="px-4 py-3">Дата создания</th>
                <th className="px-4 py-3 w-20 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-[#667177] py-8">Нет пробных тестов</td>
                </tr>
              ) : (
                filtered.map(test => (
                  <tr key={test.id} className="border-b border-[#667177]/10 hover:bg-[#161b1e] transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-white font-medium">{test.title}</td>
                    <td className="px-4 py-3 text-[#b0b8be]">{test.description}</td>
                    <td className={`px-4 py-3 font-semibold ${typeColors[test.type]}`}>{typeLabels[test.type]}</td>
                    <td className="px-4 py-3">{statusLabels[test.status]}</td>
                    <td className="px-4 py-3 text-center">{test.totalQuestions}</td>
                    <td className="px-4 py-3 text-center">{test.durationMinutes} мин</td>
                    <td className="px-4 py-3 text-[#b0b8be]">{new Date(test.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          className="p-1 text-[#00ff41] hover:text-[#00ff41]/80 transition-colors"
                          title="Изменить"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="p-1 text-red-400 hover:text-red-400/80 transition-colors"
                          title="Удалить"
                        >
                          <DeleteIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Нижний блок с количеством */}
        <div className="px-4 py-3 border-t border-[#667177]/10 flex justify-between items-center">
          <div className="text-sm text-[#667177]">
            Всего: <span className="font-bold text-white">{filtered.length}</span> тест(ов)
          </div>
        </div>
      </div>
    </div>
  );
} 