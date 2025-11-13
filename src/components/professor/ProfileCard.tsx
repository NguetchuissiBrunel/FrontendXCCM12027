// components/professor/ProfileCard.tsx
'use client';
import { useState } from 'react';
import { Users, Award, Clock } from 'lucide-react';

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
      // Récupérer l'utilisateur complet depuis localStorage
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        
        // Mettre à jour les champs modifiables
        const updatedUser = {
          ...userData,
          firstName: editedProfessor.name.split(' ')[0],
          lastName: editedProfessor.name.split(' ').slice(1).join(' '),
          city: editedProfessor.city,
          university: editedProfessor.university,
          grade: editedProfessor.grade,
          certification: editedProfessor.certification,
          photoUrl: editedProfessor.photoUrl,
        };

        // Mettre à jour dans db.json
        await fetch(`http://localhost:4000/users/${editedProfessor.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUser),
        });

        // Mettre à jour localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        
        // Appeler le callback si fourni
        if (onUpdate) {
          onUpdate(editedProfessor);
        }
        
        alert('Profil mis à jour avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du profil');
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
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-purple-700">Profil de l'Enseignant</h2>
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

      <div className="grid grid-cols-3 gap-8">
        {/* Left: Profile Image & Basic Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-32 h-32 mx-auto bg-purple-300 rounded-full flex items-center justify-center text-purple-900 text-4xl font-bold mb-4">
              JB
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">No. Enseignant</p>
              <p className="font-semibold">{professor.id}</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">{professor.name}</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-semibold">Ville:</p>
              <p className="font-semibold text-gray-800">{professor.city}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-semibold">Université:</p>
              <p className="font-semibold text-gray-800">{professor.university}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-semibold">Grade:</p>
              <p className="font-semibold text-gray-800">{professor.grade}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-semibold">Certification:</p>
              <p className="font-semibold text-gray-800">{professor.certification}</p>
            </div>
          </div>
        </div>

        {/* Right: Stats & Performance */}
        <div className="col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-purple-50 rounded-2xl p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="text-purple-600" size={32} />
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Étudiants</p>
              <p className="text-4xl font-bold text-purple-600">{professor.totalStudents}</p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-purple-600" size={32} />
              </div>
              <p className="text-sm text-gray-500 mb-1">Taux de participation</p>
              <p className="text-4xl font-bold text-purple-600">{professor.participationRate}%</p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Award className="text-purple-600" size={32} />
              </div>
              <p className="text-sm text-gray-500 mb-1">Publications</p>
              <p className="text-4xl font-bold text-purple-600">{professor.publications}</p>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-purple-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Distribution des performances</h3>
            
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
                  <span className="text-sm font-medium text-gray-700">{item.range}</span>
                  <span className="text-sm font-bold text-purple-600 ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
