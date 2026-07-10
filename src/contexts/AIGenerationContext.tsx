'use client';

import React, { createContext, useContext } from 'react';
import { useAIGenerate } from '@/hooks/useAIGenerate';

type AIGenerationContextValue = ReturnType<typeof useAIGenerate>;

const AIGenerationContext = createContext<AIGenerationContextValue | null>(null);

export function AIGenerationProvider({ children }: { children: React.ReactNode }) {
  const value = useAIGenerate();
  return (
    <AIGenerationContext.Provider value={value}>
      {children}
    </AIGenerationContext.Provider>
  );
}

export function useAIGeneration() {
  const ctx = useContext(AIGenerationContext);
  if (!ctx) {
    throw new Error('useAIGeneration doit être utilisé dans un AIGenerationProvider');
  }
  return ctx;
}
