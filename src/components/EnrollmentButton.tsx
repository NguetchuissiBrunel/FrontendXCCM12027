// components/EnrollmentButton.tsx
'use client';

import { useState } from 'react';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Check, Loader2, BookOpen, Lock } from 'lucide-react';

interface EnrollmentButtonProps {
  courseId: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  showProgress?: boolean;
  onEnroll?: () => void;
  onUnenroll?: () => void;
}

export default function EnrollmentButton({
  courseId,
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  showProgress = false,
  onEnroll,
  onUnenroll
}: EnrollmentButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const { isEnrolled, progress, loading, enroll, unenroll, enrollment } = useEnrollment(courseId);
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si l'utilisateur peut s'inscrire
  const canEnroll = isAuthenticated && user?.role === 'student';

  const handleClick = async () => {
    if (loading || isLoading) return;

    // Empêcher l'inscription si non autorisé
    if (!canEnroll) {
      console.log('❌ Enrollement non autorisé pour le rôle:', user?.role);
      return;
    }

    setIsLoading(true);

    try {
      if (isEnrolled) {
        await unenroll();
        onUnenroll?.();
      } else {
        const result = await enroll();
        if (result) onEnroll?.();
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    } finally {
      // Petit délai pour l'animation
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // Tailles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Variantes selon l'état
  const variantClasses = {
    primary: !canEnroll
      ? 'bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed'
      : isEnrolled
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: !canEnroll
      ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
      : isEnrolled
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50',
    outline: !canEnroll
      ? 'border border-gray-300 text-gray-500 cursor-not-allowed'
      : isEnrolled
        ? 'border border-green-600 text-green-600 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400'
        : 'border border-purple-600 text-purple-600 hover:bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400'
  };

  if (loading) {
    return (
      <button
        className={`${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} rounded-lg flex items-center justify-center opacity-50 cursor-not-allowed`}
        disabled
      >
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
        <span>Chargement...</span>
      </button>
    );
  }

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <button
        onClick={handleClick}
        disabled={isLoading || !canEnroll}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${fullWidth ? 'w-full' : ''}
          rounded-lg font-semibold transition-all duration-200
          flex items-center justify-center
          disabled:opacity-50 disabled:cursor-not-allowed
          ${canEnroll ? 'hover:scale-105 active:scale-95' : ''}
        `}
        title={!canEnroll ? (user?.role === 'teacher' ? 'Enseignants ne peuvent pas s\'inscrire' : 'Connectez-vous en tant qu\'étudiant') : undefined}
      >
        {isLoading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : !canEnroll ? (
          <>
            <Lock className={iconSizes[size]} />
            <span>{user?.role === 'teacher' ? 'Enseignant' : 'Se connecter'}</span>
          </>
        ) : isEnrolled ? (
          enrollment?.status === 'PENDING' ? (
            <>
              <Loader2 className={iconSizes[size]} />
              <span>En attente de validation</span>
            </>
          ) : (
            <>
              <Check className={iconSizes[size]} />
              <span>{showProgress ? `${progress}% complété` : 'Se désinscrire'}</span>
            </>
          )
        ) : (
          <>
            <BookOpen className={iconSizes[size]} />
            <span>S'inscrire</span>
          </>
        )}
      </button>

      {showProgress && isEnrolled && progress > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
            {progress}% complété
          </div>
        </div>
      )}
    </div>
  );
}