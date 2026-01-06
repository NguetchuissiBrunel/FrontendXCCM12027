// contexts/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthControllerService } from '@/lib';
import type {
  AuthenticationResponse,
  StudentRegisterRequest,
  TeacherRegisterRequest
} from '@/lib';
import {
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  initializeAuth,
  decodeToken,
  isTokenExpired
} from '@/utils/authHelpers';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher';
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  city?: string;
  university?: string;
  specialization?: string;
  grade?: string;
  subjects?: string[];
  certification?: string;
  registrationDate?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isVisitor: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerStudent: (data: StudentRegisterRequest) => Promise<void>;
  registerTeacher: (data: TeacherRegisterRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ==========================================
  // 🔥 Initialisation - Restaurer la session
  // ==========================================
  useEffect(() => {
    const restoreSession = async () => {
      console.log('🔧 Initialisation AuthContext (API)');

      try {
        // Initialiser le token depuis les cookies
        initializeAuth();
        const savedToken = getAuthToken();

        if (savedToken) {
          // Vérifier si le token est expiré
          if (isTokenExpired(savedToken)) {
            console.log('⚠️ Token expiré - Déconnexion');
            clearAuthToken();
            setUser(null);
            setToken(null);
          } else {
            // Décoder le token pour récupérer les infos utilisateur
            const decoded = decodeToken(savedToken);

            if (decoded) {
              const rawRole = String(decoded.role || '').toLowerCase();
              const isTeacher = rawRole.includes('teacher') || rawRole.includes('professor');
              const restoredUser: User = {
                id: decoded.sub || decoded.id || '',
                email: decoded.email || '',
                role: isTeacher ? 'teacher' : 'student',
                firstName: decoded.firstName,
                lastName: decoded.lastName,
                photoUrl: decoded.photoUrl,
                city: decoded.city,
                university: decoded.university,
                specialization: decoded.specialization,
                grade: decoded.grade,
                subjects: decoded.subjects,
                certification: decoded.certification,
              };

              setUser(restoredUser);
              setToken(savedToken);

              // Nettoyer l'ancien cookie currentUser si présent pour éviter les conflits
              Cookies.remove('currentUser');

              console.log('✅ Session restaurée depuis le Token - Rôle:', restoredUser.role);
            }
          }
        }
      } catch (error) {
        console.error('❌ Erreur restoration session:', error);
        clearAuthToken();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ==========================================
  // 🔥 Fonction de Login
  // ==========================================
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔐 Tentative de connexion:', email);

      const response = await AuthControllerService.login({
        email,
        password,
      });

      if (!response.data) {
        throw new Error('Aucune donnée retournée par l\'API');
      }

      const authData: AuthenticationResponse = response.data;

      if (!authData.token) {
        throw new Error('Token manquant dans la réponse');
      }

      // Configurer le token
      setAuthToken(authData.token);
      setToken(authData.token);

      // Créer l'objet utilisateur
      const rawRole = String(authData.role || '').toLowerCase();
      const isTeacher = rawRole.includes('teacher') || rawRole.includes('professor');
      const loggedUser: User = {
        id: authData.id || '',
        email: authData.email || email,
        role: isTeacher ? 'teacher' : 'student',
        firstName: authData.firstName,
        lastName: authData.lastName,
        photoUrl: authData.photoUrl,
        city: authData.city,
        university: authData.university,
        specialization: authData.specialization,
        grade: authData.grade,
        subjects: authData.subjects,
        certification: authData.certification,
        registrationDate: authData.registrationDate,
        lastLogin: authData.lastLogin,
      };

      setUser(loggedUser);

      // Sauvegarder également dans localStorage pour compatibilité avec le code de l'interface qui ne lit pas encore le token
      localStorage.setItem('currentUser', JSON.stringify(loggedUser));
      localStorage.setItem('userRole', loggedUser.role);

      // S'assurer que le vieux cookie est supprimé
      Cookies.remove('currentUser');

      console.log('✅ Connexion API réussie - Rôle:', loggedUser.role);
    } catch (error) {
      console.error('❌ Erreur login:', error);
      clearAuthToken();
      setUser(null);
      setToken(null);
      throw error;
    }
  };

  // ==========================================
  // 🔥 Fonction de Logout
  // ==========================================
  const logout = (): void => {
    console.log('🚪 Déconnexion');

    clearAuthToken();
    setUser(null);
    setToken(null);

    // Nettoyer localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');

    // Rediriger vers la page de connexion
    router.push('/login');
  };

  // ==========================================
  // 🔥 Register Student
  // ==========================================
  const registerStudent = async (data: StudentRegisterRequest): Promise<void> => {
    try {
      console.log('📝 Inscription étudiant:', data.email);

      const response = await AuthControllerService.registerStudent(data);

      if (!response.data) {
        throw new Error('Aucune donnée retournée par l\'API');
      }

      const authData: AuthenticationResponse = response.data;

      if (authData.token) {
        // Auto-login après inscription
        setAuthToken(authData.token);
        setToken(authData.token);

        const newUser: User = {
          id: authData.id || '',
          email: authData.email || data.email,
          role: 'student',
          firstName: authData.firstName,
          lastName: authData.lastName,
          photoUrl: authData.photoUrl,
          city: authData.city,
          university: authData.university,
          specialization: authData.specialization,
        };

        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('userRole', 'student');

        // Nettoyage vélos cookies
        Cookies.remove('currentUser');

        console.log('✅ Inscription étudiant réussie');
      }
    } catch (error) {
      console.error('❌ Erreur inscription étudiant:', error);
      throw error;
    }
  };

  // ==========================================
  // 🔥 Register Teacher
  // ==========================================
  const registerTeacher = async (data: TeacherRegisterRequest): Promise<void> => {
    try {
      console.log('📝 Inscription enseignant:', data.email);

      const response = await AuthControllerService.registerTeacher(data);

      if (!response.data) {
        throw new Error('Aucune donnée retournée par l\'API');
      }

      const authData: AuthenticationResponse = response.data;

      if (authData.token) {
        // Auto-login après inscription
        setAuthToken(authData.token);
        setToken(authData.token);

        const newUser: User = {
          id: authData.id || '',
          email: authData.email || data.email,
          role: 'teacher',
          firstName: authData.firstName,
          lastName: authData.lastName,
          photoUrl: authData.photoUrl,
          subjects: authData.subjects,
          certification: authData.certification,
        };

        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('userRole', 'teacher');

        // Nettoyage vélos cookies
        Cookies.remove('currentUser');

        console.log('✅ Inscription enseignant réussie');
      }
    } catch (error) {
      console.error('❌ Erreur inscription enseignant:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isVisitor: !user || !token,
    login,
    logout,
    registerStudent,
    registerTeacher,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
