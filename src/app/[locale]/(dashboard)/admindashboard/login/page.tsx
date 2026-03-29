'use client';
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { FaUserShield, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const AdminLoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user && user.role === 'admin') {
            router.push('/admindashboard');
        }
    }, [user, router]);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!formData.email) newErrors.email = "L'email est requis";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide";
        if (!formData.password) newErrors.password = "Le mot de passe est requis";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            await login(formData.email, formData.password);
            toast.success("Connexion Admin réussie !");
            router.push('/admindashboard');
        } catch (error: any) {
            console.error("Erreur lors de la connexion admin:", error);

            let errorMessage = "Une erreur est survenue. Veuillez réessayer.";

            if (error?.body?.message) {
                errorMessage = error.body.message;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.status === 401) {
                errorMessage = "Email ou mot de passe incorrect";
            } else if (error?.status === 403) {
                errorMessage = "Accès refusé";
            } else if (error?.status === 500) {
                errorMessage = "Erreur interne du serveur (500)";
            }

            setErrors({ submit: errorMessage });
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm, login, router]);

    const renderForm = useMemo(() => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors duration-300"
        >
            <div className="flex flex-col items-center space-y-2 mb-2">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full border border-purple-200 dark:border-purple-800 shadow-inner">
                    <FaUserShield size={32} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Espace Administrateur
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez votre plateforme en toute sécurité</p>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="email"
                        placeholder="Email admin"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all outline-none"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mot de passe"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 pr-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            >
                {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>

            <div className="text-center mt-6 space-y-4">
                <Link href="/admindashboard/register" className="block text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                    Créer un compte administrateur
                </Link>
            </div>

            {errors.submit && <p className="text-red-500 text-xs text-center mt-2">{errors.submit}</p>}
            <Toaster position="top-right" />
        </motion.div>
    ), [formData, errors, isSubmitting, showPassword, handleSubmit]);

    return (
        <div
            className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 transition-colors duration-300"
            style={{ backgroundImage: "url('/images/fond5.jpeg')" }}
        >
            <div className="absolute inset-0 bg-black/40 dark:bg-black/70 transition-colors duration-300"></div>

            <div className="relative z-10 w-full max-w-md">
                <AnimatePresence mode="wait">
                    {renderForm}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminLoginPage;
