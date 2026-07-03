'use client';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaChalkboardTeacher, FaUniversity, FaMapMarkerAlt, FaBook, FaRocket, FaEyeSlash, FaEye } from 'react-icons/fa';

const GoogleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="fill-gray-900 dark:fill-white">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const API_BASE_REG = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import ImageUploader from '@/components/upload/ImageUploader';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher';
  firstName: string;
  lastName: string;
  photoUrl: string;
  city: string;
  university: string;
  promotion?: string;
  specialization?: string;
  level?: string;
  averageGrade?: string;
  currentSemester?: string;
  major?: string;
  minor?: string;
  interests?: string[];
  activities?: string[];
  grade?: string;
  certification?: string;
  subjects?: string[];
  teachingGrades?: string[];
  teachingGoal?: string;
};

const SignupPage = () => {
  const t = useTranslations('auth.register');
  const locale = useLocale();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    firstName: '',
    lastName: '',
    photoUrl: '',
    city: '',
    university: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [customGrade, setCustomGrade] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);
  const grades = useMemo(() => {
    const baseGrades = locale === 'fr'
      ? ['Professeur des ecoles', 'Certifie (CAPES)', 'Agrege', 'Enseignant-Chercheur', 'Maitre de Conferences', 'Professeur des Universites', 'Doctorant']
      : ['School teacher', 'Certified teacher (CAPES)', 'Associate professor', 'Teacher-researcher', 'Senior lecturer', 'University professor', 'Doctoral student'];
    return [t('grades.notSpecified'), t('grades.other'), ...baseGrades];
  }, [locale, t]);
  const subjects = useMemo(() => (
    locale === 'fr'
      ? ['Mathematiques', 'Physique-Chimie', 'SVT', 'Informatique', 'Francais', 'Anglais', 'Histoire-Geographie', 'Philosophie', 'Economie', 'Gestion', 'Droit', 'Medecine', 'Genie Civil', 'Genie Electrique', 'Arts plastiques', 'Musique', 'EPS', 'Technologie', 'Sciences de l\'ingenieur', 'Comptabilite', 'Marketing', 'Psychologie', 'Sociologie', 'Biologie']
      : ['Mathematics', 'Physics-Chemistry', 'Life sciences', 'Computer science', 'French', 'English', 'History-Geography', 'Philosophy', 'Economics', 'Management', 'Law', 'Medicine', 'Civil engineering', 'Electrical engineering', 'Visual arts', 'Music', 'Physical education', 'Technology', 'Engineering sciences', 'Accounting', 'Marketing', 'Psychology', 'Sociology', 'Biology']
  ), [locale]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target as Node)) {
        setShowSubjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const router = useRouter();
  const { registerStudent, registerTeacher, user, isAuthenticated } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'student') {
        router.push('/etudashboard');
      } else if (user?.role === 'teacher') {
        router.push('/profdashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  // Validation en temps réel des mots de passe
  useEffect(() => {
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: t('validation.passwordMismatch')
      }));
    } else if (formData.confirmPassword && formData.password === formData.confirmPassword) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }, [formData.password, formData.confirmPassword, t]);

  const resolvedGrade = formData.grade === t('grades.other')
    ? customGrade.trim()
    : formData.grade;

  const validateStep1 = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.passwordTooShort');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
    }

    if (formData.role === 'teacher' && !resolvedGrade) {
      newErrors.grade = t('validation.gradeRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, resolvedGrade, t]);

  const handleNext = useCallback(() => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  }, [currentStep, validateStep1]);

  const handlePhotoUploadComplete = useCallback((url: string) => {
    setPhotoPreview(url);
    setFormData({ ...formData, photoUrl: url });
    setErrors({ ...errors, photo: '' });
    toast.success(t('messages.photoSuccess'));
  }, [errors, formData, t]);

  const handlePhotoUploadError = useCallback((error: string) => {
    setErrors({ ...errors, photo: error });
    toast.error(error);
  }, [errors]);

  const toggleSubject = (subject: string) => {
    setFormData(prev => {
      const currentSubjects = prev.subjects || [];
      const newSubjects = currentSubjects.includes(subject)
        ? currentSubjects.filter(s => s !== subject)
        : [...currentSubjects, subject];
      return { ...prev, subjects: newSubjects };
    });
  };

  const addCustomSubject = () => {
    const trimmed = customSubject.trim();
    if (!trimmed) return;
    setFormData(prev => {
      const currentSubjects = prev.subjects || [];
      if (currentSubjects.includes(trimmed)) return prev;
      return { ...prev, subjects: [...currentSubjects, trimmed] };
    });
    setCustomSubject('');
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (formData.role === 'student') {
        await registerStudent({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          photoUrl: formData.photoUrl,
          city: formData.city,
          university: formData.university,
          specialization: formData.specialization,
        });

        if (formData.promotion || formData.level || formData.interests) {
          localStorage.setItem('studentExtraInfo', JSON.stringify({
            promotion: formData.promotion || '',
            level: formData.level || '',
            averageGrade: formData.averageGrade || '',
            currentSemester: formData.currentSemester || '',
            major: formData.major || '',
            minor: formData.minor || '',
            interests: formData.interests || [],
            activities: formData.activities || []
          }));
        }
      } else {
        await registerTeacher({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          photoUrl: formData.photoUrl || undefined,
          city: formData.city,
          university: formData.university,
          grade: resolvedGrade,
          subjects: formData.subjects || [],
          certification: formData.certification,
        });

        if (formData.teachingGrades || formData.teachingGoal) {
          localStorage.setItem('teacherExtraInfo', JSON.stringify({
            teachingGrades: formData.teachingGrades || [],
            teachingGoal: formData.teachingGoal || ''
          }));
        }
      }

      toast.success(t('messages.success'));
    } catch (error: unknown) {
      const apiError = error as {
        body?: { message?: string };
        message?: string;
        status?: number;
      };
      console.error("Erreur lors de l'enregistrement :", error);

      let errorMessage = t('messages.unexpected');

      if (apiError.body?.message) {
        errorMessage = apiError.body.message;
      } else if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.status === 400) {
        errorMessage = t('messages.invalidData');
      } else if (apiError.status === 409) {
        errorMessage = t('messages.emailInUse');
      } else if (apiError.status === 500) {
        errorMessage = t('messages.serverError');
      }

      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, registerStudent, registerTeacher, resolvedGrade, t]);

  const renderStep1 = useMemo(() => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      <h2 className="text-2xl font-semibold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        {t('step1.title')}
      </h2>
      <div className="flex justify-end">
        <LanguageSwitcher compact />
      </div>

      <div className="space-y-4">
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="email"
            placeholder={t('placeholders.email')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
          />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t('placeholders.password')}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 pr-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
          {errors.password && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t('placeholders.confirmPassword')}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 pr-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
          >
            {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'student' })}
            className={`flex-1 py-3 rounded-lg transition-all duration-300 flex items-center justify-center ${formData.role === 'student'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
          >
            <FaGraduationCap className="mr-2" /> {t('roles.student')}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'teacher' })}
            className={`flex-1 py-3 rounded-lg transition-all duration-300 flex items-center justify-center ${formData.role === 'teacher'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
          >
            <FaChalkboardTeacher className="mr-2" /> {t('roles.teacher')}
          </button>
        </div>

        <AnimatePresence>
          {formData.role === 'teacher' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="relative">
                <FaRocket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <select
                  value={formData.grade || ''}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all appearance-none"
                >
                  <option value="" disabled>{t('placeholders.grade')}</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              {formData.grade === t('grades.other') && (
                <input
                  type="text"
                  value={customGrade}
                  onChange={(e) => setCustomGrade(e.target.value)}
                  placeholder={t('placeholders.customGrade')}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
                />
              )}
              {errors.grade && <p className="text-red-500 dark:text-red-400 text-sm">{errors.grade}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        {t('step1.next')}
      </button>

      {/* Séparateur OAuth */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 dark:text-gray-500">ou s&apos;inscrire avec</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Boutons OAuth — chacun sur sa ligne */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => { window.location.href = `${API_BASE_REG}/oauth2/authorization/google`; }}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <GoogleLogo />
          Continuer avec Google
        </button>
        <button
          type="button"
          onClick={() => { window.location.href = `${API_BASE_REG}/oauth2/authorization/github`; }}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <GitHubLogo />
          Continuer avec GitHub
        </button>
      </div>

      <div className="text-center">
        <span className="text-gray-600 dark:text-gray-400">{t('alreadyHaveAccount')} </span>
        <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
          {t('login')}
        </Link>
      </div>
    </motion.div>
  ), [errors, formData, grades, handleNext, showConfirmPassword, showPassword, t]);

  const renderStep2 = useMemo(() => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      <h2 className="text-2xl font-semibold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        {t('step2.title')}
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t('placeholders.firstName')}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
            />
          </div>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t('placeholders.lastName')}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
            />
          </div>
        </div>

        <div className="space-y-3">
          <ImageUploader
            currentImageUrl={photoPreview}
            onUploadComplete={handlePhotoUploadComplete}
            onUploadError={handlePhotoUploadError}
            placeholder={t('placeholders.photo')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t('placeholders.city')}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
            />
          </div>
          <div className="relative">
            <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t('placeholders.university')}
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
            />
          </div>
        </div>

        {formData.role === 'student' ? (
          <div className="relative">
            <FaBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t('placeholders.specialization')}
              value={formData.specialization || ''}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
            />
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">{t('subjects.optionalHint')}</p>
            <div className="relative" ref={subjectDropdownRef}>
              <FaBook className="absolute left-3 top-4 text-gray-400 dark:text-gray-500 z-10" />
              <div
                onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all cursor-pointer min-h-[50px] flex flex-wrap gap-1"
              >
                {formData.subjects && formData.subjects.length > 0 ? (
                  formData.subjects.map(s => (
                    <span key={s} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs flex items-center">
                      {s}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSubject(s); }}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">{t('placeholders.subjects')}</span>
                )}
              </div>

              {showSubjectDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {subjects.map(subject => (
                    <div
                      key={subject}
                      onClick={() => toggleSubject(subject)}
                      className={`px-4 py-2 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-100/10 flex items-center justify-between text-sm ${formData.subjects?.includes(subject) ? 'bg-purple-50 dark:bg-purple-100/10 text-purple-600' : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {subject}
                      {formData.subjects?.includes(subject) && <span className="text-purple-600">✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSubject())}
                placeholder={t('placeholders.customSubject')}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2 text-sm focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
              />
              <button
                type="button"
                onClick={addCustomSubject}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                {t('subjects.add')}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-300 dark:border-gray-700"
        >
          {t('step2.back')}
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('step2.submitting') : t('step2.submit')}
        </button>
      </div>

      <div className="text-center">
        <span className="text-gray-600 dark:text-gray-400">{t('alreadyHaveAccount')} </span>
        <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
          {t('login')}
        </Link>
      </div>

      {/* Toaster - Supprimé car géré au niveau global RootLayout */}
    </motion.div>
  ), [formData, handlePhotoUploadComplete, handlePhotoUploadError, handleSubmit, isSubmitting, photoPreview, showSubjectDropdown, subjects, t]);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{ backgroundImage: "url('/images/fond5.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60 transition-colors duration-300"></div>

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {currentStep === 1 ? renderStep1 : renderStep2}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignupPage;
