'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaTrash, FaSearch, FaChalkboardTeacher, FaPlus, FaTimes, FaEnvelope, FaLock, FaUser, FaBookOpen, FaUserGraduate, FaEye, FaEyeSlash, FaUniversity, FaAward } from 'react-icons/fa';
import { AdminService, User } from '@/lib';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function TeachersList() {
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        subjects: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        fetchTeachers();
        if (searchParams.get('add') === 'true') {
            setIsModalOpen(true);
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('add');
            router.replace(`/admindashboard/teachers?${newParams.toString()}`);
        }
    }, [searchParams, router]);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllTeachers();
            setTeachers(res.data || []);
        } catch (error) {
            console.error("Error fetching teachers:", error);
            toast.error("Erreur lors du chargement des enseignants");
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold">Êtes-vous sûr de vouloir supprimer cet enseignant ?</p>
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
                                await AdminService.deleteUser(userId);
                                toast.success("Enseignant supprimé avec succès");
                                fetchTeachers();
                            } catch (error) {
                                toast.error("Erreur lors de la suppression");
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

        setIsSubmitting(true);
        try {
            // On envoie uniquement les propriétés connues par l'interface TeacherRegisterRequest
            await AdminService.registerTeacher({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                // On transforme la chaîne de caractères en tableau pour le champ 'subjects'
                subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : [],
                city: "",
                university: "",
                certification: "",
                grade: "",
                photoUrl: ""
            });

            toast.success("Enseignant ajouté avec succès");
            setIsModalOpen(false);
            setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', subjects: '' });

            // Rafraîchissement des données
            setTimeout(() => fetchTeachers(), 500);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        `${t.firstName} ${t.lastName} ${t.email} ${t.subjects || t.specialization || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Gestion des Enseignants</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{teachers.length} enseignants inscrits</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
                >
                    <FaPlus size={14} />
                    <span>Ajouter</span>
                </button>
            </div>

            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher un enseignant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matières</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            ))
                        ) : filteredTeachers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Aucun enseignant trouvé</td>
                            </tr>
                        ) : (
                            filteredTeachers.map((teacher) => (
                                <tr
                                    key={teacher.id}
                                    onClick={() => {
                                        setSelectedUser(teacher);
                                        setIsDetailsOpen(true);
                                    }}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        {teacher.firstName} {teacher.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {teacher.email}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {teacher.subjects ? (Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : teacher.subjects) : (teacher.specialization || 'N/A')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(teacher.id!);
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl z-[101] overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold dark:text-white flex items-center space-x-2">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                            <FaChalkboardTeacher />
                                        </div>
                                        <span>Ajouter un Enseignant</span>
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                        <FaTimes size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prénom</label>
                                            <div className="relative">
                                                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                                                    placeholder="Albert"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nom</label>
                                            <div className="relative">
                                                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                                                    placeholder="Einstein"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                                                placeholder="albert.einstein@univ.tn"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirmer mot de passe</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 pb-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Matières / Spécialisation</label>
                                        <div className="relative">
                                            <FaBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.subjects}
                                                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                                                placeholder="Physique, Mathématiques"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 mt-4"
                                    >
                                        {isSubmitting ? 'Création...' : 'Ajouter l\'enseignant'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Details Modal */}
            <AnimatePresence>
                {isDetailsOpen && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDetailsOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl z-[101] overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 overflow-hidden">
                                            {selectedUser.photoUrl ? (
                                                <img src={selectedUser.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <FaUserGraduate size={32} />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold dark:text-white">
                                                {selectedUser.firstName} {selectedUser.lastName}
                                            </h2>
                                            <p className="text-purple-600 dark:text-purple-400 font-medium">Enseignant</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsDetailsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                                        <FaTimes size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prénom</label>
                                            <p className="text-slate-700 dark:text-slate-200 font-medium mt-1">
                                                {selectedUser.firstName}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nom</label>
                                            <p className="text-slate-700 dark:text-slate-200 font-medium mt-1">
                                                {selectedUser.lastName}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                            <p className="text-slate-700 dark:text-slate-200 font-medium flex items-center mt-1">
                                                <FaEnvelope className="mr-2 text-slate-400" />
                                                {selectedUser.email}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matières</label>
                                            <p className="text-slate-700 dark:text-slate-200 font-medium flex items-center mt-1">
                                                <FaBookOpen className="mr-2 text-slate-400" />
                                                {selectedUser.subjects ? (Array.isArray(selectedUser.subjects) ? selectedUser.subjects.join(', ') : selectedUser.subjects) : (selectedUser.specialization || 'Non spécifiées')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ville</label>
                                            <p className="text-slate-700 dark:text-slate-200 font-medium mt-1">
                                                {selectedUser.city || 'Non spécifiée'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Université</label>
                                            <p className="text-slate-700 dark:text-slate-200 font-medium flex items-center mt-1">
                                                <FaUniversity className="mr-2 text-slate-400" />
                                                {selectedUser.university || 'Non spécifiée'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grade</label>
                                            <p className="text-slate-700 dark:text-slate-200 font-medium flex items-center mt-1">
                                                <FaAward className="mr-2 text-slate-400" />
                                                {selectedUser.grade || 'Non spécifié'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <Toaster position="top-right" />
        </div>
    );
}

export default function AdminTeachersPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <TeachersList />
        </Suspense>
    );
}