// components/Sidebar.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, User, BookOpen, Calendar, Users as LucideUsers, FileText, FolderOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { usePendingCount } from '@/hooks/usePendingCount';

interface SidebarProps {
  userRole: 'student' | 'professor';
  userName: string;
  userLevel: string;
  activeTab?: string;
}

export default function Sidebar({ userRole, userName, userLevel, activeTab }: SidebarProps) {
  const t = useTranslations('sidebar');
  const [photoUrl, setPhotoUrl] = useState<string>('/images/pp.jpeg');
  const { pendingCount } = usePendingCount();

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
    { id: 'accueil', label: t('student.home'), icon: Home, href: '/etudashboard' },
    { id: 'profil', label: t('student.profile'), icon: User, href: '/etudashboard/profil' },
    { id: 'cours', label: t('student.courses'), icon: BookOpen, href: '/etudashboard/cours' },
    { id: 'echeances', label: t('student.deadlines'), icon: Calendar, href: '/etudashboard/echeances' },
  ];

  const professorMenuItems = [
    { id: 'accueil', label: t('teacher.home'), icon: Home, href: '/profdashboard?tab=accueil' },
    { id: 'inscriptions', label: t('teacher.enrollments'), icon: LucideUsers, href: '/profdashboard?tab=inscriptions' },
    { id: 'classes', label: t('teacher.classes'), icon: FolderOpen, href: '/profdashboard?tab=classes' },
    { id: 'exercices', label: t('teacher.exercises'), icon: FileText, href: '/profdashboard?tab=exercices' },
    { id: 'compositions', label: t('teacher.compositions'), icon: BookOpen, href: '/profdashboard?tab=compositions' },
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
          <p className="text-xs text-purple-600 dark:text-purple-400">{t('online')}</p>
        </div>
      </div>

      {/* User Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Image
            src={photoUrl}
            alt={userName}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 dark:border-purple-500"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{userName}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{userLevel}</p>
          </div>
        </div>
      </div>

      {/* Menu Principal */}

      <nav id="sidebar-nav">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">{t('mainMenu')}</p>
          <LanguageSwitcher compact />
        </div>

        <ul className="space-y-2">
          {(userRole === 'student' ? studentMenuItems : professorMenuItems).map((item) => {
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
                  <span className="flex-1">{item.label}</span>
                  {item.id === 'inscriptions' && pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse shadow-sm">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
