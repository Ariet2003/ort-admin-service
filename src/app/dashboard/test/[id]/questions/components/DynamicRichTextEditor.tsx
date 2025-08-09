import dynamic from 'next/dynamic';

const DynamicRichTextEditor = dynamic(
  () => import('./RichTextEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full px-4 py-3 rounded-xl border border-[#667177]/20 bg-[#161b1e]/50 text-[#667177] min-h-[120px]">
        Загрузка редактора...
      </div>
    ),
  }
);

export default DynamicRichTextEditor;
