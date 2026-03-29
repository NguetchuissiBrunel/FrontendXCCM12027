'use client';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaChalkboardTeacher, FaUniversity, FaMapMarkerAlt, FaBook, FaRocket, FaEyeSlash, FaEye } from 'react-icons/fa';
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
    photoUrl: '/images/Applying Lean to Education -.jpeg',
    city: '',
    university: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('/images/Applying Lean to Education -.jpeg');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);
  const grades = useMemo(() => (
    locale === 'fr'
      ? ['Professeur des ecoles', 'Certifie (CAPES)', 'Agrege', 'Enseignant-Chercheur', 'Maitre de Conferences', 'Professeur des Universites', 'Doctorant']
      : ['School teacher', 'Certified teacher (CAPES)', 'Associate professor', 'Teacher-researcher', 'Senior lecturer', 'University professor', 'Doctoral student']
  ), [locale]);
  const subjects = useMemo(() => (
    locale === 'fr'
      ? ['Mathematiques', 'Physique-Chimie', 'SVT', 'Informatique', 'Francais', 'Anglais', 'Histoire-Geographie', 'Philosophie', 'Economie', 'Gestion', 'Droit', 'Medecine', 'Genie Civil', 'Genie Electrique']
      : ['Mathematics', 'Physics-Chemistry', 'Life sciences', 'Computer science', 'French', 'English', 'History-Geography', 'Philosophy', 'Economics', 'Management', 'Law', 'Medicine', 'Civil engineering', 'Electrical engineering']
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

    if (formData.role === 'teacher' && !formData.grade) {
      newErrors.grade = t('validation.gradeRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

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
          photoUrl: formData.photoUrl,
          city: formData.city,
          university: formData.university,
          grade: formData.grade,
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
  }, [formData, registerStudent, registerTeacher, t]);

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
              className="relative"
            >
              <FaRocket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
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
              {errors.grade && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.grade}</p>}
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
