// components/professor/ProfileCard.tsx
'use client';
import { useState } from 'react';
import { Users, Award, Clock, Activity, BarChart, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { OpenAPI } from '@/lib/core/OpenAPI';

interface Professor {
  id: string;
  name: string;
  city: string;
  university: string;
  grade: string;
  certification: string;
  totalStudents: number;
  activeStudents: number;
  participationRate: number;
  publications: number;
  photoUrl?: string;
  performanceDistribution: Array<{
    range: string;
    value: number;
    color: string;
  }>;
  averageProgress: number;
  totalExercises: number;
  completedStudents: number;
  pendingSubmissions?: number;
}

interface CourseStat {
  courseId: number;
  courseTitle: string;
  courseCategory: string;
  totalEnrolled: number;
  activeStudents: number;
  participationRate: number;
  averageProgress: number;
  completedStudents: number;
  totalExercises: number;
}

interface ProfileCardProps {
  professor: Professor;
  coursesStats?: CourseStat[];
  onUpdate?: (updatedProfessor: Professor) => void;
}

export default function ProfileCard({ professor, coursesStats, onUpdate }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfessor, setEditedProfessor] = useState<Professor>(professor);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses'>('overview');
  const defaultAvatar = '/images/prof.jpeg';

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfessor(professor);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);

        const updatedUser = {
          ...userData,
          firstName: editedProfessor.name.split(' ')[0],
          lastName: editedProfessor.name.split(' ').slice(1).join(' '),
          city: editedProfessor.city,
          university: editedProfessor.university,
          grade: editedProfessor.grade,
          certification: editedProfessor.certification,
          photoUrl: editedProfessor.photoUrl ? editedProfessor.photoUrl : defaultAvatar,
        };

        const response = await fetch(`${OpenAPI.BASE}/users/${editedProfessor.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUser),
        });

        if (!response.ok) throw new Error('Failed to update profile');

        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        setIsEditing(false);

        if (onUpdate) {
          onUpdate(editedProfessor);
        }

        toast.success('Profil mis à jour avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof Professor, value: string | number) => {
    setEditedProfessor({
      ...editedProfessor,
      [field]: value
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Import dynamically
      const { CloudinaryService } = await import('@/lib/services/CloudinaryService');

      // Validate file
      const validation = CloudinaryService.validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Fichier invalide');
        return;
      }

      // Upload to Cloudinary
      const url = await CloudinaryService.uploadImage(file, { folder: 'profiles' });

      setEditedProfessor({
        ...editedProfessor,
        photoUrl: url
      });

      toast.success('Photo mise à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload de la photo');
    }
  };

  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    const names = editedProfessor.name.split(' ');
    if (field === 'firstName') {
      const newName = `${value} ${names[1] || ''}`;
      setEditedProfessor({
        ...editedProfessor,
        name: newName.trim()
      });
    } else {
      const newName = `${names[0] || ''} ${value}`;
      setEditedProfessor({
        ...editedProfessor,
        name: newName.trim()
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400">Profil de l&apos;Enseignant</h2>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="bg-purple-600 dark:bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors shadow-lg"
          >
            ✏️ Modifier
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 shadow-lg"
            >
              {isSaving ? 'Enregistrement...' : '💾 Enregistrer'}
            </button>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          Aperçu
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'courses'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          Statistiques par Cours
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-3 gap-8">
          {/* Left: Profile Image & Basic Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-purple-200 dark:border-gray-700">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src={editedProfessor.photoUrl || defaultAvatar}
                  alt={editedProfessor.name}
                  className="w-full h-full rounded-full object-cover border-2 border-purple-200 dark:border-purple-500"
                />

                {/* Edit Photo Button */}
                {isEditing && (
                  <label
                    htmlFor="prof-photo-upload"
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
                      id="prof-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No. Enseignant</p>
                <p className="font-semibold text-gray-800 dark:text-white">{editedProfessor.id}</p>

                {/* Editable Name */}
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={editedProfessor.name.split(' ')[0]}
                      onChange={(e) => handleNameChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 text-center text-xl font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Prénom"
                    />
                    <input
                      type="text"
                      value={editedProfessor.name.split(' ').slice(1).join(' ')}
                      onChange={(e) => handleNameChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 text-center text-xl font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Nom"
                    />
                  </div>
                ) : (
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{editedProfessor.name}</h3>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">Ville:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfessor.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                    placeholder={editedProfessor.city || "Ex: Paris"}
                  />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">{editedProfessor.city || 'Non Spécifié'}</p>
                )}
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">Université:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfessor.university}
                    onChange={(e) => handleChange('university', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                    placeholder={editedProfessor.university || "Ex: Sorbonne Université"}
                  />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">{editedProfessor.university || 'Non Spécifié'}</p>
                )}
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">Grade:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfessor.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                    placeholder={editedProfessor.grade || "Ex: Professeur des Universités"}
                  />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">{editedProfessor.grade || 'Non Spécifié'}</p>
                )}
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">Certification:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfessor.certification}
                    onChange={(e) => handleChange('certification', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                    placeholder={editedProfessor.certification || "Ex: PhD en Mathématiques"}
                  />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">{editedProfessor.certification || 'Non Spécifié'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Stats & Performance */}
          <div className="col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <Users className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Étudiants</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {editedProfessor.totalStudents > 0 ? editedProfessor.totalStudents : 'Aucun'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {editedProfessor.publications > 0 
                    ? `sur ${editedProfessor.publications} cours publiés` 
                    : 'aucun cours publié'}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <Activity className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Taux de participation</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {editedProfessor.participationRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {editedProfessor.activeStudents > 0 
                    ? `${editedProfessor.activeStudents} étudiants actifs`
                    : 'aucun étudiant actif'}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <Award className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cours Publiés</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {editedProfessor.publications}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  cours créés
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <BarChart className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Progression Moyenne</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {editedProfessor.averageProgress}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  moyenne de tous les cours
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Exercices Totaux</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {editedProfessor.totalExercises}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {editedProfessor.totalExercises > 0 
                    ? `dans ${editedProfessor.publications} cours` 
                    : 'aucun exercice créé'}
                </p>
              </div>
            </div>

            {/* Additional Completion Stats */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                    <Clock className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Étudiants Terminés</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {editedProfessor.completedStudents}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ont complété leurs cours
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                    <div className="text-purple-600 dark:text-purple-400 text-xl">📈</div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Taux de Complétion</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {editedProfessor.totalStudents > 0 
                      ? `${Math.round((editedProfessor.completedStudents / editedProfessor.totalStudents) * 100)}%`
                      : '0%'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    des étudiants ont terminé
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Distribution - Seulement si on a des données */}
            {(editedProfessor.performanceDistribution.some(item => item.value > 0) || editedProfessor.publications > 0) && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-900/30">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Distribution des performances des étudiants</h3>

                {/* Chart */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-48 h-48">
                    <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                      {editedProfessor.performanceDistribution.map((item, index, array) => {
                        const previousValues = array.slice(0, index).reduce((sum, i) => sum + i.value, 0);
                        const circumference = 2 * Math.PI * 40;
                        const strokeDasharray = `${(item.value * circumference) / 100} ${circumference}`;
                        const strokeDashoffset = `-${(previousValues * circumference) / 100}`;
                        
                        // Déterminer la couleur basée sur la plage
                        let strokeColor = '#7c3aed'; // Couleur par défaut purple-600
                        if (item.range === 'Bien') strokeColor = '#a78bfa'; // purple-400
                        if (item.range === 'Passable') strokeColor = '#c4b5fd'; // purple-300
                        if (item.range === 'Faible') strokeColor = '#ddd6fe'; // purple-200
                        
                        return (
                          <circle
                            key={index}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {editedProfessor.performanceDistribution.length > 0 
                          ? `${Math.round(editedProfessor.performanceDistribution.reduce((sum, item) => sum + item.value, 0) / editedProfessor.performanceDistribution.length)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4">
                  {editedProfessor.performanceDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${item.color} rounded`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.range}</span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400 ml-auto">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message si aucune donnée */}
            {editedProfessor.publications === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-900/30">
                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-400 mb-3">
                  📚 Commencez votre parcours d'enseignement
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Vous n'avez pas encore publié de cours. Créez votre premier cours pour :
                </p>
                <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1 list-disc pl-5">
                  <li>Suivre les statistiques de vos étudiants</li>
                  <li>Analyser les performances d'apprentissage</li>
                  <li>Recevoir des feedbacks sur vos contenus</li>
                  <li>Gérer les inscriptions et participations</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab: Statistiques par Cours */
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Détails des statistiques par cours
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {coursesStats?.length || 0} cours
            </span>
          </div>
          
          {coursesStats && coursesStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesStats.map((course) => (
                <div key={course.courseId} className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-500 transition-colors">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-4 text-lg truncate">
                    {course.courseTitle}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {course.courseCategory}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Inscrits</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {course.totalEnrolled}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Actifs</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {course.activeStudents}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Participation</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {course.participationRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${course.participationRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progression</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {course.averageProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${course.averageProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400">Terminés</p>
                        <p className="font-bold text-gray-800 dark:text-white">
                          {course.completedStudents}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400">Exercices</p>
                        <p className="font-bold text-gray-800 dark:text-white">
                          {course.totalExercises}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400">Taux</p>
                        <p className="font-bold text-gray-800 dark:text-white">
                          {course.totalEnrolled > 0 
                            ? `${Math.round((course.completedStudents / course.totalEnrolled) * 100)}%`
                            : '0%'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => window.location.href = `/teacher/course/${course.courseId}/analytics`}
                      className="w-full mt-4 px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white text-sm rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                    >
                      Voir les détails complets
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-400 dark:text-gray-600">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Aucune statistique de cours disponible
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Les statistiques apparaîtront une fois que vos cours auront des étudiants inscrits.
              </p>
              <button
                onClick={() => window.location.href = '/create-course'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white text-sm rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer un cours
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}