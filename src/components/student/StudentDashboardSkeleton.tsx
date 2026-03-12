import React from 'react';

const StudentDashboardSkeleton = () => {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
            {/* Sidebar Skeleton */}
            <div className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen p-6">
                <div className="flex flex-col items-center gap-4 mb-10">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                    ))}
                </div>
            </div>

            <main className="flex-1 p-4 md:p-8">
                {/* Welcome Section Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="max-w-3xl space-y-4">
                            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="h-6 w-96 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 w-full md:w-auto">
                            <div className="grid grid-cols-2 gap-8 px-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="text-center space-y-2">
                                        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-600 rounded mx-auto"></div>
                                        <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded mx-auto"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden h-72">
                                    <div className="h-40 bg-gray-100 dark:bg-gray-700 w-full"></div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex justify-between">
                                            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="h-4 w-12 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                        </div>
                                        <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="space-y-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="h-20 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700"></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboardSkeleton;
