"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Construction } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 max-w-lg w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto mb-8 flex justify-center"
                >
                    <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex items-center justify-center p-6 border border-gray-100 dark:border-gray-700">
                        <Image
                            src="/images/capture.png"
                            alt="Logo"
                            width={120}
                            height={120}
                            className="w-full h-full object-contain"
                            priority
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 tracking-tight">
                        404
                    </h1>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Coming Soon
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                        Oops! cette page est encore en production
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="group inline-flex items-center px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Go Back Home
                        </Link>
                    </div>
                </motion.div>
            </div>

            <footer className="pt-200 absolute bottom-8 text-center text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} XCCM. All rights reserved.</p>
            </footer>
        </div>
    );
}
