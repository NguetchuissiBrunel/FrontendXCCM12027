'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { AuthControllerService } from '@/lib';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const t = searchParams.get('token');
        if (t) setToken(t);
    }, [searchParams]);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!password) errs.password = 'Le mot de passe est requis.';
        else if (password.length < 8) errs.password = 'Minimum 8 caractères.';
        if (password !== confirm) errs.confirm = 'Les mots de passe ne correspondent pas.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!token) {
            toast.error('Token de réinitialisation manquant.');
            return;
        }
        setIsSubmitting(true);
        try {
            await AuthControllerService.resetPassword({ token, newPassword: password } as any);
            setDone(true);
            toast.success('Mot de passe réinitialisé !');
            setTimeout(() => router.push('/login'), 2500);
        } catch (err: any) {
            const msg = err?.body?.message || err?.message || 'Lien invalide ou expiré.';
            toast.error(msg);
            setErrors({ submit: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
            style={{ backgroundImage: "url('/images/fond5.jpeg')" }}
        >
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
            <div className="relative z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800"
                >
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Nouveau mot de passe
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Choisissez un nouveau mot de passe sécurisé (minimum 8 caractères).
                    </p>

                    {done ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✓</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mot de passe mis à jour !</h3>
                            <p className="text-sm text-gray-500">Redirection vers la connexion...</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nouveau mot de passe */}
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nouveau mot de passe"
                                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                                    disabled={isSubmitting}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

                            {/* Confirmation */}
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="Confirmer le mot de passe"
                                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                                    disabled={isSubmitting}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                            {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}
                            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg disabled:opacity-60"
                            >
                                {isSubmitting ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
                            </button>

                            <p className="text-center text-sm text-gray-500">
                                <Link href="/login" className="text-purple-600 hover:text-purple-700 transition-colors">
                                    Retour à la connexion
                                </Link>
                            </p>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
