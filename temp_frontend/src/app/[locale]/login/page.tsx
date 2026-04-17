'use client';
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type FormData = {
  email: string;
  password: string;
  role: 'student' | 'teacher';
};

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const SigninPage = () => {
  const t = useTranslations('auth.login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    role: 'student',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, user, isAuthenticated } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      // Si un callbackUrl existe, on pourrait l'utiliser, sinon dashboard par défaut
      const params = new URLSearchParams(window.location.search);
      const callback = params.get('callbackUrl');

      if (callback) {
        router.push(callback);
      } else {
        if (user?.role === 'student') router.push('/etudashboard');
        else if (user?.role === 'teacher') router.push('/profdashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  // Charger le rôle sauvegardé
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole === 'student' || savedRole === 'teacher') {
      setFormData(prev => ({
        ...prev,
        role: savedRole as 'student' | 'teacher'
      }));
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = t('validation.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('validation.emailInvalid');
    if (!formData.password) newErrors.password = t('validation.passwordRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      // Utiliser la fonction login du contexte AuthContext
      await login(formData.email, formData.password);

      toast.success(t('messages.success'));

      // La redirection est gérée par le useEffect ci-dessus
      // qui surveille le changement de l'utilisateur
    } catch (error: unknown) {
      const apiError = error as {
        body?: { message?: string };
        message?: string;
        status?: number;
      };
      console.error("Erreur lors de la connexion:", error);

      // Gérer les erreurs API
      let errorMessage = t('messages.unexpected');

      if (apiError.body?.message) {
        errorMessage = apiError.body.message;
      } else if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.status === 401) {
        errorMessage = t('messages.invalidCredentials');
      } else if (apiError.status === 403) {
        errorMessage = t('messages.forbidden');
      } else if (apiError.status === 500) {
        errorMessage = t('messages.serverError');
      }

      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, login, t, validateForm]);

  const renderForm = useMemo(() => (
    <motion.div
      {...pageTransition}
      className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {t('title')}
        </h2>
        <LanguageSwitcher compact />
      </div>

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
            placeholder={t('emailPlaceholder')}
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
            placeholder={t('passwordPlaceholder')}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 pr-12 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all" // Ajout de pr-12
          />

          {/* Bouton œil - CORRECTION */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowPassword(!showPassword);
              }
            }}
          >
            {showPassword ? (
              <FaEyeSlash size={20} className="text-gray-500 dark:text-gray-400" />
            ) : (
              <FaEye size={20} className="text-gray-500 dark:text-gray-400" />
            )}
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



        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
            {t('forgotPassword')}
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
        {isSubmitting ? t('submitting') : t('submit')}
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
        <span className="text-gray-600 dark:text-gray-400">{t('noAccount')} </span>
        <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
          {t('register')}
        </Link>
      </motion.div>


      {/* Toaster - Supprimé car géré au niveau global RootLayout */}
    </motion.div>
  ), [errors, handleSubmit, isSubmitting, showPassword, t, formData]);

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
