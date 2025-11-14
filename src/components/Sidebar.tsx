// components/Sidebar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, User, BookOpen, Calendar } from 'lucide-react';

interface SidebarProps {
  userRole: 'student' | 'professor';
  userName: string;
  userLevel: string;
  activeTab?: string;
}

export default function Sidebar({ userRole, userName, userLevel, activeTab }: SidebarProps) {
  const [photoUrl, setPhotoUrl] = useState<string>('/images/Applying Lean to Education -.jpeg');

  useEffect(() => {
    // Récupérer la photo depuis localStorage
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
    <aside className="w-72 bg-gradient-to-b from-purple-700 to-purple-900 text-white min-h-screen p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold">XCCM1</h1>
          <p className="text-xs text-purple-200">En ligne</p>
        </div>
      </div>

      {/* User Profile */}
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <img 
            src={photoUrl} 
            alt={userName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold">{userName}</h3>
            <p className="text-sm text-purple-200">{userLevel}</p>
          </div>
        </div>
      </div>

      {/* Menu Principal */}
      {userRole === 'student' && (
        <nav>
          <p className="text-xs uppercase text-purple-300 mb-4 font-semibold">Menu Principal</p>
          <ul className="space-y-2">
            {studentMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <Link 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'text-purple-200 hover:bg-white/10'
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
          <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center ml-auto">
            1
          </div>
        </div>
      )}
    </aside>
  );
}