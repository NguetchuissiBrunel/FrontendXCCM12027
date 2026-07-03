// src/app/layout.tsx
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from "@/contexts/AuthContext";
import OnboardingSwitcher from '@/components/OnboardingSwitcher';
import { dashboardFont } from '../fonts';

export const metadata: Metadata = {
  title: 'XCCM1 - Plateforme de création de contenu pédagogique',
  description: 'Créez, organisez et partagez vos contenus pédagogiques de manière intuitive avec XCCM1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={dashboardFont.className}>
      <div className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="grow">
            {children}
          </div>
          <OnboardingSwitcher />
        </AuthProvider>

      </div>
    </div>
  );
}
