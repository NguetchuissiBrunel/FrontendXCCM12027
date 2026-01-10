// components/Sidebar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, User, BookOpen, Calendar } from 'lucide-react';

interface SidebarProps {
  userRole: 'student' | 'professor';
  userName: string;
  userLevel: string;
  activeTab?: string;
}

export default function Sidebar({ userRole, userName, userLevel, activeTab }: SidebarProps) {
  const [photoUrl, setPhotoUrl] = useState<string>('/images/pp.jpeg');

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        if (userData.photoUrl) {
          setPhotoUrl(userData.photoUrl);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la photo:', error);
      }
    }
  }, []);

  const studentMenuItems = [
    { id: 'accueil', label: 'Accueil', icon: Home, href: '/etudashboard' },
    { id: 'profil', label: 'Mon Profil', icon: User, href: '/etudashboard/profil' },
    { id: 'cours', label: 'Mes Cours', icon: BookOpen, href: '/etudashboard/cours' },
    { id: 'echeances', label: 'Échéances', icon: Calendar, href: '/etudashboard/echeances' },
  ];

  return (
    <aside className="w-72 bg-gradient-to-b from-purple-100 to-purple-200 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white min-h-screen p-6 border-r border-purple-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 flex items-center justify-center relative bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-purple-100 dark:border-gray-600 overflow-hidden">
          <Image
            src="/images/Capture.png"
            alt="XCCM Logo"
            width={44}
            height={44}
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">XCCM1</h1>
          <p className="text-xs text-purple-600 dark:text-purple-400">En ligne</p>
        </div>
      </div>

      {/* User Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src={photoUrl}
            alt={userName}
            className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 dark:border-purple-500"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{userName}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{userLevel}</p>
          </div>
        </div>
      </div>

      {/* Menu Principal */}
      {userRole === 'student' && (
        <nav>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-4 font-semibold">Menu Principal</p>
          <ul className="space-y-2">
            {studentMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Badge pour les notifications (échéances) */}
      {userRole === 'student' && (
        <div className="mt-6">
          <div className="bg-red-500 dark:bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center ml-auto">
            1
          </div>
        </div>
      )}
    </aside>
  );
}
