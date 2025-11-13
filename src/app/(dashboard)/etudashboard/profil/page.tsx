// app/etudashboard/profil/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Award, BookOpen, Clock } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
  specialization?: string;
  level?: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
      setLoading(false);
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
    
    setIsSaving(true);
    try {
      // Mettre à jour dans db.json
      await fetch(`http://localhost:4000/users/${editedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });

      // Mettre à jour localStorage
      localStorage.setItem('currentUser', JSON.stringify(editedUser));
      
      setUser(editedUser);
      setIsEditing(false);
      
      // Toast de succès (optionnel)
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSaving(false);
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
        alert('Veuillez sélectionner une image valide');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image ne doit pas dépasser 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditedUser({
          ...editedUser,
          photoUrl: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !editedUser) return null;

  const displayName = `${editedUser.firstName} ${editedUser.lastName}`;
  const userLevel = editedUser.specialization || editedUser.level || 'Étudiant';
  const initials = `${editedUser.firstName[0]}${editedUser.lastName[0]}`;

  const grades = [
    { subject: 'Excellent', value: 35, color: 'bg-purple-600' },
    { subject: 'Bien', value: 25, color: 'bg-purple-400' },
    { subject: 'Passable', value: 20, color: 'bg-purple-300' },
    { subject: 'Faible', value: 20, color: 'bg-purple-200' },
  ];

  return (
    <div className="flex min-h-screen bg-purple-50">
      <Sidebar 
        userRole="student" 
        userName={displayName}
        userLevel={userLevel}
        activeTab="profil"
      />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-purple-700">Mon Profil Étudiant</h1>
          {!isEditing ? (
            <button 
              onClick={handleEdit}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              ✏️ Modifier
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Enregistrement...' : '💾 Enregistrer'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="col-span-1 space-y-6">
            {/* Profile Picture */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="relative w-32 h-32 mx-auto mb-4">
                {editedUser.photoUrl ? (
                  <img 
                    src={editedUser.photoUrl} 
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-300 rounded-full flex items-center justify-center text-purple-900 text-4xl font-bold">
                    {initials}
                  </div>
                )}
                
                {/* Edit Photo Button */}
                {isEditing && (
                  <label 
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-2 cursor-pointer hover:bg-purple-700 transition-colors shadow-lg"
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
                <p className="text-sm text-gray-500">No. Étudiant</p>
                <p className="font-semibold">{editedUser.id}</p>
                
                {/* Editable Name */}
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={editedUser.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 text-center text-xl font-bold text-gray-800 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Prénom"
                    />
                    <input
                      type="text"
                      value={editedUser.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 text-center text-xl font-bold text-gray-800 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Nom"
                    />
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800 mt-2">{displayName}</h2>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              {/* Spécialisation */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold mb-2">Spécialisation:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.specialization || ''}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Informatique"
                  />
                ) : (
                  <p className="font-semibold text-gray-800">{editedUser.specialization || 'Non spécifié'}</p>
                )}
              </div>
              
              {/* Niveau */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold mb-2">Niveau:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.level || ''}
                    onChange={(e) => handleChange('level', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Master 2"
                  />
                ) : (
                  <p className="font-semibold text-gray-800">{editedUser.level || 'Non spécifié'}</p>
                )}
              </div>
              
              {/* Université */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold mb-2">Université:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.university || ''}
                    onChange={(e) => handleChange('university', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: ENSPY"
                  />
                ) : (
                  <p className="font-semibold text-gray-800">{editedUser.university || 'Non spécifié'}</p>
                )}
              </div>
              
              {/* Ville */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold mb-2">Ville:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Yaoundé"
                  />
                ) : (
                  <p className="font-semibold text-gray-800">{editedUser.city || 'Non spécifié'}</p>
                )}
              </div>

              {/* Majeure */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold mb-2">Majeure:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.major || ''}
                    onChange={(e) => handleChange('major', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Intelligence Artificielle"
                  />
                ) : (
                  <p className="font-semibold text-gray-800">{editedUser.major || 'Non spécifié'}</p>
                )}
              </div>

              {/* Mineure */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold mb-2">Mineure:</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.minor || ''}
                    onChange={(e) => handleChange('minor', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Data Science"
                  />
                ) : (
                  <p className="font-semibold text-gray-800">{editedUser.minor || 'Non spécifié'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="text-purple-600" size={32} />
                </div>
                <p className="text-sm text-gray-500 mb-1">Nombre de cours participé</p>
                <p className="text-4xl font-bold text-purple-600">0</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="text-purple-600" size={32} />
                </div>
                <p className="text-sm text-gray-500 mb-1">Certifications obtenues</p>
                <p className="text-4xl font-bold text-purple-600">0</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="text-purple-600" size={32} />
                </div>
                <p className="text-sm text-gray-500 mb-1">Assiduité</p>
                <p className="text-4xl font-bold text-purple-600">
                  {editedUser.averageGrade || '0'}%
                </p>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Répartition des Notes</h3>
              
              <div className="space-y-6">
                {grades.map((grade, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">{grade.subject}</span>
                      <span className="font-bold text-purple-600">{grade.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
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
                      strokeWidth="20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#7c3aed"
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
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Centres d'intérêt</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <span 
                      key={index}
                      className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
