'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
<<<<<<< HEAD
import { FaUsers, FaChalkboardTeacher, FaBook, FaThLarge, FaSignOutAlt, FaUserGraduate, FaUser } from 'react-icons/fa';
=======
import { FaUsers, FaChalkboardTeacher, FaBook, FaThLarge, FaSignOutAlt, FaUserGraduate } from 'react-icons/fa';
>>>>>>> main
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const AdminSidebar = () => {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const menuItems = [
        { name: 'Vue d\'ensemble', icon: <FaThLarge />, path: '/admindashboard' },
        { name: 'Étudiants', icon: <FaUsers />, path: '/admindashboard/students' },
        { name: 'Enseignants', icon: <FaChalkboardTeacher />, path: '/admindashboard/teachers' },
        { name: 'Cours', icon: <FaBook />, path: '/admindashboard/courses' },
        { name: 'Enrollements', icon: <FaUserGraduate />, path: '/admindashboard/enrollments' },
<<<<<<< HEAD
        { name: 'Administrateurs', icon: <FaUser />, path: '/admindashboard/admins' },
=======
>>>>>>> main
    ];

    return (
        <div className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 z-50 shadow-xl transition-all duration-300">
            {/* Logo/Branding Section */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <Link href="/admindashboard" className="flex items-center gap-3 px-2 py-1 group">
                    <div className="relative w-10 h-10 flex-shrink-0">
                        <Image
                            src="/images/Capture.png"
                            alt="XCCM Logo"
                            fill
                            className="object-contain rounded-lg transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-black text-xl bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tighter">
                            XCCM1
                        </h1>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-1">Administrateur</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link key={item.path} href={item.path}>
                            <motion.div
                                whileHover={{ x: 5 }}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 text-purple-600 dark:text-purple-400 font-bold border-l-4 border-purple-600 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-300'
                                    }`}
                            >
                                <span className={`text-xl ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>{item.icon}</span>
                                <span>{item.name}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <Link href="/admindashboard/profil">
                    <div className="flex items-center space-x-3 p-3 mb-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-purple-500">
                            {user?.firstName?.[0] || user?.email?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-slate-900 dark:text-white">
                                {user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}` : 'Administrateur'}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate uppercase tracking-tight">{user?.email || 'admin@gmail.com'}</p>
                        </div>
                    </div>
                </Link>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all font-semibold"
                >
                    <FaSignOutAlt />
                    <span>Déconnexion</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
