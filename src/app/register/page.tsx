'use client';
import { useState, useCallback, useMemo } from 'react';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaChalkboardTeacher, FaCamera, FaUniversity, FaMapMarkerAlt, FaBook, FaChartLine, FaRocket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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
  // Étudiant
  promotion?: string;
  specialization?: string;
  level?: string;
  averageGrade?: string;
  currentSemester?: string;
  major?: string;
  minor?: string;
  interests?: string[];
  activities?: string[];
  // Enseignant
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
    photoUrl: '/images/default-profile.avif',
    city: '',
    university: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    try {
      // Générer un ID unique
      const userId = `${
        formData.role === 'student' ? 'ETU' : 'ENS'
      }${new Date().getFullYear()}${Math.random().toString(36).substr(2, 9)}`;
  
      // Créer l'objet utilisateur
      const newUser = {
        id: userId,
        ...formData,
        registrationDate: new Date().toISOString(),
      };
  
      // Sauvegarder dans localStorage
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      localStorage.setItem('users', JSON.stringify([...existingUsers, newUser]));
  
      // Stocker l'utilisateur courant
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('userRole', formData.role);
  
      // Stocker également dans studentInfo ou teacherInfo selon le rôle
      if (formData.role === 'student') {
        localStorage.setItem('studentInfo', JSON.stringify({
          id: userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          photoUrl: formData.photoUrl || '/images/default-profile.avif',
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
          photoUrl: formData.photoUrl || '/images/default-profile.avif',
          university: formData.university || '',
          city: formData.city || '',
          grade: formData.grade || '',
          certification: formData.certification || '',
          subjects: formData.subjects || [],
          teachingGrades: formData.teachingGrades || [],
          teachingGoal: formData.teachingGoal || ''
        }));
      }
  
      // Rediriger vers le tableau de bord
      window.location.href = formData.role === 'student' ? '/etudashboard' : '/profdashboard';
    } catch (error) {
      setErrors({ submit: "Une erreur est survenue lors de l'inscription." });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const renderStep1 = useMemo(() => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6 bg-white p-8 rounded-2xl shadow-lg"
    >
      <h2 className="text-2xl font-semibold text-center bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Créez votre compte
      </h2>

      <div className="space-y-4">
        {/* Email */}
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            placeholder="Votre adresse email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Mot de passe */}
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            placeholder="Votre mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Confirmation du mot de passe */}
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            placeholder="Confirmez votre mot de passe"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Rôle */}
        <div className="flex space-x-4">
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
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        Suivant
      </button>
    </motion.div>
  ), [formData, errors, handleNext]);

  const renderStep2 = useMemo(() => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 bg-white p-8 rounded-2xl shadow-lg"
    >
      <h2 className="text-2xl font-semibold text-center bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Complétez votre profil
      </h2>

      <div className="space-y-4">
        {/* Prénom et Nom */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>
        </div>

        {/* Photo de profil */}
        <div className="relative">
          <FaCamera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="URL de votre photo de profil"
            value={formData.photoUrl}
            onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>

        {/* Ville et Université */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ville"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>
          <div className="relative">
            <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Université"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>
        </div>

        {/* Informations spécifiques */}
        {formData.role === 'student' ? (
          <>
            <div className="relative">
              <FaBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Spécialisation"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            <div className="relative">
              <FaChartLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Moyenne générale"
                value={formData.averageGrade}
                onChange={(e) => setFormData({ ...formData, averageGrade: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <FaRocket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            <div className="relative">
              <FaBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Matières enseignées"
                value={formData.subjects?.join(', ')}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value.split(', ') })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
      </button>
    </motion.div>
  ), [formData, isSubmitting, handleSubmit]);

  return (
    <div
  className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 sm:px-6 lg:px-8"
  style={{ backgroundImage: "url('/images/fond5.jpeg')" }}
>
  {/* Overlay sombre pour rendre le texte lisible */}
  <div className="absolute inset-0 bg-black/40"></div>

  {/* Contenu du formulaire au-dessus de l’overlay */}
  <div className="relative z-10 w-full max-w-md">
    <AnimatePresence mode="wait">
      {currentStep === 1 ? renderStep1 : renderStep2}
    </AnimatePresence>
  </div>
</div>
  );
};

export default SignupPage;