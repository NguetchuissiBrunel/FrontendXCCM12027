// src/types/professor.ts

import { Composition } from '@/components/professor/CompositionsCard';
import { CourseStat } from '@/components/professor/ProfileCard';

export interface DashboardCourse {
  id?: number | string;
  title?: string;
  category?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

export interface DashboardCourseClass {
  id: number;
  name: string;
  theme?: string;
  description?: string;
  coverImage?: string;
  status?: 'OPEN' | 'CLOSED' | 'ARCHIVED';
  maxStudents?: number;
  studentCount?: number;
  courses?: DashboardCourse[];
}

export interface DashboardTeacher {
  id: string;
  firstName: string;
  lastName: string;
  subjects?: string[];
  university?: string;
}

export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
  city?: string;
  university?: string;
  grade?: string;
  certification?: string;
  subjects?: string[];
  teachingGrades?: string[];
  teachingGoal?: string;
}

export interface DashboardExercisesStats {
  totalExercises: number;
  pendingSubmissions: number;
  averageScore: number;
}

export { type Composition, type CourseStat };
