// types/index.ts

export interface User {
  id: string;
  name: string;
  role: 'student' | 'professor';
  email: string;
  profileImage?: string;
}

export interface Student extends User {
  studentNumber: string;
  program: string;
  level: string;
  university: string;
  goal: string;
  coursesParticipated: number;
  certificationsObtained: number;
  attendanceRate: number;
  grades?: Grade[];
}

export interface Professor extends User {
  professorNumber: string;
  city: string;
  university: string;
  grade: string;
  certification: string;
  totalStudents: number;
  participationRate: number;
  publications: number;
  performanceDistribution?: PerformanceData[];
}

export interface Course {
  id: string;
  title: string;
  class: string;
  participants: number;
  likes: number;
  downloads: number;
}

export interface Composition {
  id: string;
  title: string;
  class: string;
  participants: number;
  likes: number;
  downloads: number;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  rating: number;
  students: number;
  image: string;
}

export interface Grade {
  subject: string;
  grade: number;
  color: string;
}

export interface PerformanceData {
  range: string;
  value: number;
  color: string;
}

export interface Deadline {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  type: 'exam' | 'assignment' | 'quiz';
  status: 'upcoming' | 'overdue' | 'completed';
}
