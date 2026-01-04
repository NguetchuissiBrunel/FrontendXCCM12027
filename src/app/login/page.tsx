'use client';
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { 
  FaChalkboardTeacher, 
  FaEnvelope, 
  FaGraduationCap, 
  FaLock,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

type FormData = {
  email: string;
  password: string;
  role: 'student' | 'teacher'; 
};

type User = {
  id: string | number;
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

const SigninPage = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    role: 'student',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Charger les utilisateurs depuis JSON Server avec axios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get<User[]>("http://localhost:4000/users");
        setUsers(res.data);
        console.log("Utilisateurs chargés depuis json-server:", res.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des utilisateurs.");
      }
    };
    fetchUsers();

    const savedRole = localStorage.getItem('userRole');
    if (savedRole === 'student' || savedRole === 'teacher') {
      setFormData(prev => ({
        ...prev,
        role: savedRole as 'student' | 'teacher'
      }));
    }
  }, []);

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
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === formData.email.toLowerCase() &&
          u.password === formData.password
      );

      if (!user) {
        const emailExists = users.some(
          (u) => u.email.toLowerCase() === formData.email.toLowerCase()
        );
        const errorMessage = emailExists
          ? "Mot de passe incorrect"
          : "Aucun compte associé à cet email";
        setErrors({ submit: errorMessage });
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // Mettre à jour la date de dernière connexion dans json-server
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      await axios.put(`http://localhost:4000/users/${user.id}`, updatedUser);

      // Sauvegarder les infos dans localStorage
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      localStorage.setItem("userRole", user.role);

      toast.success("Connexion réussie !");

      // Redirection selon le rôle
      if (user.role === "student") {
        router.push("/etudashboard");
      } else if (user.role === "teacher") {
        router.push("/profdashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setErrors({ submit: "Une erreur est survenue. Veuillez réessayer." });
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, users, validateForm, router]);

  const renderForm = useMemo(() => (
    <motion.div
      {...pageTransition}
      className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      <h2 className="text-2xl font-semibold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Connexion
      </h2>

      {/* Champ email */}
      <div className="space-y-4">
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="email"
            name="email"
            placeholder="Votre adresse email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 dark:text-red-400 text-sm mt-1"
            >
              {errors.email}
            </motion.p>
          )}
        </motion.div>

        {/* Champ mot de passe */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Votre mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 pr-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 dark:text-red-400 text-sm mt-1"
            >
              {errors.password}
            </motion.p>
          )}
        </motion.div>

        {/* Choix du rôle */}
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
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <FaGraduationCap className="mr-2" /> Étudiant
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'teacher' })}
            className={`flex-1 py-3 rounded-lg transition-all duration-300 flex items-center justify-center ${
              formData.role === 'teacher'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
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
          <Link href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
            Mot de passe oublié ?
          </Link>
        </motion.div>
      </div>

      {/* Bouton de soumission */}
      <motion.button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
          className="text-red-500 dark:text-red-400 text-sm text-center mt-2"
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
        <span className="text-gray-600 dark:text-gray-400">Vous n'avez pas de compte ? </span>
        <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
          Inscrivez-vous
        </Link>
      </motion.div>
      
      {users.length > 0 && (
        <motion.div
          className="text-xs text-center mt-2 text-gray-400 dark:text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {users.length} utilisateur(s) enregistré(s)
        </motion.div>
      )}
      {/* Toaster */}
      <Toaster position="top-right" reverseOrder={false} />
    </motion.div>
  ), [formData, errors, handleSubmit, isSubmitting, users.length, showPassword]);

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center transition-colors duration-300"
      style={{ backgroundImage: "url('/images/fond5.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60 transition-colors duration-300"></div>
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {renderForm}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SigninPage;