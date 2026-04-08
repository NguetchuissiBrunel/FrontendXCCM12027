// types/notebook.ts

import { ReactNode } from 'react';

export interface Source {
  id: string | number;
  name: string;
  type: string;
  selected: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface StudioActivity {
  id: string;
  type: 'audio' | 'presentation' | 'video' | 'mindmap' | 'reports' | 'flashcards' | 'chat';
  title: string;
  timestamp: string;
}

export interface Notebook {
  id: string;
  title: string;
  sources: Source[];
  chatHistory: ChatMessage[];
  studioActivities: StudioActivity[];
  updatedAt: string;
}
