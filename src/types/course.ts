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

export type ContentItem = 
  | { type: 'chapter'; data: Chapter }
  | { type: 'paragraph'; data: Paragraph }
  | { type: 'notion'; data: string }
  | { type: 'exercise'; data: { title: string; content?: any; questions?: QuestionData[]; id?: string } };

export type SubItem = 
  | { type: 'chapter'; data: Chapter }
  | { type: 'paragraph'; data: Paragraph }
  | { type: 'notion'; data: string }
  | { type: 'exercise'; data: { title: string; content?: any; questions?: QuestionData[]; id?: string } };

export interface Paragraph {
  id?: string;
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
  exercises?: Array<{ title: string; content?: any; questions?: QuestionData[]; id?: string }>;
  children?: ContentItem[];
  subItems?: SubItem[];
}

export interface Chapter {
  id?: string;
  title: string;
  paragraphs: Paragraph[];
  introduction?: string;
  exercise?: {
    title: string;
    type: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
    questions: QuestionData[];
  };
  exerciseContent?: any;
  exercises?: Array<{ title: string; content?: any; questions?: QuestionData[]; id?: string }>;
  children?: ContentItem[];
  subItems?: SubItem[];
}

export interface Section {
  id?: string;
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
  exercises?: Array<{ title: string; content?: any; questions?: QuestionData[]; id?: string }>;
  children?: ContentItem[];
  subItems?: SubItem[];
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