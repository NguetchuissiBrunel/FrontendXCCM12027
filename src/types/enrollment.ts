// types/enrollment.ts
export interface Enrollment {
  courseId: number;
  userId: string;
  enrolledAt: string; // ISO string pour la sérialisation
  progress: number;
  lastAccessed?: string;
  completed?: boolean;
}

export interface EnrichedCourse {
  id: number;
  title: string;
  category: string;
  image: string;
  author: {
    name: string;
    image: string;
    designation?: string;
  };
  enrollment?: Enrollment;
}