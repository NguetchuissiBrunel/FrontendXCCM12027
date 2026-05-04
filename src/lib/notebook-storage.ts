// lib/notebook-storage.ts

import { Notebook } from '@/types/notebook';

const STORAGE_KEY = 'xccm_notebooks_v1';

export const saveNotebook = (notebook: Notebook): void => {
  if (typeof window === 'undefined') return;

  const currentNotebooks = getAllNotebooks();
  const existingIndex = currentNotebooks.findIndex((nb) => nb.id === notebook.id);

  if (existingIndex !== -1) {
    currentNotebooks[existingIndex] = { ...notebook, updatedAt: new Date().toISOString() };
  } else {
    currentNotebooks.push({ ...notebook, updatedAt: new Date().toISOString() });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentNotebooks));
};

export const getNotebook = (id: string): Notebook | null => {
  if (typeof window === 'undefined') return null;

  const notebooks = getAllNotebooks();
  return notebooks.find((nb) => nb.id === id) || null;
};

export const getAllNotebooks = (): Notebook[] => {
  if (typeof window === 'undefined') return [];

  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) return [];

  try {
    const list = JSON.parse(storedData) as Notebook[];
    return list.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Error parsing notebooks from storage:', error);
    return [];
  }
};

export const deleteNotebook = (id: string): void => {
  if (typeof window === 'undefined') return;

  const notebooks = getAllNotebooks();
  const filtered = notebooks.filter((nb) => nb.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
