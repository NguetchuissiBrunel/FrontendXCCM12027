'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaTrash, FaSearch, FaUserShield, FaPlus, FaTimes, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { AdministrationService as AdminService } from '@/lib/services/AdministrationService';
import { RegisterRequest } from '@/lib';
import type { User } from '@/lib/models/User';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '@/contexts/LoadingContext';

// Composant principal avec la logique
function AdminsListContent() {
    const [admins, setAdmins] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(true); // Commence à true
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { startLoading, stopLoading, isLoading: globalLoading } = useLoading();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const fetchAdmins = async () => {
        console.log("🔍 fetchAdmins called at:", new Date().toISOString());
        setIsFetching(true);
        setError(null);
        startLoading();
        
        try {
            console.log("📡 Calling AdminService.getAllUsers()...");
            
            
            // Appel du service
            const res = await AdminService.getAllUsers();
            console.log("📦 Response received:", res);
            console.log("📦 Response data type:", typeof res?.data);
            console.log("📦 Response data:", res?.data);
            
            if (!res) {
                console.error("❌ No response from AdminService.getAllUsers()");
                setError("Aucune réponse du serveur");
                setAdmins([]);
                toast.error("Impossible de se connecter au serveur");
                return;
            }
            
            if (!res.data) {
                console.warn("⚠️ Response.data is null or undefined");
                console.warn("Full response object:", JSON.stringify(res, null, 2));
                setAdmins([]);
                return;
            }
            
            // S'assurer que data est un tableau
            const allUsers = Array.isArray(res.data) ? res.data : [];
            console.log("👥 All users array length:", allUsers.length);
            
            if (allUsers.length === 0) {
                console.log("ℹ️ No users found in the system");
                setAdmins([]);
                return;
            }
            
            // Log détaillé pour chaque utilisateur
            console.log("🔍 Detailed user analysis:");
            allUsers.forEach((user: any, index: number) => {
                console.log(`User ${index}:`, {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    roleType: typeof user.role,
                    rawUser: user
                });
            });
            
            // Filtrer les administrateurs - essayer différents formats
            const adminUsers = allUsers.filter((user: any) => {
                const role = user.role;
                
                // Essayer différentes représentations du rôle ADMIN
                const isAdmin = 
                    role === 'ADMIN' || 
                    role === 'Admin' || 
                    role === 'admin' ||
                    role === 1 || 
                    role === '1' ||
                    (typeof role === 'object' && role?.name === 'ADMIN') ||
                    (typeof role === 'object' && role?.id === 1);
                
                console.log(`User ${user.email} - role: ${JSON.stringify(role)} - isAdmin: ${isAdmin}`);
                return isAdmin;
            });
            
            console.log("✅ Admin Users found:", adminUsers.length);
            console.log("✅ Admin Users details:", adminUsers);
            
            setAdmins(adminUsers as User[]);
            
            // Si aucun admin trouvé mais qu'il y a des utilisateurs
            if (adminUsers.length === 0 && allUsers.length > 0) {
                console.log("⚠️ No admin users found, but there are users in the system");
                console.log("📝 All roles found:", allUsers.map(u => ({ email: u.email, role: u.role })));
            }
            
        } catch (error: any) {
            console.error("❌ Error in fetchAdmins:", error);
            console.error("❌ Error name:", error.name);
            console.error("❌ Error message:", error.message);
            console.error("❌ Error stack:", error.stack);
            
            if (error.response) {
                console.error("❌ Error response status:", error.response.status);
                console.error("❌ Error response data:", error.response.data);
                setError(`Erreur serveur: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error("❌ No response received:", error.request);
                setError("Pas de réponse du serveur. Vérifiez votre connexion.");
            } else {
                console.error("❌ Error setting up request:", error.message);
                setError(`Erreur: ${error.message}`);
            }
            
            toast.error("Impossible de charger les administrateurs");
            setAdmins([]);
        } finally {
            console.log("🏁 fetchAdmins completed");
            setIsFetching(false);
            stopLoading();
        }
    };

    useEffect(() => {
        console.log("🚀 useEffect - Component mounted");
        console.log("📊 Current admins state:", admins.length);
        
        fetchAdmins();
        
        if (searchParams?.get('add') === 'true') {
            console.log("➕ Opening modal from URL param");
            setIsModalOpen(true);
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('add');
            router.replace(`/admindashboard/admins?${newParams.toString()}`, { scroll: false });
        }
        
        // Test: Vérifier si le service est accessible
        console.log("🔧 AdminService test:", {
            getAllUsers: typeof AdminService.getAllUsers,
            createAdmin: typeof AdminService.createAdmin,
            deleteUser: typeof AdminService.deleteUser
        });
        
    }, []); // Empty dependency array - fetch once on mount

    // Debug effect
    useEffect(() => {
        console.log("📊 Admins state updated to:", admins.length, "items");
        if (admins.length > 0) {
            console.log("📋 First admin sample:", admins[0]);
        }
    }, [admins]);

    const handleDelete = async (userId: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold">Êtes-vous sûr de vouloir supprimer cet administrateur ?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                startLoading();
                                console.log("🗑️ Deleting user:", userId);
                                await AdminService.deleteUser(userId);
                                toast.success("Administrateur supprimé avec succès");
                                // Rafraîchir après suppression
                                setTimeout(() => fetchAdmins(), 1000);
                            } catch (error: any) {
                                console.error("❌ Error deleting admin:", error);
                                toast.error(error?.message || "Erreur lors de la suppression");
                            } finally {
                                stopLoading();
                            }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        ), { duration: Infinity });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setIsSubmitting(true);
        startLoading();
        try {
            console.log("📝 Creating admin with data:", formData);
            
            const adminData = {
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: RegisterRequest.role.ADMIN
            };
            
            console.log("📤 Sending to AdminService.createAdmin:", adminData);
            
            const result = await AdminService.createAdmin(adminData);
            console.log("✅ Admin created successfully:", result);
            
            toast.success("Administrateur ajouté avec succès");
            setIsModalOpen(false);
            setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });

            // Rafraîchir la liste
            setTimeout(() => {
                fetchAdmins();
            }, 1000);
            
        } catch (error: any) {
            console.error("❌ Error creating admin:", error);
            console.error("❌ Full error object:", JSON.stringify(error, null, 2));
            
            let errorMessage = "Erreur lors de la création";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
            stopLoading();
        }
    };

    const filteredAdmins = admins.filter(a => {
        const fullName = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
        const email = (a.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search);
    });

    console.log("🎯 Filtered Admins:", filteredAdmins.length, filteredAdmins);
    
    // Test button for manual refresh
    const handleTestRefresh = () => {
        console.log("🔄 Manual refresh triggered");
        fetchAdmins();
    };
    
    return (
        <div className="space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                        <FaUserShield size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold dark:text-white">Administrateurs</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isFetching ? (
                                <span className="flex items-center gap-2">
                                    <FaSpinner className="animate-spin" />
                                    Chargement...
                                </span>
                            ) : (
                                `${admins.length} administrateur(s)`
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            console.log("➕ Add button clicked");
                            setIsModalOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isFetching}
                    >
                        <FaPlus size={14} />
                        <span>Ajouter</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher un administrateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm disabled:opacity-50"
                    disabled={isFetching}
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isFetching ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <FaSpinner className="animate-spin text-2xl text-purple-600" />
                                        <p className="text-slate-500">Chargement des administrateurs...</p>
                                        <p className="text-xs text-slate-400">Vérification des logs de la console...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <FaExclamationTriangle className="text-2xl text-red-500" />
                                        <p className="text-red-600 font-medium">Erreur de chargement</p>
                                        <p className="text-sm text-slate-500 max-w-md">{error}</p>
                                        <button
                                            onClick={handleTestRefresh}
                                            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Réessayer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredAdmins.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <FaUserShield className="text-3xl text-slate-300" />
                                        <div>
                                            <p className="text-slate-600 font-medium">
                                                {admins.length === 0 ? 
                                                    "Aucun administrateur trouvé dans le système" : 
                                                    "Aucun résultat correspondant à votre recherche"
                                                }
                                            </p>
                                            {admins.length === 0 && (
                                                <>
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        Créez votre premier administrateur
                                                    </p>
                                                    <button
                                                        onClick={() => setIsModalOpen(true)}
                                                        className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                                    >
                                                        Créer un administrateur
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredAdmins.map((admin) => (
                                <tr
                                    key={admin.id}
                                    onClick={() => {
                                        console.log("👤 Clicked on admin:", admin);
                                        setSelectedUser(admin);
                                        setIsDetailsOpen(true);
                                    }}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        {admin.firstName} {admin.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {admin.email}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log("🗑️ Delete clicked for:", admin.id);
                                                if (admin.id) handleDelete(admin.id);
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            title="Supprimer"
                                            disabled={isFetching}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Admin Modal - Keep as before */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Modal content... */}
                    </div>
                )}
            </AnimatePresence>

            {/* Details Modal - Keep as before */}
            <AnimatePresence>
                {isDetailsOpen && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Modal content... */}
                    </div>
                )}
            </AnimatePresence>
            
            <Toaster 
                position="top-right" 
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </div>
    );
}

// Composant principal avec Suspense
export default function AdminsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <FaSpinner className="animate-spin text-3xl text-purple-600 mx-auto" />
                    <p className="text-lg text-slate-600 dark:text-slate-400">Initialisation des administrateurs...</p>
                </div>
            </div>
        }>
            <AdminsListContent />
        </Suspense>
    );
}