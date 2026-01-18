'use client';
import { useState, useEffect } from 'react';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaChartBar, FaUserGraduate, FaBook, FaUser } from 'react-icons/fa';
import { AdminService } from '@/lib';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, color, subtitle }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
    >
        <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${color} text-white shadow-lg`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
            </div>
        </div>
    </motion.div>
);

export default function AdminEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllEnrollments();
            // L'API retourne { data: [...] } d'après votre AdminService refactorisé
            const enrollmentsData = res.data || [];

            setEnrollments(enrollmentsData);

            setStats({
                total: enrollmentsData.length,
                pending: enrollmentsData.filter((e: any) => e.status === 'PENDING').length,
                approved: enrollmentsData.filter((e: any) => e.status === 'APPROVED').length,
                rejected: enrollmentsData.filter((e: any) => e.status === 'REJECTED').length,
            });
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            toast.error("Erreur lors de la récupération des inscriptions");
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (enrollmentId: number) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold">Approuver cet enrollement ?</p>
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
                                // APPEL API RÉEL
                                await AdminService.approveEnrollment(enrollmentId);
                                toast.success("Enrollement approuvé avec succès");
                                // On rafraîchit la liste pour avoir les données à jour du serveur
                                fetchEnrollments();
                            } catch (error) {
                                console.error("Error approving enrollment:", error);
                                toast.error("Erreur lors de l'approbation");
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold"
                    >
                        Approuver
                    </button>
                </div>
            </div>
        ), { duration: Infinity });
    };

    const handleReject = async (enrollmentId: number) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold">Rejeter cet enrollement ?</p>
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
                                // APPEL API RÉEL
                                await AdminService.rejectEnrollment(enrollmentId);
                                toast.success("Enrollement rejeté");
                                // On rafraîchit la liste
                                fetchEnrollments();
                            } catch (error) {
                                console.error("Error rejecting enrollment:", error);
                                toast.error("Erreur lors du rejet");
                            }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
                    >
                        Rejeter
                    </button>
                </div>
            </div>
        ), { duration: Infinity });
    };

    const getStatusBadge = (status: string) => {
        const badges: any = {
            'PENDING': { label: 'En Attente', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: <FaClock size={12} /> },
            'APPROVED': { label: 'Approuvé', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <FaCheckCircle size={12} /> },
            'REJECTED': { label: 'Rejeté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <FaTimesCircle size={12} /> },
        };
        const badge = badges[status] || badges['PENDING'];
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                {badge.icon}
                {badge.label}
            </span>
        );
    };

    const filteredEnrollments = enrollments.filter(e => {
        // Ajout de vérifications de sécurité pour éviter les erreurs si l'objet student ou course est manquant
        const studentName = `${e?.userFullName || ''} ${e?.userFullName || ''}`.toLowerCase();
        const courseTitle = (e.course?.courseTitle || '').toLowerCase();
        const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || courseTitle.includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || e.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Gestion des Enrollements</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gérer les demandes d'inscription aux cours.</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400">
                    <FaUserGraduate size={24} />
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Enrollements"
                    value={loading ? "..." : stats.total}
                    icon={<FaChartBar size={24} />}
                    color="bg-purple-600"
                    subtitle="Toutes les demandes"
                />
                <StatsCard
                    title="En Attente"
                    value={loading ? "..." : stats.pending}
                    icon={<FaClock size={24} />}
                    color="bg-orange-600"
                    subtitle="À valider"
                />
                <StatsCard
                    title="Approuvés"
                    value={loading ? "..." : stats.approved}
                    icon={<FaCheckCircle size={24} />}
                    color="bg-green-600"
                    subtitle="Validés"
                />
                <StatsCard
                    title="Rejetés"
                    value={loading ? "..." : stats.rejected}
                    icon={<FaTimesCircle size={24} />}
                    color="bg-red-600"
                    subtitle="Refusés"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un étudiant ou un cours..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-3 rounded-xl font-semibold transition-all ${filterStatus === status
                                ? (status === 'ALL' ? 'bg-purple-600' : status === 'PENDING' ? 'bg-orange-600' : status === 'APPROVED' ? 'bg-green-600' : 'bg-red-600') + ' text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {status === 'ALL' ? 'Tous' : status === 'PENDING' ? 'En Attente' : status === 'APPROVED' ? 'Approuvés' : 'Rejetés'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table/Content */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-slate-500 dark:text-slate-400 mt-4">Chargement des enrollements...</p>
                </div>
            ) : filteredEnrollments.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <FaUserGraduate className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
                    <p className="text-slate-500 dark:text-slate-400">Aucun enrollement trouvé</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Étudiant</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Cours</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredEnrollments.map((enrollment) => (
                                    <motion.tr
                                        key={enrollment.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                                    <FaUser className="text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">
                                                        {enrollment.userFullName ? `${enrollment.userFullName} ` : 'Étudiant inconnu'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaBook className="text-purple-600 dark:text-purple-400" size={16} />
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{enrollment?.courseTitle || 'Cours inconnu'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(enrollment.status)}
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