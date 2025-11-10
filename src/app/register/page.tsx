'use client';
import { useState, useCallback, useMemo } from 'react';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaChalkboardTeacher, FaCamera, FaUniversity, FaMapMarkerAlt, FaBook, FaRocket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const validateStep1 = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    else if (formData.password.length < 8) newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  }, [currentStep, validateStep1]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, photo: 'Veuillez sélectionner une image valide' });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: 'L\'image ne doit pas dépasser 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
        setFormData({ ...formData, photoUrl: base64String });
        setErrors({ ...errors, photo: '' });
      };
      reader.readAsDataURL(file);
    }
  }, [formData, errors]);

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    try {
      const userId = `${
        formData.role === 'student' ? 'ETU' : 'ENS'
      }${new Date().getFullYear()}${Math.random().toString(36).substr(2, 9)}`;
  
      const newUser = {
        id: userId,
        ...formData,
        registrationDate: new Date().toISOString(),
      };
  
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      localStorage.setItem('users', JSON.stringify([...existingUsers, newUser]));
  
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('userRole', formData.role);
  
      if (formData.role === 'student') {
        localStorage.setItem('studentInfo', JSON.stringify({
          id: userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          photoUrl: formData.photoUrl || '/images/Applying Lean to Education -.jpeg',
          promotion: formData.promotion || '',
          specialization: formData.specialization || '',
          level: formData.level || '',
          university: formData.university || '',
          city: formData.city || '',
          averageGrade: formData.averageGrade || '',
          currentSemester: formData.currentSemester || '',
          major: formData.major || '',
          minor: formData.minor || '',
          interests: formData.interests || [],
          activities: formData.activities || []
        }));
      } else {
        localStorage.setItem('teacherInfo', JSON.stringify({
          id: userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          photoUrl: formData.photoUrl || '/images/Applying Lean to Education -.jpeg',
          university: formData.university || '',
          city: formData.city || '',
          grade: formData.grade || '',
          certification: formData.certification || '',
          subjects: formData.subjects || [],
          teachingGrades: formData.teachingGrades || [],
          teachingGoal: formData.teachingGoal || ''
        }));
      }
  
      router.push(formData.role === 'student' ? '/etudashboard' : '/profdashboard');
    } catch (error) {
      setErrors({ submit: "Une erreur est survenue lors de l'inscription." });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router]);

  const renderStep1 = useMemo(() => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      <h2 className="text-2xl font-semibold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Créez votre compte
      </h2>

      <div className="space-y-4">
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="email"
            placeholder="Votre adresse email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
          />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="password"
            placeholder="Votre mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
          />
          {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="password"
            placeholder="Confirmez votre mot de passe"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
          />
          {errors.confirmPassword && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        <div className="flex space-x-4">
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
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        Suivant
      </button>
      <div className="text-center">
        <span className="text-gray-600 dark:text-gray-400">Vous avez déjà un compte ? </span>
        <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
          Connectez-vous
        </Link>
      </div>
    </motion.div>
  ), [formData, errors, handleNext]);

  const renderStep2 = useMemo(() => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      <h2 className="text-2xl font-semibold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Complétez votre profil
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
            />
          </div>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-200 dark:border-purple-900/30 shadow-lg">
              <img 
                src={photoPreview} 
                alt="Prévisualisation" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <label 
                htmlFor="photo-upload" 
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FaCamera className="mr-2" />
                Choisir une photo
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, PNG ou JPEG (Max. 5MB)</p>
              {errors.photo && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.photo}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Ville"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
            />
          </div>
          <div className="relative">
            <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Université"
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
              placeholder="Spécialisation"
              value={formData.specialization || ''}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
            />
          </div>
        ) : (
          <>
            <div className="relative">
              <FaRocket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Grade"
                value={formData.grade || ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
              />
            </div>
            <div className="relative">
              <FaBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Matières enseignées (séparer par des virgules)"
                value={formData.subjects?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value.split(', ') })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-300 dark:border-gray-700"
        >
          Retour
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </div>
      
      <div className="text-center">
        <span className="text-gray-600 dark:text-gray-400">Vous avez déjà un compte ? </span>
        <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
          Connectez-vous
        </Link>
      </div>
      
      {errors.submit && <p className="text-red-500 dark:text-red-400 text-sm text-center">{errors.submit}</p>}
    </motion.div>
  ), [formData, isSubmitting, handleSubmit, errors, handlePhotoUpload, photoPreview]);

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