'use client';
import { useState, useEffect } from 'react';
import { FaTrash, FaSearch, FaBook, FaEye, FaCheckCircle, FaClock, FaTimesCircle, FaFileAlt } from 'react-icons/fa';
import { AdminService } from '@/lib';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, color }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800"
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color} text-white`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    </motion.div>
);

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        draft: 0,
        archived: 0,
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllCourses();
            const coursesData = res.data || [];
            setCourses(coursesData);

            // Calculate stats
            setStats({
                total: coursesData.length,
                active: coursesData.filter((c: any) => c.status === 'PUBLISHED').length,
                draft: coursesData.filter((c: any) => c.status === 'DRAFT').length,
                archived: coursesData.filter((c: any) => c.status === 'ARCHIVED').length,
            });
        } catch (error) {
            console.error("Error fetching courses:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId: number) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold">Êtes-vous sûr de vouloir supprimer ce cours ?</p>
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
                                await AdminService.deleteCourse(courseId);
                                toast.success("Cours supprimé avec succès");
                                fetchCourses();
                            } catch (error) {
                                console.error("Error deleting course:", error);
                                toast.error("Erreur lors de la suppression");
                                setCourses(courses.filter(c => c.id !== courseId));
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

    const getStatusBadge = (status: string) => {
        const badges: any = {
            'PUBLISHED': { label: 'Actif', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
            'DRAFT': { label: 'Brouillon', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
            'ARCHIVED': { label: 'Archivé', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
        };
        const badge = badges[status] || badges['DRAFT'];
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>{badge.label}</span>;
    };

    const filteredCourses = courses.filter(c =>
        `${c.title} ${c.author?.firstName} ${c.author?.lastName} ${c.category}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Gestion des Cours</h1>
                    <p className="text-slate-500 dark:text-slate-400">Liste de tous les cours créés par les enseignants.</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400">
                    <FaBook size={24} />
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Cours"
                    value={loading ? "..." : stats.total}
                    icon={<FaBook size={20} />}
                    color="bg-purple-600"
                />
                <StatsCard
                    title="Actifs"
                    value={loading ? "..." : stats.active}
                    icon={<FaCheckCircle size={20} />}
                    color="bg-green-600"
                />
                <StatsCard
                    title="Brouillons"
                    value={loading ? "..." : stats.draft}
                    icon={<FaFileAlt size={20} />}
                    color="bg-yellow-600"
                />
                <StatsCard
                    title="Archivés"
                    value={loading ? "..." : stats.archived}
                    icon={<FaTimesCircle size={20} />}
                    color="bg-slate-600"
                />
            </div>

            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher un cours..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                />
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-slate-500 dark:text-slate-400 mt-4">Chargement des cours...</p>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <FaBook className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
                    <p className="text-slate-500 dark:text-slate-400">Aucun cours trouvé</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Titre</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Auteur</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Catégorie</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Enrollements</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredCourses.map((course) => (
                                    <motion.tr
                                        key={course.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                                    <FaBook className="text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{course.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{course.description?.substring(0, 50)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-900 dark:text-white">
                                                {course.author?.firstName} {course.author?.lastName}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{course.author?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium">
                                                {course.category || 'Non catégorisé'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(course.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <FaEye className="text-slate-400" size={14} />
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {course.enrollmentCount || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                title="Supprimer"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <Toaster position="top-right" />
        </div>
    );
}
