// components/professor/ProfileCard.tsx
'use client';
import { useState } from 'react';
import { Users, Award, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { OpenAPI } from '@/lib/core/OpenAPI';

interface Professor {
  id: string;
  name: string;
  city: string;
  university: string;
  grade: string;
  certification: string;
  totalStudents: number;
  participationRate: number;
  publications: number;
  photoUrl?: string;
  performanceDistribution: Array<{
    range: string;
    value: number;
    color: string;
  }>;
}

interface ProfileCardProps {
  professor: Professor;
  onUpdate?: (updatedProfessor: Professor) => void;
}

export default function ProfileCard({ professor, onUpdate }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfessor, setEditedProfessor] = useState<Professor>(professor);
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

        await fetch(`${OpenAPI.BASE}/users/${editedProfessor.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUser),
        });

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
      // Import dynamically to avoid issues
      const { CloudinaryService } = await import('@/lib/services/CloudinaryService');

      // Validate file
      const validation = CloudinaryService.validateFile(file);
      if (!validation.valid) {
        alert(validation.error || 'Fichier invalide');
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide');
        return;
      }

      // Upload to Cloudinary
      const url = await CloudinaryService.uploadImage(file);

      setEditedProfessor({
        ...editedProfessor,
        photoUrl: url
      });

      alert('Photo uploadée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'upload de la photo');
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5Mo");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditedProfessor({
          ...editedProfessor,
          photoUrl: base64String
        });
      };
      reader.readAsDataURL(file);
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
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{editedProfessor.totalStudents}</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-purple-600 dark:text-purple-400" size={32} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Taux de participation</p>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{editedProfessor.participationRate}%</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900/30">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <Award className="text-purple-600 dark:text-purple-400" size={32} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Publications</p>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{editedProfessor.publications}</p>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-900/30">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Distribution des performances</h3>

            {/* Chart */}
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#7c3aed"
                    className="dark:stroke-purple-500"
                    strokeWidth="20"
                    strokeDasharray="88 163"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="20"
                    strokeDasharray="75 176"
                    strokeDashoffset="-88"
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
                    strokeDashoffset="-163"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ddd6fe"
                    className="dark:stroke-purple-300"
                    strokeWidth="20"
                    strokeDasharray="38 213"
                    strokeDashoffset="-213"
                  />
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-4">
              {editedProfessor.performanceDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-4 h-4 ${item.color} rounded`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.range}</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400 ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
