'use client';

import React from 'react';
import { Question } from '../types';
import DynamicRichTextEditor from './DynamicRichTextEditor';

interface DefaultFormProps {
  question: Question;
  index: number;
  handleQuestionChange: (index: number, field: keyof Question, value: string | number) => void;
}

const DefaultForm: React.FC<DefaultFormProps> = ({ question, index, handleQuestionChange }) => {
  return (
    <>
      {/* Текст вопроса */}
      <div className="relative group/field">
        <label className="block text-[#667177] text-xs mb-2 group-hover/field:text-[#00ff41] transition-colors duration-200">
          Текст вопроса
        </label>
        <DynamicRichTextEditor
          value={question.questionText}
          onChange={(value) => handleQuestionChange(index, 'questionText', value)}
          placeholder="Введите текст вопроса"
        />
      </div>

      {/* Варианты ответов */}
      <div className="space-y-4">
        <label className="block text-[#667177] text-xs mb-2">Варианты ответов</label>
        <div className="grid grid-cols-2 gap-4">
          {['A', 'B', 'C', 'D'].map((option) => (
            <div 
              key={option}
              className={`relative group/field rounded-xl border border-[#667177]/20 bg-[#161b1e]/50 p-4
                hover:border-[#667177]/40 transition-all duration-200
                ${question.correctOption === option.toLowerCase() ? 'ring-2 ring-[#00ff41]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                  ${question.correctOption === option.toLowerCase()
                    ? 'bg-[#00ff41]/20 text-[#00ff41]'
                    : 'bg-[#667177]/20 text-[#667177]'
                  }`}>
                  {option}
                </div>
                <input
                  type="text"
                  value={question[`option${option}` as keyof Question]}
                  onChange={e => handleQuestionChange(index, `option${option}` as keyof Question, e.target.value)}
                  className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0
                    placeholder-[#667177]"
                  placeholder={`Введите вариант ${option}`}
                />
                <button
                  type="button"
                  onClick={() => handleQuestionChange(index, 'correctOption', option.toLowerCase())}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                    ${question.correctOption === option.toLowerCase()
                      ? 'bg-[#00ff41] text-[#161b1e]'
                      : 'bg-[#667177]/20 text-[#667177] hover:bg-[#667177]/40'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DefaultForm;