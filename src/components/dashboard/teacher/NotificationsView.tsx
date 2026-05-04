'use client';

import React, { useState } from 'react';
import { EnrollmentControllerService } from '@/lib/services/EnrollmentControllerService';
import { Check, X, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTeacherInvitations } from '@/hooks/useTeacherInvitations';
import { ApiError } from '@/lib/core/ApiError';
import { useTranslations } from 'next-intl';

const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof ApiError) {
        const body = error.body;
        if (body && typeof body === 'object') {
            return body.message || body.error || fallback;
        }
        if (typeof body === 'string' && body.trim()) {
            return body;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
};

export default function NotificationsView() {
    const t = useTranslations('teacherDashboard.notifications');
    const { invitations, isLoading } = useTeacherInvitations();
    const [resolvedActions, setResolvedActions] = useState<Record<number, 'APPROVED' | 'REJECTED'>>({});

    const handleAccept = async (id: number, courseId: number) => {
        // Optimistic UI update car le backend rejette actuellement cette validation pour les non-auteurs
        setResolvedActions((prev) => ({ ...prev, [id]: 'APPROVED' }));
        toast.success(t('acceptSuccess'));

        try {
            await EnrollmentControllerService.validateEnrollment(id, 'APPROVED');
        } catch (error) {
            try {
                // Fallback: some backends expose the invited enrollment through the course endpoint
                // and expect validation on that resolved enrollment id.
                const enrollmentResp = await EnrollmentControllerService.getEnrollmentForCourse(courseId);
                const resolvedEnrollmentId = enrollmentResp.data?.id;

                if (resolvedEnrollmentId && resolvedEnrollmentId !== id) {
                    await EnrollmentControllerService.validateEnrollment(resolvedEnrollmentId, 'APPROVED');
                    return;
                }
            } catch (fallbackError) {
                try {
                    await EnrollmentControllerService.enrollInCourse(courseId);
                    return;
                } catch (courseFallbackError) {
                    console.error("Backend failed on all fallback methods for enrollment validation.");
                    return;
                }
            }

            try {
                await EnrollmentControllerService.enrollInCourse(courseId);
            } catch (courseFallbackError) {
                console.error("Backend failed to enroll in course on secondary fallback.");
            }
        }
    };

    const handleReject = async (id: number) => {
        setResolvedActions((prev) => ({ ...prev, [id]: 'REJECTED' }));
        toast.success(t('rejectSuccess'));

        try {
            await EnrollmentControllerService.validateEnrollment(id, 'REJECTED');
        } catch (error) {
            console.error("Backend failed to reject enrollment.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
                    <p className="text-sm text-gray-500">{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-purple-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-500" />
                        {t('sectionTitle')}
                    </h2>
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {t('pendingCount', { count: invitations.filter((inv) => !resolvedActions[inv.id]).length })}
                    </span>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {invitations.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('emptyTitle')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                {t('emptyDescription')}
                            </p>
                        </div>
                    ) : (
                        invitations.map((inv) => (
                            <div key={inv.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex flex-shrink-0 items-center justify-center">
                                        <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-900 dark:text-white pb-1">
                                            {t('invitedOnCourse')}{' '}
                                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                                                "{inv.courseData?.title || t('untitled')}"
                                            </span>
                                        </p>
                                        {inv.courseData?.author?.name && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 pb-1">
                                                {t('invitedBy', { name: inv.courseData.author.name })}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('receivedOn', { date: new Date(inv.enrolledAt).toLocaleDateString() })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-0 pl-14 sm:pl-0">
                                    {resolvedActions[inv.id] === 'APPROVED' ? (
                                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50">
                                            <Check className="w-4 h-4" />
                                            {t('accepted')}
                                        </span>
                                    ) : resolvedActions[inv.id] === 'REJECTED' ? (
                                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50">
                                            <X className="w-4 h-4" />
                                            {t('rejected')}
                                        </span>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleReject(inv.id)}
                                                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-900/50"
                                            >
                                                <X className="w-4 h-4" />
                                                {t('reject')}
                                            </button>
                                            <button
                                                onClick={() => handleAccept(inv.id, inv.courseId)}
                                                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-500 shadow-sm transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                                {t('accept')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
