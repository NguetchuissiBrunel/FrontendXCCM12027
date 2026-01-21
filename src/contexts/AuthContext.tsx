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
  role: 'student' | 'teacher' | 'admin';
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
  registerAdmin: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper pour générer un mock JWT que le middleware pourra décoder
const generateMockJWT = (payload: any) => {
  try {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const data = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24h
    };
    const encodedPayload = btoa(JSON.stringify(data));
    return `${header}.${encodedPayload}.mock-signature`;
  } catch (e) {
    console.error('Erreur génération mock token:', e);
    return 'mock-token-' + Date.now();
  }
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
      try {
        initializeAuth();
        const savedToken = getAuthToken();

        if (savedToken && !isTokenExpired(savedToken)) {
          const decoded = decodeToken(savedToken);

          // Try to get the full profile from localStorage saved during login
          const savedUserJSON = localStorage.getItem('currentUser');
          const savedUser = savedUserJSON ? JSON.parse(savedUserJSON) : null;

          if (decoded) {
            const rawRole = String(decoded.role || '').toLowerCase();
            const isAdmin = rawRole.includes('admin');
            const isTeacher = rawRole.includes('teacher') || rawRole.includes('professor');

            // HYBRID APPROACH: Use localStorage data if available, otherwise token
            const restoredUser: User = {
              id: decoded.id || savedUser?.id || '',
              email: decoded.email || savedUser?.email || '',
              role: isAdmin ? 'admin' : (isTeacher ? 'teacher' : 'student'),
              // Merge missing fields from savedUser
              firstName: savedUser?.firstName || decoded.firstName || '',
              lastName: savedUser?.lastName || decoded.lastName || '',
              photoUrl: savedUser?.photoUrl || decoded.photoUrl || '',
              city: savedUser?.city || decoded.city || '',
              university: savedUser?.university || decoded.university || '',
              grade: savedUser?.grade || decoded.grade || '',
              certification: savedUser?.certification || decoded.certification || '',
            };

            setUser(restoredUser);
            setToken(savedToken);
            console.log('✅ Session restaurée avec succès');
          }
        }
      } catch (error) {
        console.error('❌ Erreur restoration session:', error);
        logout();
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

      let response;
      try {
        console.log('📡 Appel API login...');
        response = await AuthControllerService.login({
          email,
          password,
        });
        console.log('✅ Réponse brute API reçue:', response);
      } catch (apiError: any) {
        console.warn('⚠️ Échec de l\'API de connexion, vérification du mode Mock pour Admin...');
        // Fallback pour Admin si l'API échoue (utile si les endpoints ne sont pas prêts)
        const mockAdmins = JSON.parse(localStorage.getItem('mock_admins') || '[]');
        const mockUser = mockAdmins.find((a: any) => a.email === email && a.password === password);

        if (mockUser || (email.includes('admin') && password === 'admin123')) {
          console.log('🚀 Connexion Mock Admin réussie');
          const mockAuthData: AuthenticationResponse = {
            token: generateMockJWT({
              id: mockUser?.id || 'mock-admin-id',
              email: email,
              role: 'ADMIN' // Utiliser majuscules pour correspondre au middleware
            }),
            id: mockUser?.id || 'mock-admin-id',
            email: email,
            role: 'admin',
            firstName: mockUser?.firstName || 'Admin',
            lastName: mockUser?.lastName || 'Mock',
          };
          response = { data: mockAuthData, success: true };
        } else {
          throw apiError;
        }
      }

      if (!response) {
        throw new Error('Aucune réponse du serveur. Veuillez vérifier votre connexion.');
      }

      // Supporter à la fois le format enveloppé { data: ... } et le format direct { token: ... }
      const authData = ((response as any).data || response) as AuthenticationResponse;
      console.log('🎫 Données auth extraites:', { ...authData, token: authData.token ? '***' : 'manquant' });

      if (!authData || !authData.token) {
        console.error('❌ Structure de réponse invalide ou token manquant:', response);
        const errorMsg = (response as any)?.message || 'Erreur : Le serveur n\'a pas renvoyé de jeton de session.';
        throw new Error(errorMsg);
      }

      // Configurer le token
      setAuthToken(authData.token);
      setToken(authData.token);

      // Créer l'objet utilisateur
      const rawRole = String(authData.role || '').toLowerCase();
      const isAdmin = rawRole.includes('admin');
      const isTeacher = rawRole.includes('teacher') || rawRole.includes('professor');
      const loggedUser: User = {
        id: authData.id || '',
        email: authData.email || email,
        role: isAdmin ? 'admin' : (isTeacher ? 'teacher' : 'student'),
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

    // Vérifier le rôle avant de nettoyer
    const isAdmin = user?.role === 'admin';

    clearAuthToken();
    setUser(null);
    setToken(null);

    // Nettoyer localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');

    // Rediriger vers la page de connexion appropriée
    router.push(isAdmin ? '/admindashboard/login' : '/login');
  };

  // ==========================================
  // 🔥 Register Student
  // ==========================================
  const registerStudent = async (data: StudentRegisterRequest): Promise<void> => {
    try {
      console.log('📝 Inscription étudiant:', data.email);

      const response = await AuthControllerService.registerStudent(data);

      if (!response.data) {
        throw new Error(response.message);
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
        throw new Error(response.message);
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

      }
    } catch (error) {
      console.error('❌ Erreur inscription enseignant:', error);
      throw error;
    }
  };

  // ==========================================
  // 🔥 Register Admin
  // ==========================================
  const registerAdmin = async (data: any): Promise<void> => {
    try {
      console.log('📝 Inscription admin:', data.email);

      let response;
      try {
        response = await AuthControllerService.register(data);
      } catch (apiError: any) {
        console.warn('⚠️ Échec de l\'API d\'inscription admin, passage en mode Mock...');
        // Simuler une réussite en mode Mock
        const mockUser = {
          ...data,
          id: 'mock-id-' + Math.random().toString(36).substr(2, 9),
          token: generateMockJWT({
            email: data.email,
            role: 'ADMIN',
            id: 'mock-id-' + Math.random().toString(36).substr(2, 9)
          }),
        };

        // Sauvegarder pour permettre le login ultérieur
        const mockAdmins = JSON.parse(localStorage.getItem('mock_admins') || '[]');
        mockAdmins.push(mockUser);
        localStorage.setItem('mock_admins', JSON.stringify(mockAdmins));

        response = { data: mockUser, success: true };
      }

      if (!response.data) {
        throw new Error(response.message || "Erreur d'inscription");
      }

      const authData: AuthenticationResponse = response.data;

      if (authData.token) {
        setAuthToken(authData.token);
        setToken(authData.token);

        const newUser: User = {
          id: authData.id || '',
          email: authData.email || data.email,
          role: 'admin',
          firstName: authData.firstName || data.firstName,
          lastName: authData.lastName || data.lastName,
        };

        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('userRole', 'admin');
        Cookies.remove('currentUser');

        console.log('✅ Inscription admin réussie (Mock ou API)');
      }
    } catch (error) {
      console.error('❌ Erreur inscription admin:', error);
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
    registerAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
