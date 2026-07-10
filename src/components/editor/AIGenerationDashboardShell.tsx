'use client';

import React from 'react';
import { AIGenerationProvider } from '@/contexts/AIGenerationContext';
import AIGenerationBackgroundNotifier from './AIGenerationBackgroundNotifier';
import AIGenerationLeaveWarning from './AIGenerationLeaveWarning';

export default function AIGenerationDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AIGenerationProvider>
      {children}
      <AIGenerationBackgroundNotifier />
      <AIGenerationLeaveWarning />
    </AIGenerationProvider>
  );
}
