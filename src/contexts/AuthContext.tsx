// contexts/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'teacher';
  photoUrl?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isVisitor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const pathname = usePathname();

  // ==========================================
  // 🔄 Charger l'utilisateur au démarrage + détecter changements localStorage
  // ==========================================
  useEffect(() => {
    const loadUser = () => {
      try {
        // 1. Vérifier d'abord le cookie
        const userCookie = Cookies.get('currentUser');
        
        if (userCookie) {
          const userData = JSON.parse(userCookie);
          setUser(userData);
          
          // Synchroniser avec localStorage
          localStorage.setItem('currentUser', userCookie);
          localStorage.setItem('userRole', userData.role);
          
          console.log('✅ Utilisateur chargé depuis cookie:', userData.role);
        } else {
          // 2. Fallback localStorage (si cookie expiré OU si login/register n'a pas créé de cookie)
          const userStorage = localStorage.getItem('currentUser');
          
          if (userStorage) {
            const userData = JSON.parse(userStorage);
            
            console.log('⚠️ Cookie manquant mais localStorage trouvé - Création du cookie...');
            
            // 🔥 CRÉER LE COOKIE MANQUANT
            Cookies.set('currentUser', userStorage, COOKIE_OPTIONS);
            Cookies.set('userRole', userData.role, COOKIE_OPTIONS);
            
            setUser(userData);
            
            console.log('✅ Cookie créé depuis localStorage:', userData.role);
          } else {
            console.log('ℹ️ Aucun utilisateur connecté');
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement de l\'utilisateur:', error);
        // Nettoyer les données corrompues
        Cookies.remove('currentUser');
        Cookies.remove('userRole');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // 🔥 Écouter les changements de localStorage (pour détecter login/register)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser' && e.newValue) {
        console.log('🔔 localStorage modifié - Rechargement utilisateur...');
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 🔥 NOUVEAU : Écouter les changements de route pour recharger l'utilisateur
  useEffect(() => {
    console.log('📍 Route changée:', pathname);
    
    // Vérifier si localStorage a été modifié mais pas encore synchronisé
    const userStorage = localStorage.getItem('currentUser');
    const userCookie = Cookies.get('currentUser');
    
    if (userStorage && !userCookie) {
      console.log('🔄 Synchronisation cookie après changement de route...');
      try {
        const userData = JSON.parse(userStorage);
        Cookies.set('currentUser', userStorage, COOKIE_OPTIONS);
        Cookies.set('userRole', userData.role, COOKIE_OPTIONS);
        setUser(userData);
        console.log('✅ Cookie synchronisé - Rôle:', userData.role);
      } catch (error) {
        console.error('❌ Erreur parsing localStorage:', error);
      }
    } else if (userStorage && userCookie) {
      // 🔥 Vérifier que le cookie correspond bien au localStorage
      try {
        const storageData = JSON.parse(userStorage);
        const cookieData = JSON.parse(userCookie);
        
        if (storageData.role !== cookieData.role || storageData.id !== cookieData.id) {
          console.warn('⚠️ Désynchronisation détectée ! Mise à jour du cookie...');
          Cookies.set('currentUser', userStorage, COOKIE_OPTIONS);
          Cookies.set('userRole', storageData.role, COOKIE_OPTIONS);
          setUser(storageData);
          console.log('✅ Cookie mis à jour - Nouveau rôle:', storageData.role);
        }
      } catch (error) {
        console.error('❌ Erreur vérification sync:', error);
      }
    }
  }, [pathname]);

  // 🔥 POLLING : Vérifier toutes les 500ms si localStorage a changé (pendant les 5 premières secondes)
  useEffect(() => {
    let pollCount = 0;
    const maxPolls = 10; // 10 x 500ms = 5 secondes
    
    const pollInterval = setInterval(() => {
      pollCount++;
      
      const userStorage = localStorage.getItem('currentUser');
      const userCookie = Cookies.get('currentUser');
      
      if (userStorage && (!userCookie || !user)) {
        console.log('🔄 [POLL] Détection localStorage sans cookie - Synchronisation...');
        try {
          const userData = JSON.parse(userStorage);
          Cookies.set('currentUser', userStorage, COOKIE_OPTIONS);
          Cookies.set('userRole', userData.role, COOKIE_OPTIONS);
          setUser(userData);
          console.log('✅ [POLL] Synchronisation réussie - Rôle:', userData.role);
          clearInterval(pollInterval); // Arrêter le polling
        } catch (error) {
          console.error('❌ [POLL] Erreur:', error);
        }
      }
      
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        console.log('⏹️ [POLL] Arrêt du polling');
      }
    }, 500);

    return () => clearInterval(pollInterval);
  }, [user]);

  // ==========================================
  // 🔐 Fonction de connexion
  // ==========================================
  const login = (userData: User) => {
    setUser(userData);
    const userString = JSON.stringify(userData);
    
    // 1. Sauvegarder dans les cookies (pour le middleware)
    Cookies.set('currentUser', userString, COOKIE_OPTIONS);
    Cookies.set('userRole', userData.role, COOKIE_OPTIONS);
    
    // 2. Sauvegarder dans localStorage (backup)
    localStorage.setItem('currentUser', userString);
    localStorage.setItem('userRole', userData.role);
    
    console.log('✅ Connexion réussie:', userData.role);
    console.log('✅ Cookie créé:', Cookies.get('currentUser') ? 'OUI' : 'NON');
    
    // Redirection selon le rôle
    setTimeout(() => {
      const redirectPath = userData.role === 'student' ? '/etudashboard' : '/profdashboard';
      window.location.href = redirectPath;
    }, 100);
  };

  // ==========================================
  // 🚪 Fonction de déconnexion
  // ==========================================
  const logout = () => {
    setUser(null);
    
    // 1. Nettoyer les cookies
    Cookies.remove('currentUser', { path: '/' });
    Cookies.remove('userRole', { path: '/' });
    
    // 2. Nettoyer localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('studentInfo');
    localStorage.removeItem('teacherInfo');
    
    console.log('✅ Déconnexion réussie');
    
    // 3. Rediriger vers la page d'accueil
    router.push('/');
  };

  // ==========================================
  // ✏️ Fonction de mise à jour du profil
  // ==========================================
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    const userString = JSON.stringify(updatedUser);
    
    // Mettre à jour cookies et localStorage
    Cookies.set('currentUser', userString, COOKIE_OPTIONS);
    localStorage.setItem('currentUser', userString);
    
    console.log('✅ Profil mis à jour');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isVisitor: !user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==========================================
// 🪝 Hook personnalisé
// ==========================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

// ==========================================
// 🔒 Hook pour vérifier les permissions
// ==========================================
export function useRequireAuth(allowedRoles?: ('student' | 'teacher')[]) {
  const { user, loading, isVisitor } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Si pas d'utilisateur, rediriger vers login
    if (!user) {
      const redirect = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    // Si rôle non autorisé, rediriger
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const defaultPath = user.role === 'student' ? '/etudashboard' : '/profdashboard';
      router.push(defaultPath);
    }
  }, [user, loading, router, allowedRoles, pathname]);

  return { user, loading, isVisitor };
}

// ==========================================
// 🎯 Hook pour vérifier les permissions
// ==========================================
export function useCanAccess(feature: 'enroll' | 'dashboard' | 'profile' | 'edit') {
  const { isAuthenticated } = useAuth();
  
  // Toutes les fonctionnalités nécessitent une authentification
  return isAuthenticated;
}
