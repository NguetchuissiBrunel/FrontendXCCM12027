'use client';
import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { FaUserShield, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const AdminRegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const { registerAdmin } = useAuth();

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName) newErrors.firstName = "Prénom requis";
        if (!formData.lastName) newErrors.lastName = "Nom requis";
        if (!formData.email) newErrors.email = "L'email est requis";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide";

        if (!formData.password) {
            newErrors.password = "Le mot de passe est requis";
        } else if (formData.password.length < 8) {
            newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            console.log("Tentative d'inscription admin...");
            // Test avec 'ADMIN' en majuscules car c'est souvent le cas pour les enums Spring Boot
            // Et inclusion de confirmPassword au cas où le backend le requiert
            await registerAdmin({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                role: 'ADMIN'
            });
            toast.success("Compte Administrateur créé !");
            router.push('/admindashboard');
        } catch (error: any) {
            console.error("Détails de l'erreur d'inscription:", error);

            let errorMessage = "Une erreur est survenue lors de l'inscription.";

            // Si l'erreur est 'Network Error', cela peut être dû à un problème de CORS sur une erreur 4xx/5xx
            if (error?.message === "Network Error") {
                errorMessage = "Erreur de connexion : Le serveur est injoignable ou rejette la requête. Tentative avec un format alternatif...";

                // Deuxième tentative avec 'admin' en minuscules si 'ADMIN' échoue avec une erreur réseau immédiate
                try {
                    await registerAdmin({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        password: formData.password,
                        confirmPassword: formData.confirmPassword,
                        role: 'admin'
                    });
                    toast.success("Compte Administrateur créé (format alternatif) !");
                    router.push('/admindashboard');
                    return;
                } catch (retryError: any) {
                    errorMessage = "Erreur persistante : " + (retryError?.message || "Erreur réseau");
                }
            } else if (error?.body?.message) {
                errorMessage = error.body.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            setErrors({ submit: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm, registerAdmin, router]);

    const renderForm = useMemo(() => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors duration-300"
        >
            <div className="flex flex-col items-center space-y-2 mb-2">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full border border-purple-200 dark:border-purple-800 shadow-inner">
                    <FaUserShield size={32} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Inscription Admin
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Créez votre accès privilégié</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Prénom"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all outline-none"
                    />
                </div>
                <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Nom"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all outline-none"
                    />
                </div>
            </div>
            {(errors.firstName || errors.lastName) && <p className="text-red-500 text-xs text-center">Prénom et nom sont requis</p>}

            <div className="space-y-4">
                <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="email"
                        placeholder="Email professionnel"
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

                <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmer mot de passe"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 pl-10 pr-10 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            >
                {isSubmitting ? 'Action en cours...' : "S'inscrire en tant qu'Admin"}
            </button>

            <div className="text-center mt-6">
                <Link href="/admin/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Déjà un compte ? <span className="font-semibold text-purple-600 dark:text-purple-400">Connectez-vous</span>
                </Link>
            </div>

            {errors.submit && <p className="text-red-500 text-xs text-center mt-2">{errors.submit}</p>}
            <Toaster position="top-right" />
        </motion.div>
    ), [formData, errors, isSubmitting, showPassword, showConfirmPassword, handleSubmit]);

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

export default AdminRegisterPage;
