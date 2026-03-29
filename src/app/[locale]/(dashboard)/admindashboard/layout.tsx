'use client';
import { ReactNode } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
