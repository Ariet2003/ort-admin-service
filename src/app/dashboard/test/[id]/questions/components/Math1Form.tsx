'use client';

import React, { useState } from 'react';
import { Question } from '../types';
import DynamicRichTextEditor from './DynamicRichTextEditor';
import { MathJaxContext, MathJax } from 'better-react-mathjax';
import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline';

import TooltipButton from './TooltipButton';

interface Math1FormProps {
  question: Question;
  index: number;
  handleQuestionChange: (index: number, field: keyof Question, value: string | number) => void;
}

const config = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]]
  }
};


const Math1Form: React.FC<Math1FormProps> = ({ question, index, handleQuestionChange }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isPreviewColumnA, setIsPreviewColumnA] = useState(false);
  const [isPreviewColumnB, setIsPreviewColumnB] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAiProcessingColumnA, setIsAiProcessingColumnA] = useState(false);
  const [isAiProcessingColumnB, setIsAiProcessingColumnB] = useState(false);
  // Функция для загрузки изображения в S3
  const uploadImageToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleAiFormat = async (field: 'questionText' | 'optionA' | 'optionB') => {
    const setProcessingState = {
      questionText: setIsAiProcessing,
      optionA: setIsAiProcessingColumnA,
      optionB: setIsAiProcessingColumnB
    }[field];

    try {
      setProcessingState(true);
      
      const response = await fetch('/api/ai/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: question[field],
          // TODO: Добавить определение языка на основе контента или настроек
          language: 'ru'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to format content');
      }

      const data = await response.json();
      handleQuestionChange(index, field, data.content);
    } catch (error) {
      console.error('Error formatting with AI:', error);
      // TODO: Добавить уведомление об ошибке
    } finally {
      setProcessingState(false);
    }
  };
  const options = [
    { value: 'a', label: 'Больше первая колонка' },
    { value: 'b', label: 'Больше вторая колонка' },
    { value: 'c', label: 'Равны' },
    { value: 'd', label: 'Нет правильного ответа' },
  ];

  return (
    <>

      {/* Текст вопроса */}
      <div className="relative group/field">
        <label className="block text-[#667177] text-xs mb-2 group-hover/field:text-[#00ff41] transition-colors duration-200">
          Текст вопроса
        </label>
        <div className="relative">
          <div className="absolute right-3 top-3 flex gap-2">
            {/* AI кнопка */}
            <TooltipButton
              onClick={() => handleAiFormat('questionText')}
              tooltip="AI форматирование"
              className={`p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20 ${
                isAiProcessing ? 'cursor-wait opacity-50' : ''
              }`}
              disabled={isAiProcessing}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                {isAiProcessing ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 animate-star1" viewBox="0 0 12 12">
                    <path d="M0.28125 5.5L0.8125 5.28125L1.0625 5.15625H1.09375L3.84375 3.875L5.125 1.09375L5.25 0.84375L5.5 0.3125C5.5625 0.125 5.75 0 5.9375 0C6.125 0 6.3125 0.125 6.40625 0.3125L6.65625 0.84375L6.75 1.09375L6.78125 1.125L8.03125 3.875L10.8125 5.15625L11.0625 5.28125L11.5938 5.53125C11.7812 5.59375 11.9062 5.78125 11.9062 5.96875C11.9062 6.15625 11.7812 6.34375 11.5938 6.4375L11.0625 6.65625L10.8125 6.78125L8.03125 8.0625L6.75 10.8125V10.8438L6.625 11.0938L6.40625 11.625C6.3125 11.8125 6.125 11.9375 5.9375 11.9375C5.75 11.9375 5.5625 11.8125 5.5 11.625L5.25 11.0938L5.125 10.8438V10.8125L3.84375 8.0625L1.09375 6.78125H1.0625L0.8125 6.65625L0.28125 6.4375C0.09375 6.34375 0 6.15625 0 5.96875C0 5.78125 0.09375 5.59375 0.28125 5.5Z" fill="currentColor"/>
                  </svg>
                )}
              </div>
            </TooltipButton>

            {/* Кнопка предпросмотра */}
            <TooltipButton
              onClick={() => setIsPreview(!isPreview)}
              tooltip={isPreview ? 'Редактировать' : 'Предпросмотр'}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20"
            >
              {isPreview ? (
                <PencilIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </TooltipButton>
          </div>
        </div>
        {isPreview ? (
          <MathJaxContext config={config}>
            <div className="w-full px-4 py-3 rounded-xl border border-[#667177]/20 bg-[#161b1e]/50 text-white min-h-[100px]">
              <MathJax>
                <div 
                  className="preview-content font-light [&_strong]:font-bold [&_em]:italic [&_u]:underline whitespace-pre-wrap"
                                      dangerouslySetInnerHTML={{ 
                      __html: question.questionText
                    }}
                />
              </MathJax>
            </div>
          </MathJaxContext>
        ) : (
          <DynamicRichTextEditor
            value={question.questionText}
            onChange={(value) => handleQuestionChange(index, 'questionText', value)}
            placeholder="Введите текст вопроса"
          />
        )}
      </div>

      {/* Колонки */}
      <div className="grid grid-cols-2 gap-6">
        {/* Первая колонка */}
        <div className="relative group/field">
          <label className="block text-[#667177] text-xs mb-2 group-hover/field:text-[#00ff41] transition-colors duration-200">
            Первая колонка
          </label>
          <div className="relative">
            <div className="absolute right-3 top-3 flex gap-2">
              <TooltipButton
                onClick={() => handleAiFormat('optionA')}
                tooltip="AI форматирование"
                className={`p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20 ${
                  isAiProcessingColumnA ? 'cursor-wait opacity-50' : ''
                }`}
                disabled={isAiProcessingColumnA}
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  {isAiProcessingColumnA ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 animate-star1" viewBox="0 0 12 12">
                      <path d="M0.28125 5.5L0.8125 5.28125L1.0625 5.15625H1.09375L3.84375 3.875L5.125 1.09375L5.25 0.84375L5.5 0.3125C5.5625 0.125 5.75 0 5.9375 0C6.125 0 6.3125 0.125 6.40625 0.3125L6.65625 0.84375L6.75 1.09375L6.78125 1.125L8.03125 3.875L10.8125 5.15625L11.0625 5.28125L11.5938 5.53125C11.7812 5.59375 11.9062 5.78125 11.9062 5.96875C11.9062 6.15625 11.7812 6.34375 11.5938 6.4375L11.0625 6.65625L10.8125 6.78125L8.03125 8.0625L6.75 10.8125V10.8438L6.625 11.0938L6.40625 11.625C6.3125 11.8125 6.125 11.9375 5.9375 11.9375C5.75 11.9375 5.5625 11.8125 5.5 11.625L5.25 11.0938L5.125 10.8438V10.8125L3.84375 8.0625L1.09375 6.78125H1.0625L0.8125 6.65625L0.28125 6.4375C0.09375 6.34375 0 6.15625 0 5.96875C0 5.78125 0.09375 5.59375 0.28125 5.5Z" fill="currentColor"/>
                    </svg>
                  )}
                </div>
              </TooltipButton>

              <TooltipButton
                onClick={() => setIsPreviewColumnA(!isPreviewColumnA)}
                tooltip={isPreviewColumnA ? 'Редактировать' : 'Предпросмотр'}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20"
              >
                {isPreviewColumnA ? (
                  <PencilIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </TooltipButton>
            </div>
          </div>
          {isPreviewColumnA ? (
            <MathJaxContext config={config}>
              <div className="w-full px-4 py-3 rounded-xl border border-[#667177]/20 bg-[#161b1e]/50 text-white min-h-[100px]">
                <MathJax>
                  <div 
                    className="preview-content font-light [&_strong]:font-bold [&_em]:italic [&_u]:underline whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: question.optionA
                    }}
                  />
                </MathJax>
              </div>
            </MathJaxContext>
          ) : (
            <DynamicRichTextEditor
              value={question.optionA}
              onChange={(value) => handleQuestionChange(index, 'optionA', value)}
              placeholder="Введите содержимое первой колонки"
            />
          )}
        </div>

        {/* Вторая колонка */}
        <div className="relative group/field">
          <label className="block text-[#667177] text-xs mb-2 group-hover/field:text-[#00ff41] transition-colors duration-200">
            Вторая колонка
          </label>
          <div className="relative">
            <div className="absolute right-3 top-3 flex gap-2">
              <TooltipButton
                onClick={() => handleAiFormat('optionB')}
                tooltip="AI форматирование"
                className={`p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20 ${
                  isAiProcessingColumnB ? 'cursor-wait opacity-50' : ''
                }`}
                disabled={isAiProcessingColumnB}
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  {isAiProcessingColumnB ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 animate-star1" viewBox="0 0 12 12">
                      <path d="M0.28125 5.5L0.8125 5.28125L1.0625 5.15625H1.09375L3.84375 3.875L5.125 1.09375L5.25 0.84375L5.5 0.3125C5.5625 0.125 5.75 0 5.9375 0C6.125 0 6.3125 0.125 6.40625 0.3125L6.65625 0.84375L6.75 1.09375L6.78125 1.125L8.03125 3.875L10.8125 5.15625L11.0625 5.28125L11.5938 5.53125C11.7812 5.59375 11.9062 5.78125 11.9062 5.96875C11.9062 6.15625 11.7812 6.34375 11.5938 6.4375L11.0625 6.65625L10.8125 6.78125L8.03125 8.0625L6.75 10.8125V10.8438L6.625 11.0938L6.40625 11.625C6.3125 11.8125 6.125 11.9375 5.9375 11.9375C5.75 11.9375 5.5625 11.8125 5.5 11.625L5.25 11.0938L5.125 10.8438V10.8125L3.84375 8.0625L1.09375 6.78125H1.0625L0.8125 6.65625L0.28125 6.4375C0.09375 6.34375 0 6.15625 0 5.96875C0 5.78125 0.09375 5.59375 0.28125 5.5Z" fill="currentColor"/>
                    </svg>
                  )}
                </div>
              </TooltipButton>

              <TooltipButton
                onClick={() => setIsPreviewColumnB(!isPreviewColumnB)}
                tooltip={isPreviewColumnB ? 'Редактировать' : 'Предпросмотр'}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20"
              >
                {isPreviewColumnB ? (
                  <PencilIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </TooltipButton>
            </div>
          </div>
          {isPreviewColumnB ? (
            <MathJaxContext config={config}>
              <div className="w-full px-4 py-3 rounded-xl border border-[#667177]/20 bg-[#161b1e]/50 text-white min-h-[100px]">
                <MathJax>
                  <div 
                    className="preview-content font-light [&_strong]:font-bold [&_em]:italic [&_u]:underline whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: question.optionB
                    }}
                  />
                </MathJax>
              </div>
            </MathJaxContext>
          ) : (
            <DynamicRichTextEditor
              value={question.optionB}
              onChange={(value) => handleQuestionChange(index, 'optionB', value)}
              placeholder="Введите содержимое второй колонки"
            />
          )}
        </div>
      </div>

      {/* Варианты ответов */}
      <div className="space-y-4">
        <label className="block text-[#667177] text-xs mb-2">Правильный ответ</label>
        <div className="grid grid-cols-2 gap-4">
          {options.map((option) => (
            <div 
              key={option.value}
              onClick={() => handleQuestionChange(index, 'correctOption', option.value)}
              className={`relative group/field rounded-xl border border-[#667177]/20 bg-[#161b1e]/50 p-4
                hover:border-[#667177]/40 transition-all duration-200 cursor-pointer
                ${question.correctOption === option.value ? 'ring-2 ring-[#00ff41]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                  ${question.correctOption === option.value
                    ? 'bg-[#00ff41]/20 text-[#00ff41]'
                    : 'bg-[#667177]/20 text-[#667177]'
                  }`}>
                  {option.value.toUpperCase()}
                </div>
                <span className="text-white">{option.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Math1Form;