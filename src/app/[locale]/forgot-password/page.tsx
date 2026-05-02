'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { AuthControllerService } from '@/lib';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setError('Veuillez entrer une adresse email valide.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await AuthControllerService.forgotPassword({ email });
            setSent(true);
            toast.success('Email de réinitialisation envoyé !');
        } catch {
            // Anti-énumération : on affiche toujours le même message
            setSent(true);
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
                    <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 mb-6 transition-colors w-fit">
                        <FaArrowLeft size={12} /> Retour à la connexion
                    </Link>

                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Mot de passe oublié
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Entrez votre email et nous vous enverrons un lien de réinitialisation.
                    </p>

                    {sent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✓</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Email envoyé !</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
                            </p>
                            <p className="text-xs text-gray-400 mt-3">Vérifiez aussi vos spams.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    placeholder="Votre adresse email"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg disabled:opacity-60"
                            >
                                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
