'use client';
import { useState, useEffect } from 'react';
import { FaTrash, FaSearch, FaBook, FaEye } from 'react-icons/fa';
import { AdminService } from '@/lib';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllCourses();
            setCourses(res.data || []);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;

        try {
            await AdminService.deleteCourse(courseId);
            toast.success("Cours supprimé avec succès");
            fetchCourses();
        } catch (error) {
            console.error("Error deleting course:", error);
            toast.error("Erreur lors de la suppression");
            setCourses(courses.filter(c => c.id !== courseId));
        }
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

            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher un cours (titre, auteur, catégorie)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Titre</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Auteur</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Catégorie</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            ))
                        ) : filteredCourses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Aucun cours trouvé</td>
                            </tr>
                        ) : (
                            filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        {course.title}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {course.author ? `${course.author.firstName} ${course.author.lastName}` : 'Anonyme'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {course.category}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.status === 'PUBLISHED'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                                title="Supprimer le cours"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}
