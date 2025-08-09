export interface Question {
  id?: number;
  questionText: string;
  imageUrl?: string;
  imageFile?: File;  // Временное хранение файла до загрузки
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  subjectType: string;
  correctOption: string;
  explanation?: string;
  points: number;
}

export interface IconProps {
  className?: string;
}