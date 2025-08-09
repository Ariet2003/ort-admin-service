export interface Question {
  id?: number;
  questionText: string;
  imageUrl?: string;
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