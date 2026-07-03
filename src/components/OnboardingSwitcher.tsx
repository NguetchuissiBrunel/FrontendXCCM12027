"use client";

import React from 'react';
import Onboarding from './Onboarding';
import StudentOnboarding from './StudentOnboarding';
import { useAuth } from '@/contexts/AuthContext';

const OnboardingSwitcher = () => {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return null;

    // Students get the student tour, everyone else gets the generic onboarding
    if (user.role === 'student') {
        return <StudentOnboarding />;
    }
    return <Onboarding />;
};

export default OnboardingSwitcher;
