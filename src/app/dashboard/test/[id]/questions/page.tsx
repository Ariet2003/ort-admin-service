'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { Question } from './types';
import { QuestionIcon, ImageIcon, DeleteIcon, AddIcon, TrashIcon } from './icons';
import Math1Form from './components/Math1Form';
import DefaultForm from './components/DefaultForm';

const subjectTypeLabels: Record<string, string> = {
  math1: 'Математика 1',
  math2: 'Математика 2',
  analogy: 'Аналогии',
  reading: 'Чтение',
  grammar: 'Грамматика',
};

const emptyQuestion: Question = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  subjectType: 'math1',
  correctOption: 'a',
  points: 1,
};

const QuestionsPage: React.FC = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchTestAndQuestions = async () => {
      try {
        setLoading(true);
        const [testRes, questionsRes] = await Promise.all([
          fetch(`/api/trial-tests/${id}`),
          fetch(`/api/trial-tests/${id}/questions`),
        ]);

        if (!testRes.ok || !questionsRes.ok) {
          throw new Error('Ошибка загрузки данных');
        }

        const [testData, questionsData] = await Promise.all([
          testRes.json(),
          questionsRes.json(),
        ]);

        setTest(testData);
        setQuestions(questionsData.questions.length > 0 ? questionsData.questions : [{ ...emptyQuestion }]);
      } catch (error) {
        showToast('Ошибка при загрузке данных', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTestAndQuestions();
  }, [id, showToast]);

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Размер файла не должен превышать 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => ({ ...prev, [index]: reader.result as string }));
        setQuestions(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], imageUrl: reader.result as string };
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImagePreview(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], imageUrl: undefined };
      return updated;
    });
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string | number) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveQuestion = async (index: number) => {
    const question = questions[index];
    const isMath1 = question.subjectType === 'math1';

    // Проверяем обязательные поля в зависимости от типа вопроса
    if (!question.questionText || !question.optionA || !question.optionB) {
      showToast('Заполните все обязательные поля', 'error');
      return;
    }

    // Для обычных вопросов проверяем все варианты ответов
    if (!isMath1 && (!question.optionC || !question.optionD)) {
      showToast('Заполните все варианты ответов', 'error');
      return;
    }

    // Для math1 проверяем наличие изображения
    if (isMath1 && !question.imageUrl) {
      showToast('Загрузите изображение для вопроса', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/trial-tests/${id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...question, creatorId: 1 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка при сохранении вопроса');
      }

      const savedQuestion = await response.json();
      setQuestions(prev => {
        const updated = [...prev];
        updated[index] = savedQuestion;
        return updated;
      });
      showToast('Вопрос успешно сохранен', 'success');
    } catch (error: any) {
      showToast(error.message || 'Ошибка при сохранении вопроса', 'error');
    }
  };

  const handleDeleteQuestion = async (index: number) => {
    const question = questions[index];
    if (!question.id) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
      return;
    }

    try {
      const response = await fetch(`/api/trial-tests/${id}/questions/${question.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении вопроса');
      }

      setQuestions(prev => prev.filter((_, i) => i !== index));
      showToast('Вопрос успешно удален', 'success');
    } catch (error) {
      showToast('Ошибка при удалении вопроса', 'error');
    }
  };

  const addNewQuestion = () => {
    setQuestions(prev => [...prev, { ...emptyQuestion }]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#667177]">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Заголовок */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <QuestionIcon className="w-8 h-8 text-[#00ff41]" />
          <h1 className="text-xl lg:text-2xl font-bold text-white">Вопросы теста</h1>
        </div>
        <p className="text-[#667177] mt-2 text-sm lg:text-base">
          {test?.title} - {test?.description}
        </p>
      </div>

      {/* Список вопросов */}
      <div className="space-y-8">
        {questions.map((question, index) => (
          <div 
            key={index} 
            className="bg-gradient-to-br from-[#19242a] to-[#161b1e] rounded-2xl border border-[#667177]/10 shadow-lg
              hover:shadow-xl hover:shadow-[#00ff41]/5 transition-all duration-300 ease-in-out
              group relative overflow-hidden"
          >
            {/* Декоративная полоса сверху */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00ff41]/40 via-[#00ff41] to-[#00ff41]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Заголовок вопроса */}
            <div className="flex items-center justify-between gap-4 p-6 border-b border-[#667177]/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00ff41]/10 text-[#00ff41]">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold text-white">Вопрос {index + 1}</h3>
              </div>
              <button
                onClick={() => handleDeleteQuestion(index)}
                className="text-red-400 hover:text-red-400/80 hover:scale-110 transition-all duration-200 ease-in-out
                  opacity-60 hover:opacity-100"
              >
                <DeleteIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Основное содержимое */}
            <div className="p-6 space-y-8">
              {/* Тип предмета */}
              <div className="relative group/field">
                <label className="block text-[#667177] text-xs mb-2 group-hover/field:text-[#00ff41] transition-colors duration-200">
                  Тип предмета
                </label>
                <div className="relative">
                  <select
                    value={question.subjectType}
                    onChange={e => handleQuestionChange(index, 'subjectType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#667177]/20 bg-[#161b1e]/50 text-white 
                      focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]
                      hover:border-[#667177]/40 transition-all duration-200 appearance-none"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  >
                    {Object.entries(subjectTypeLabels).map(([value, label]) => (
                      <option 
                        key={value} 
                        value={value}
                        className="bg-[#161b1e] text-white hover:bg-[#19242a] py-2"
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#667177]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Изображение (только для math1) */}
              {question.subjectType === 'math1' && (
                <div className="relative group/field">
                  <label className="block text-[#667177] text-xs mb-2 group-hover/field:text-[#00ff41] transition-colors duration-200">
                    Изображение
                  </label>
                  <div className="flex flex-col gap-4">
                    {(imagePreview[index] || question.imageUrl) && (
                      <div className="relative group/image max-w-lg mx-auto">
                        <img 
                          src={imagePreview[index] || question.imageUrl} 
                          alt="Preview" 
                          className="w-full h-[200px] object-contain rounded-xl border border-[#667177]/20
                            group-hover/image:border-[#00ff41]/20 transition-all duration-200" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100
                          transition-opacity duration-200 rounded-xl flex items-center justify-center gap-4">
                          <label
                            htmlFor={`imageUpload-${index}`}
                            className="px-3 py-1.5 rounded-lg bg-[#00ff41]/20 text-[#00ff41] text-xs cursor-pointer
                              hover:bg-[#00ff41]/30 transition-all duration-200"
                          >
                            Заменить
                          </label>
                          <button
                            onClick={() => handleDeleteImage(index)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs
                              hover:bg-red-500/30 transition-all duration-200"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageChange(index, e)}
                        className="hidden"
                        id={`imageUpload-${index}`}
                      />
                      {!imagePreview[index] && !question.imageUrl && (
                        <label
                          htmlFor={`imageUpload-${index}`}
                          className="px-4 py-2.5 rounded-xl border border-[#667177]/20 text-white text-sm cursor-pointer
                            hover:bg-[#161b1e]/80 hover:border-[#667177]/40 hover:scale-[1.02] hover:shadow-lg 
                            hover:shadow-[#667177]/20 transition-all duration-200 flex items-center gap-2
                            group-hover/field:border-[#00ff41]/20 group-hover/field:shadow-[#00ff41]/10"
                        >
                          <ImageIcon className="w-5 h-5" />
                          Загрузить изображение
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Форма в зависимости от типа */}
              {question.subjectType === 'math1' ? (
                <Math1Form
                  question={question}
                  index={index}
                  handleQuestionChange={handleQuestionChange}
                />
              ) : (
                <DefaultForm
                  question={question}
                  index={index}
                  handleQuestionChange={handleQuestionChange}
                />
              )}

              {/* Объяснение */}
              <div className="relative group/field">
                <label className="block text-[#667177] text-xs mb-2 group-hover/field:text-[#00ff41] transition-colors duration-200">
                  Объяснение (необязательно)
                </label>
                <textarea
                  value={question.explanation || ''}
                  onChange={e => handleQuestionChange(index, 'explanation', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#667177]/20 bg-[#161b1e]/50 text-white 
                    placeholder-[#667177] focus:outline-none focus:ring-2 focus:ring-[#00ff41] focus:border-[#00ff41]
                    hover:border-[#667177]/40 transition-all duration-200 min-h-[100px] resize-y"
                  placeholder="Объяснение правильного ответа"
                />
              </div>

              {/* Кнопка сохранения */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleSaveQuestion(index)}
                  className="px-6 py-2.5 rounded-xl bg-[#00ff41] text-[#161b1e] font-medium
                    hover:bg-[#00ff41]/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00ff41]/20
                    transition-all duration-200 ease-in-out"
                >
                  {question.id ? 'Сохранить изменения' : 'Сохранить вопрос'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка добавления нового вопроса */}
      <button
        onClick={addNewQuestion}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-[#667177]/40 text-[#667177] 
          hover:border-[#00ff41] hover:text-[#00ff41] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00ff41]/20
          transition-all duration-200 ease-in-out flex items-center justify-center gap-2
          bg-gradient-to-br from-[#19242a] to-[#161b1e]"
      >
        <AddIcon className="w-6 h-6" />
        Добавить вопрос
      </button>
    </div>
  );
};

export default QuestionsPage;