// src/types/course.ts
export interface Author {
  name: string;
  image: string;
  designation?: string; // Rendre optionnel
}

export interface ExerciseQuestion {
  question: string;
  options: string[];
  réponse: string;
}

export interface Paragraph {
  title: string;
  content: any;
  notions: string[];
  exercise?: {
    questions: ExerciseQuestion[];
  };
}

export interface Chapter {
  title: string;
  paragraphs: Paragraph[];
}

export interface Section {
  title: string;
  chapters?: Chapter[];
  paragraphs?: Paragraph[];
}

export interface CourseData {
  id: number;
  title: string;
  category?: string; // Rendre optionnel
  image: string;
  views: number;
  likes: number;
  downloads: number;
  author: Author;
  conclusion: string;
  learningObjectives: string[];
  sections: Section[];
  // Ajouter d'autres propriétés optionnelles qui pourraient exister dans vos données
  introduction?: string;
  prerequisites?: string[];
  duration?: string;
  level?: string;
  rating?: number;
  students?: number;
  lastUpdated?: string;
  previewImage?: string;
}