// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';


const inter = Inter({ subsets: ['latin'] });

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
      <div className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="grow">
            {children}
          </div>
        </div>
      </div>
  );
}