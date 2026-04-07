// app/(dashboard)/etudashboard/profil/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Award, BookOpen, Clock } from 'lucide-react';
import { OpenAPI } from '@/lib/core/OpenAPI';
import { useTranslations } from 'next-intl';
import { useLoading } from '@/contexts/LoadingContext';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
  specialization?: string;
  grade?: string;
  university?: string;
  city?: string;
  promotion?: string;
  averageGrade?: string;
  currentSemester?: string;
  major?: string;
  minor?: string;
  interests?: string[];
  activities?: string[];
}

export default function StudentProfile() {
  const t = useTranslations('studentProfile');
  const [user, setUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    startLoading();
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(currentUser);

      if (userData.role !== 'student') {
        router.push('/profdashboard');
        return;
      }

      setUser(userData);
      setEditedUser(userData);
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      router.push('/login');
    } finally {
      stopLoading();
    }
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedUser) return;

    startLoading();
    try {
      await fetch(`${OpenAPI.BASE}/users/${editedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });

      localStorage.setItem('currentUser', JSON.stringify(editedUser));

      setUser(editedUser);
      setIsEditing(false);

      toast.success(t('saveSuccess'));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(t('saveError'));
    } finally {
      stopLoading();
    }
  };

  const handleChange = (field: keyof User, value: string) => {
    if (!editedUser) return;
    setEditedUser({
      ...editedUser,
      [field]: value
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('photoInvalidType'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('photoTooLarge'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (!editedUser) return;
        setEditedUser({
          ...editedUser,
          photoUrl: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (globalLoading && !user) {
    return null;
  }

  if (!user || !editedUser) return null;

  const displayName = `${editedUser.firstName} ${editedUser.lastName}`;
  const userLevel = editedUser.specialization || editedUser.grade || t('studentDefault');
  const defaultAvatar = '/images/pp.jpeg';

  const grades = [
    { subject: t('grades.excellent'), value: 35, color: 'bg-purple-600 dark:bg-purple-500' },
    { subject: t('grades.good'), value: 25, color: 'bg-purple-400' },
    { subject: t('grades.passable'), value: 20, color: 'bg-purple-300 dark:bg-purple-400' },
    { subject: t('grades.poor'), value: 20, color: 'bg-purple-200 dark:bg-purple-300' },
  ];

  return (
    <>
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">{t('title')}</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="bg-purple-600 dark:bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors shadow-lg"
            >
              ✏️ {t('edit')}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={globalLoading}
                className="bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 shadow-lg"
              >
                {globalLoading ? t('saving') : t('save')}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="col-span-1 space-y-6">
            {/* Profile Picture */}
            <div id="profile-info" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">

              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src={editedUser.photoUrl || defaultAvatar}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover border-2 border-purple-200 dark:border-purple-500"
                />

                {isEditing && (
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-purple-600 dark:bg-purple-500 text-white rounded-full p-2 cursor-pointer hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors shadow-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('studentId')}</p>
                <p className="font-semibold text-gray-800 dark:text-white">{editedUser.id}</p>

                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={editedUser.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 text-center text-xl font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={t('firstNamePlaceholder')}
                    />
                    <input
                      type="text"
                      value={editedUser.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 text-center text-xl font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={t('lastNamePlaceholder')}
                    />
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{displayName}</h2>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700 space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">{t('specialization')}:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.specialization || ''}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t('specializationPlaceholder')}
                  />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">{editedUser.specialization || t('notSpecified')}</p>
                )}
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">{t('level')}:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.grade || ''}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t('levelPlaceholder')}
                  />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">{editedUser.grade || t('notSpecified')}</p>
                )}
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">{t('university')}:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.university || ''}
                    onChange={(e) => handleChange('university', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t('universityPlaceholder')}
                  />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">{editedUser.university || t('notSpecified')}</p>
                )}
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">{t('city')}:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t('cityPlaceholder')}
                  />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">{editedUser.city || t('notSpecified')}</p>
                )}
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">{t('major')}:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.major || ''}
                    onChange={(e) => handleChange('major', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t('majorPlaceholder')}
                  />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">{editedUser.major || t('notSpecified')}</p>
                )}
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">{t('minor')}:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.minor || ''}
                    onChange={(e) => handleChange('minor', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t('minorPlaceholder')}
                  />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">{editedUser.minor || t('notSpecified')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="col-span-2 space-y-6">
            {/* Stats Cards */}
            <div id="profile-stats" className="grid grid-cols-3 gap-6">

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stats.coursesParticipated')}</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">0</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <Award className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stats.certifications')}</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">0</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <Clock className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('stats.attendance')}</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {editedUser.averageGrade || '0'}%
                </p>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{t('gradeDistribution.title')}</h3>

              <div className="space-y-6">
                {grades.map((grade, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{grade.subject}</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{grade.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`${grade.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${grade.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Donut Chart */}
              <div className="mt-8 flex justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      className="dark:stroke-gray-700"
                      strokeWidth="20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#7c3aed"
                      className="dark:stroke-purple-500"
                      strokeWidth="20"
                      strokeDasharray="88 163"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="20"
                      strokeDasharray="63 188"
                      strokeDashoffset="-88"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#c4b5fd"
                      className="dark:stroke-purple-400"
                      strokeWidth="20"
                      strokeDasharray="50 201"
                      strokeDashoffset="-151"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#ddd6fe"
                      className="dark:stroke-purple-300"
                      strokeWidth="20"
                      strokeDasharray="50 201"
                      strokeDashoffset="-201"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Interests & Activities */}
            {(user.interests && user.interests.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('interests')}</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}