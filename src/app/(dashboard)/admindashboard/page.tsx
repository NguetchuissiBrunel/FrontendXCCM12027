'use client';
import { motion } from 'framer-motion';
import { FaUsers, FaChalkboardTeacher, FaBook, FaChartBar, FaUserShield, FaCheckCircle, FaClock, FaTimesCircle, FaFileAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { AdminService } from '@/lib';

const StatsCard = ({ title, value, icon, color, subtitle }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
    >
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-xl ${color} text-white`}>
                {icon}
            </div>
        </div>
        <div className="mt-4">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
        </div>
    </motion.div>
);

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        students: 0,
        teachers: 0,
        totalCourses: 0,
        activeCourses: 0,
        draftCourses: 0,
        archivedCourses: 0,
        totalEnrollments: 0,
        pendingEnrollments: 0,
        approvedEnrollments: 0,
        rejectedEnrollments: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await AdminService.getAdminStats();
                const data = response.data || response;

                setStats({
                    totalUsers: data.totalUsers || 0,
                    students: data.studentCount || 0,
                    teachers: data.teacherCount || 0,
                    totalCourses: data.totalCourses || 0,
                    activeCourses: data.activeCourses || 0,
                    draftCourses: data.draftCourses || 0,
                    archivedCourses: data.archivedCourses || 0,
                    totalEnrollments: data.totalEnrollments || 0,
                    pendingEnrollments: data.pendingEnrollments || 0,
                    approvedEnrollments: data.approvedEnrollments || 0,
                    rejectedEnrollments: data.rejectedEnrollments || 0,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
                setStats({
                    totalUsers: 0,
                    students: 0,
                    teachers: 0,
                    totalCourses: 0,
                    activeCourses: 0,
                    draftCourses: 0,
                    archivedCourses: 0,
                    totalEnrollments: 0,
                    pendingEnrollments: 0,
                    approvedEnrollments: 0,
                    rejectedEnrollments: 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* Section Utilisateurs */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaUsers className="text-purple-600" />
                    Utilisateurs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Total Utilisateurs"
                        value={loading ? "..." : stats.totalUsers}
                        icon={<FaUserShield size={24} />}
                        color="bg-purple-600 shadow-purple-200"
                    />
                    <StatsCard
                        title="Total Étudiants"
                        value={loading ? "..." : stats.students}
                        icon={<FaUsers size={24} />}
                        color="bg-indigo-600 shadow-indigo-200"
                    />
                    <StatsCard
                        title="Total Enseignants"
                        value={loading ? "..." : stats.teachers}
                        icon={<FaChalkboardTeacher size={24} />}
                        color="bg-blue-600 shadow-blue-200"
                    />
                </div>
            </div>

            {/* Section Cours */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaBook className="text-purple-600" />
                    Cours
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Cours"
                        value={loading ? "..." : stats.totalCourses}
                        icon={<FaBook size={24} />}
                        color="bg-pink-600 shadow-pink-200"
                    />
                    <StatsCard
                        title="Cours Actifs"
                        value={loading ? "..." : stats.activeCourses}
                        icon={<FaCheckCircle size={24} />}
                        color="bg-green-600 shadow-green-200"
                        subtitle="Publiés et disponibles"
                    />
                    <StatsCard
                        title="Brouillons"
                        value={loading ? "..." : stats.draftCourses}
                        icon={<FaFileAlt size={24} />}
                        color="bg-yellow-600 shadow-yellow-200"
                        subtitle="En cours de création"
                    />
                    <StatsCard
                        title="Archivés"
                        value={loading ? "..." : stats.archivedCourses}
                        icon={<FaTimesCircle size={24} />}
                        color="bg-slate-600 shadow-slate-200"
                        subtitle="Non disponibles"
                    />
                </div>
            </div>

            {/* Section Enrollements */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaChartBar className="text-purple-600" />
                    Enrollements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Enrollements"
                        value={loading ? "..." : stats.totalEnrollments}
                        icon={<FaChartBar size={24} />}
                        color="bg-violet-600 shadow-violet-200"
                    />
                    <StatsCard
                        title="En Attente"
                        value={loading ? "..." : stats.pendingEnrollments}
                        icon={<FaClock size={24} />}
                        color="bg-orange-600 shadow-orange-200"
                        subtitle="À valider"
                    />
                    <StatsCard
                        title="Approuvés"
                        value={loading ? "..." : stats.approvedEnrollments}
                        icon={<FaCheckCircle size={24} />}
                        color="bg-emerald-600 shadow-emerald-200"
                        subtitle="Validés"
                    />
                    <StatsCard
                        title="Rejetés"
                        value={loading ? "..." : stats.rejectedEnrollments}
                        icon={<FaTimesCircle size={24} />}
                        color="bg-red-600 shadow-red-200"
                        subtitle="Refusés"
                    />
                </div>
            </div>

            {/* Actions Rapides et Aide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <FaChartBar className="text-purple-600" />
                            <span>Actions Rapides</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => window.location.href = '/admindashboard/students?add=true'}
                            className="flex flex-col items-center justify-center p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all group"
                        >
                            <div className="p-3 bg-indigo-600 rounded-xl text-white mb-3 shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                                <FaUsers size={20} />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ajouter Étudiant</span>
                        </button>
                        <button
                            onClick={() => window.location.href = '/admindashboard/teachers?add=true'}
                            className="flex flex-col items-center justify-center p-6 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all group"
                        >
                            <div className="p-3 bg-purple-600 rounded-xl text-white mb-3 shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                                <FaChalkboardTeacher size={20} />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ajouter Enseignant</span>
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-2xl shadow-xl text-white">
                    <h2 className="text-2xl font-bold mb-4">Besoin d'aide ?</h2>
                    <p className="mb-6 opacity-90 text-sm leading-relaxed">
                        En tant qu'administrateur, vous avez accès à tous les outils de gestion des utilisateurs et des cours.
                        Vous pouvez supprimer des comptes, modérer le contenu et consulter les statistiques en temps réel.
                    </p>
                    <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg">
                        Consulter le guide
                    </button>
                </div>
            </div>
        </div>
    );
}
