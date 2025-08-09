'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TooltipButton from './TooltipButton';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}


const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  // Функция для преобразования выделенного текста в верхний регистр
  const transformToUpperCase = (editor: any) => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);
    editor.commands.setTextSelection({ from, to });
    editor.commands.insertContent(text.toUpperCase());
  };

  // Функция для преобразования выделенного текста в нижний регистр
  const transformToLowerCase = (editor: any) => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);
    editor.commands.setTextSelection({ from, to });
    editor.commands.insertContent(text.toLowerCase());
  };
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Отключаем ненужные функции
        bulletList: false,
        orderedList: false,
        heading: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
        codeBlock: false,
        // Включаем поддержку пустых параграфов
        paragraph: {
          HTMLAttributes: {
            class: 'empty-paragraph',
          },
        },
      }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: ({ editor }) => {
      // При фокусе восстанавливаем контент
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[120px] px-4 py-3 focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  // Эффект для обновления содержимого при изменении value
  React.useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#667177]/20 bg-[#161b1e]/50 overflow-hidden
      focus-within:ring-2 focus-within:ring-[#00ff41] focus-within:border-[#00ff41]
      hover:border-[#667177]/40 transition-all duration-200">
      {/* Панель инструментов */}
      <div className="flex items-center gap-1 p-2 border-b border-[#667177]/10">
        {/* Жирный */}
        <TooltipButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          tooltip="Жирный текст"
          className="p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
          </svg>
        </TooltipButton>

        {/* Курсив */}
        <TooltipButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          tooltip="Курсивный текст"
          className="p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L9 19M15 5L13 19" />
          </svg>
        </TooltipButton>

        {/* Подчеркнутый */}
        <TooltipButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          tooltip="Подчеркнутый текст"
          className="p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M7 19h10" />
          </svg>
        </TooltipButton>

        {/* Верхний регистр */}
        <TooltipButton
          onClick={() => transformToUpperCase(editor)}
          tooltip="Верхний регистр"
          className="p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20"
        >
          <span className="w-5 h-5 flex items-center justify-center font text-lg">А</span>
        </TooltipButton>

        {/* Нижний регистр */}
        <TooltipButton
          onClick={() => transformToLowerCase(editor)}
          tooltip="Нижний регистр"
          className="p-2 rounded-lg transition-all duration-200 hover:bg-[#667177]/20"
        >
          <span className="w-5 h-5 flex items-center justify-center font text-lg">а</span>
        </TooltipButton>
      </div>

      {/* Редактор */}
      <div className="relative">
        <EditorContent editor={editor} />
        {/* Плейсхолдер */}
        {editor.isEmpty && placeholder && (
          <div className="absolute top-3 left-4 text-[#667177] pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;