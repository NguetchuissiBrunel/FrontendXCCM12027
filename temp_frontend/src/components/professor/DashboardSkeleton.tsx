import React from 'react';

const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
            {/* Top Section Skeleton */}
            <div className="bg-white dark:bg-gray-800 px-8 py-8 mb-8 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-3xl space-y-4">
                        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="h-6 w-96 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-12 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        <div className="h-12 w-40 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                    </div>
                </div>

                {/* Quick Stats Grid Skeleton */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700 w-12 h-12"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-7xl mx-auto px-8 pb-8 space-y-8">
                {/* Profile Card Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-8">
                    <div className="flex-shrink-0 flex flex-col items-center gap-4">
                        <div className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-24 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
