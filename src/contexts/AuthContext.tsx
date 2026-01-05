// contexts/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher';
  firstName: string;
  lastName: string;
  photoUrl?: string;
  city: string;
  university: string;
  specialization: string;
  registrationDate: string;
  lastLogin: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isVisitor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configuration des cookies (sécurisé)
const COOKIE_OPTIONS = {
  expires: 7, // 7 jours
  secure: process.env.NODE_ENV === 'production', // HTTPS en production
  sameSite: 'lax' as const,
  path: '/',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // 🔥 Ce hook s'actualise à chaque changement de route

  // Fonction pour synchroniser l'authentification
  const syncAuth = () => {
    try {
      const userStorage = localStorage.getItem('currentUser');

      console.log('🔄 Synchronisation auth...');
      console.log('  - localStorage:', userStorage ? 'EXISTE' : 'VIDE');

      if (userStorage && userStorage !== 'null' && userStorage !== 'undefined') {
        // ✅ localStorage contient un user → Créer/Mettre à jour le cookie
        const userData = JSON.parse(userStorage);

        if (userData && userData.id && userData.role) {
          console.log('  ✅ User trouvé dans localStorage - Rôle:', userData.role);

          // Mettre à jour le cookie
          Cookies.set('currentUser', userStorage, COOKIE_OPTIONS);
          Cookies.set('userRole', userData.role, COOKIE_OPTIONS);

          // Mettre à jour l'état
          setUser(userData);

          console.log('  ✅ Cookie créé/mis à jour');
        } else {
          console.warn('  ⚠️ Données invalides dans localStorage');
          localStorage.removeItem('currentUser');
          Cookies.remove('currentUser');
          Cookies.remove('userRole');
          setUser(null);
        }
      } else {
        // ❌ localStorage vide → Supprimer le cookie
        console.log('  ❌ localStorage vide - Suppression cookie');

        Cookies.remove('currentUser', { path: '/' });
        Cookies.remove('userRole', { path: '/' });
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      // En cas d'erreur, tout nettoyer
      localStorage.removeItem('currentUser');
      Cookies.remove('currentUser');
      Cookies.remove('userRole');
      setUser(null);
    }
  };

  // ==========================================
  // 🔥 Synchronisation au montage
  // ==========================================
  useEffect(() => {
    console.log('🔧 Initialisation AuthContext');
    syncAuth();
    setLoading(false);

    // 🔥 Écouter les changements de localStorage (ex: autre onglet ou login)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        console.log('🔔 localStorage modifié depuis un autre onglet');
        syncAuth();
      }
    };

    // 🔥 CRÉER UN INTERVALLE pour vérifier localStorage périodiquement
    const intervalId = setInterval(() => {
      console.log('Contrôle du LocalStorage');
      const currentUser = localStorage.getItem('currentUser');
      const lastUser = user ? JSON.stringify(user) : null;

      // Vérifier si localStorage a changé
      if (currentUser !== lastUser) {
        console.log('🔄 Changement détecté dans localStorage (même onglet)');
        syncAuth();
      }
    }, 500); // Vérifie toutes les 500ms

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []); // 🔥 UNE SEULE FOIS au montage

  // ==========================================
  // 🔥 NOUVEAU : Synchronisation à chaque changement de route
  // ==========================================
  //useEffect(() => {
  //console.log('📍 Changement de route détecté:', pathname);
  //syncAuth();
  //}, [pathname]); 🔥 S'exécute à chaque changement de route

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isVisitor: !user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
