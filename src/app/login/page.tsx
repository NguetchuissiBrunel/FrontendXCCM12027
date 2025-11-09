'use client';
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaChalkboardTeacher, FaEnvelope, FaGraduationCap, FaLock } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

type FormData = {
  email: string;
  password: string;
  role: 'student' | 'teacher'; 
};

// Définir le type User pour le localStorage
type User = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  registrationDate: string;
  lastLogin?: string;
  studentDetails?: {
    interests: string[];
    studyLevel: string;
    faculty: string;
    specialization: string;
    reason: string;
  };
  teacherDetails?: {
    teachingDepartments: string[];
    subjects: string[];
    teachingGoal: string;
  };
};

// Fonction pour charger les utilisateurs du localStorage
const loadUsers = (): User[] => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('users');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      return [];
    }
  }
  return [];
};

const SigninPage = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    role: 'student',
  });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Charger les utilisateurs au montage du composant
    const loadedUsers = loadUsers();
    setUsers(loadedUsers);
    console.log("Utilisateurs chargés:", loadedUsers);
    
    // Restaurer le rôle précédent si disponible
    const savedRole = localStorage.getItem('userRole');
    if (savedRole === 'student' || savedRole === 'teacher') {
      setFormData(prev => ({
        ...prev,
        role: savedRole as 'student' | 'teacher'
      }));
    }
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const pageTransition = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Récupérer les utilisateurs directement de l'état
      const loadedUsers = loadUsers();
      console.log("Tentative de connexion avec:", formData.email);
      console.log("Utilisateurs disponibles:", loadedUsers);
      
      // Rechercher l'utilisateur sans tenir compte de la casse pour l'email
      const user = loadedUsers.find(u => 
        u.email.toLowerCase() === formData.email.toLowerCase() && 
        u.password === formData.password
      );
      
      if (!user) {
        const emailExists = loadedUsers.some(u => 
          u.email.toLowerCase() === formData.email.toLowerCase()
        );
        
        setErrors({
          submit: emailExists ? 
            "Mot de passe incorrect" : 
            "Aucun compte associé à cet email"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Mettre à jour la date de dernière connexion
      user.lastLogin = new Date().toISOString();
      
      // Stocker l'utilisateur connecté
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);

      // Mettre à jour la liste des utilisateurs avec la date de dernière connexion
      const updatedUsers = loadedUsers.map(u => 
        u.id === user.id ? user : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      console.log("Connexion réussie, redirection vers:", user.role === 'student' ? '/etudashboard' : '/profdashboard');
      
      // Rediriger en fonction du rôle
      if (user.role === 'student') {
        router.push('/etudashboard');
      } else if (user.role === 'teacher') {
        router.push('/profdashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);
      setErrors({ submit: "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, router]);

  const renderForm = useMemo(() => (
    <motion.div
      {...pageTransition}
      className="space-y-6 bg-white p-8 rounded-2xl shadow-lg"
    >
      <h2 className="text-2xl font-semibold text-center bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Connexion
      </h2>

      <div className="space-y-4">
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            name="email"
            placeholder="Votre adresse email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.email}
            </motion.p>
          )}
        </motion.div>

        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            name="password"
            placeholder="Votre mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
          {errors.password && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.password}
            </motion.p>
          )}
        </motion.div>

        <motion.div 
          className="flex space-x-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'student' })}
            className={`flex-1 py-3 rounded-lg transition-all duration-300 flex items-center justify-center ${
              formData.role === 'student' 
                ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaGraduationCap className="mr-2" /> Étudiant
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'teacher' })}
            className={`flex-1 py-3 rounded-lg transition-all duration-300 flex items-center justify-center ${
              formData.role === 'teacher'
                ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaChalkboardTeacher className="mr-2" /> Enseignant
          </button>
        </motion.div>

        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
            Mot de passe oublié ?
          </Link>
        </motion.div>
      </div>

      <motion.button
        onClick={handleSubmit}
        className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        disabled={isSubmitting}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
      </motion.button>

      {errors.submit && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm text-center mt-2"
        >
          {errors.submit}
        </motion.p>
      )}

      <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-gray-600">Vous n'avez pas de compte ? </span>
        <Link href="/register" className="text-purple-600 hover:text-purple-700 transition-colors">
          Inscrivez-vous
        </Link>
      </motion.div>
      
      {users.length > 0 && (
        <motion.div
          className="text-xs text-center mt-2 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {users.length} utilisateur(s) enregistré(s)
        </motion.div>
      )}
    </motion.div>
  ), [formData, errors, handleSubmit, isSubmitting, users.length]);

  return (
    <div 
    className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
    style={{ backgroundImage: "url('/images/fond5.jpeg')" }} // <-- ton image ici
  >
    {/* Overlay pour assombrir un peu l'image */}
    <div className="absolute inset-0 bg-black/40"></div>

    {/* Contenu du formulaire au-dessus de l'overlay */}
    <div className="relative z-10 w-full max-w-md px-4 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {renderForm}
      </AnimatePresence>
    </div>
  </div>
  );
};

export default SigninPage;