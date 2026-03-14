// src/types/course.ts
export interface Author {
  id?: number | string;
  name: string;
  image: string;
  designation?: string; // Rendre optionnel
}

export interface QuestionData {
  text: string;
  options: string[];
}

export interface Paragraph {
  title: string;
  content: any;
  notions: string[];
  introduction?: string;
  exercise?: {
    title: string;
    type: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
    questions: QuestionData[];
  };
  exerciseContent?: any;
}

export interface Chapter {
  title: string;
  paragraphs: Paragraph[];
  introduction?: string;
  exercise?: {
    title: string;
    type: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
    questions: QuestionData[];
  };
  exerciseContent?: any;
}

export interface Section {
  title: string;
  chapters?: Chapter[];
  paragraphs?: Paragraph[];
  introduction?: string;
  exercise?: {
    title: string;
    type: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
    questions: QuestionData[];
  };
  exerciseContent?: any;
}

export interface CourseData {
  id: number;
  title: string;
  category?: string; // Rendre optionnel
  image: string;
  viewCount: number;
  likeCount: number;
  downloadCount: number;
  author: Author;
  introduction?: string;
  conclusion: string;
  learningObjectives: string[];
  sections: Section[];
  // Ajouter d'autres propriétés optionnelles qui pourraient exister dans vos données
  prerequisites?: string[];
  duration?: string;
  level?: string;
  rating?: number;
  students?: number;
  lastUpdated?: string;
  previewImage?: string;
}