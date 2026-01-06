'use client';
import { motion } from 'framer-motion';
import { FaUsers, FaChalkboardTeacher, FaBook, FaArrowUp, FaChartBar, FaUserShield } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { AdminService } from '@/lib';

const StatsCard = ({ title, value, icon, color, trend }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
    >
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-xl ${color} text-white`}>
                {icon}
            </div>
            {trend && (
                <div className="flex items-center space-x-1 text-emerald-500 text-sm font-medium">
                    <FaArrowUp size={12} />
                    <span>{trend}%</span>
                </div>
            )}
        </div>
        <div className="mt-4">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
    </motion.div>
);

export default function AdminOverview() {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        courses: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [stuRes, teaRes, couRes] = await Promise.all([
                    AdminService.getAllStudents(),
                    AdminService.getAllTeachers(),
                    AdminService.getAllCourses()
                ]);
                setStats({
                    students: stuRes.data?.length || 0,
                    teachers: teaRes.data?.length || 0,
                    courses: couRes.data?.length || 0,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
                setStats({
                    students: 0,
                    teachers: 0,
                    courses: 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Étudiants"
                    value={loading ? "..." : stats.students}
                    icon={<FaUsers size={24} />}
                    color="bg-indigo-600 shadow-indigo-200"
                    trend="12"
                />
                <StatsCard
                    title="Total Enseignants"
                    value={loading ? "..." : stats.teachers}
                    icon={<FaChalkboardTeacher size={24} />}
                    color="bg-purple-600 shadow-purple-200"
                    trend="5"
                />
                <StatsCard
                    title="Cours Créés"
                    value={loading ? "..." : stats.courses}
                    icon={<FaBook size={24} />}
                    color="bg-pink-600 shadow-pink-200"
                    trend="8"
                />
            </div>

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
