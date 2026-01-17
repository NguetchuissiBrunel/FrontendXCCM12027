import { useState, useEffect } from 'react';
import { EnseignantService } from '@/lib/services/EnseignantService';
import type { TeacherCourseStatsResponse } from '@/lib/models/TeacherCourseStatsResponse';

export function useRealtimeCourseStats(courseId: number, interval = 30000) {
  const [stats, setStats] = useState<TeacherCourseStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await EnseignantService.getCourseStatistics(courseId);
      
      if (response.data) {
        setStats(response.data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError('Aucune donnée disponible');
      }
    } catch (err) {
      setError('Erreur de chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    const refreshInterval = setInterval(loadStats, interval);
    
    return () => clearInterval(refreshInterval);
  }, [courseId, interval]);

  return {
    stats,
    loading,
    error,
    lastUpdate,
    refresh: loadStats
  };
}