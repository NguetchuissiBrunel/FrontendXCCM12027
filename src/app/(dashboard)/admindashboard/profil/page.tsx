'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserShield, FaEnvelope, FaUser } from 'react-icons/fa';
<<<<<<< HEAD
import { AdminService } from '@/lib';
=======
>>>>>>> main
import { Award, BookOpen, Clock } from 'lucide-react';
import { OpenAPI } from '@/lib/core/OpenAPI';
import toast, { Toaster } from 'react-hot-toast';

interface AdminUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    photoUrl?: string;
    city?: string;
    phone?: string;
}

export default function AdminProfile() {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [editedUser, setEditedUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
<<<<<<< HEAD
    const [stats, setStats] = useState({ totalUsers: 0 });
    const [statsLoading, setStatsLoading] = useState(true);
=======
>>>>>>> main
    const router = useRouter();

    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser');

        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            const userData = JSON.parse(currentUser);
            setUser(userData);
            setEditedUser(userData);
        } catch (error) {
            console.error('Erreur lors du chargement des données utilisateur:', error);
        } finally {
            setLoading(false);
        }
<<<<<<< HEAD
        fetchStats();
    }, [router]);

    const fetchStats = async () => {
        try {
            const res = await AdminService.getAdminStats();
            const data = res.data || res;
            setStats({ totalUsers: data.totalUsers || 0 });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setStatsLoading(false);
        }
    };

=======
    }, [router]);

>>>>>>> main
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
            // Try to update via backend API
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${OpenAPI.BASE}/api/users/${editedUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: JSON.stringify(editedUser),
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const result = await response.json();
                const updatedData = result.data || result;

                // Update localStorage with backend response
                localStorage.setItem('currentUser', JSON.stringify(updatedData));
                setUser(updatedData);
                setEditedUser(updatedData);

                toast.success('Profil mis à jour avec succès !');
            } catch (apiError) {
                console.warn('⚠️ API non disponible, mise à jour locale uniquement:', apiError);
                // Fallback: update localStorage only
                localStorage.setItem('currentUser', JSON.stringify(editedUser));
                setUser(editedUser);
                toast.success('Profil mis à jour localement');
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            toast.error('Erreur lors de la sauvegarde du profil');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: keyof AdminUser, value: string) => {
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
                toast.error('Veuillez sélectionner une image valide');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error("L'image ne doit pas dépasser 5MB");
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user || !editedUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-purple-200 dark:border-gray-700">
                        <FaUserShield className="text-purple-600 dark:text-purple-400 mx-auto mb-4" size={64} />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Profil non disponible</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Vous devez être connecté en tant qu'administrateur pour accéder à cette page.</p>
                        <button
                            onClick={() => router.push('/admin/login')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Se connecter
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const displayName = `${editedUser.firstName} ${editedUser.lastName}`;
    const defaultAvatar = '/images/pp.jpeg';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">Mon Profil Administrateur</h1>
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

            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Profile Info */}
                <div className="col-span-1 space-y-6">
                    {/* Profile Picture */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
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
                            {isEditing ? (
                                <div className="mt-2 space-y-2">
                                    <input
                                        type="text"
                                        value={editedUser.firstName}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                        className="w-full px-3 py-2 text-center text-xl font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Prénom"
                                    />
                                    <input
                                        type="text"
                                        value={editedUser.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                        className="w-full px-3 py-2 text-center text-xl font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Nom"
                                    />
                                </div>
                            ) : (
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{displayName}</h2>
                            )}
                            <p className="text-purple-600 dark:text-purple-400 font-semibold mt-1">Administrateur</p>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700 space-y-4">
                        {/* Email */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">Email:</p>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editedUser.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="admin@xccm.tn"
                                />
                            ) : (
                                <p className="font-semibold text-gray-800 dark:text-white">{editedUser.email || 'Non spécifié'}</p>
                            )}
                        </div>

                        {/* Ville */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">Ville:</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedUser.city || ''}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Tunis"
                                />
                            ) : (
                                <p className="font-semibold text-gray-800 dark:text-white">{editedUser.city || 'Non spécifié'}</p>
                            )}
                        </div>

                        {/* Téléphone */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">Téléphone:</p>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editedUser.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="+216 XX XXX XXX"
                                />
                            ) : (
                                <p className="font-semibold text-gray-800 dark:text-white">{editedUser.phone || 'Non spécifié'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Admin Info */}
                <div className="col-span-2 space-y-6">
                    {/* Admin Stats */}
<<<<<<< HEAD
                    <div className="grid grid-cols-2 gap-6">
=======
                    <div className="grid grid-cols-3 gap-6">
>>>>>>> main
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                                <FaUser className="text-purple-600 dark:text-purple-400" size={32} />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Utilisateurs</p>
<<<<<<< HEAD
                            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                {statsLoading ? "..." : stats.totalUsers}
                            </p>
=======
                            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">0</p>
>>>>>>> main
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                                <FaUserShield className="text-purple-600 dark:text-purple-400" size={32} />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Accès Admin</p>
                            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">✓</p>
                        </div>
<<<<<<< HEAD
=======

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                                <FaEnvelope className="text-purple-600 dark:text-purple-400" size={32} />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Messages</p>
                            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">0</p>
                        </div>
>>>>>>> main
                    </div>

                    {/* Admin Privileges */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Privilèges Administrateur</h3>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-900/30">
                                <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white">✓</div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">Gestion des utilisateurs</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Créer, modifier et supprimer des comptes</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-900/30">
                                <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white">✓</div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">Gestion des cours</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Superviser et modérer le contenu</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-900/30">
                                <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white">✓</div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">Statistiques complètes</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Accès à toutes les données analytiques</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-900/30">
                                <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white">✓</div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">Configuration système</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Paramètres avancés de la plateforme</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}
