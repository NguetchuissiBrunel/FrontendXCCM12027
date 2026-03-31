// hooks/usePendingCount.ts
'use client';

import { useState, useEffect } from 'react';
import { EnrollmentService } from '@/utils/enrollmentService';
import { useAuth } from '@/contexts/AuthContext';

export function usePendingCount() {
  const { user, isAuthenticated } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = async () => {
    if (!isAuthenticated || user?.role !== 'teacher') return;
    
    setLoading(true);
    try {
      const data = await EnrollmentService.getPendingEnrollments();
      setPendingCount(data.length);
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre d'inscriptions en attente:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    
    // Rafraîchir toutes les 60 secondes pour garder le badge à jour
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  return { pendingCount, loading, refresh: fetchCount };
}
