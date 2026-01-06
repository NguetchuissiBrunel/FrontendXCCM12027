import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { CancelablePromise } from '../core/CancelablePromise';
import type { User } from '../models/User';
import type { CourseResponse } from '../models/CourseResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';

const MOCK_STORAGE_KEYS = {
    STUDENTS: 'mock_students',
    TEACHERS: 'mock_teachers',
    COURSES: 'mock_courses'
};

const INITIAL_MOCK_DATA = {
    students: [
        { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@etu.univ.fr', role: 'student', university: 'Université Paris Cité', city: 'Paris', specialization: 'Informatique' },
        { id: '2', firstName: 'Marie', lastName: 'Curie', email: 'marie.curie@etu.univ.fr', role: 'student', university: 'Sorbonne Université', city: 'Paris', specialization: 'Physique' },
    ],
    teachers: [
        { id: '101', firstName: 'Prof.', lastName: 'Einstein', email: 'einstein@univ.fr', role: 'teacher', specialization: 'Physique Quantique' },
        { id: '102', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@univ.fr', role: 'teacher', specialization: 'Algorithmique' },
    ],
    courses: [
        { id: 1, title: 'Introduction à React', description: 'Apprenez les bases de React.js', teacherName: 'Ada Lovelace', level: 'Débutant' },
        { id: 2, title: 'Node.js Avancé', description: 'Maîtrisez le backend avec Node', teacherName: 'Prof. Einstein', level: 'Avancé' },
    ]
};

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    }
    return JSON.parse(stored);
};

const saveToStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
    }
};

export class AdminService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getAllStudents(): CancelablePromise<{ data: User[] }> {
        return new CancelablePromise(async (resolve) => {
            try {
                const result = await __request(OpenAPI, {
                    method: 'GET',
                    url: '/api/v1/admin/students',
                });
                resolve(result as any);
            } catch (e) {
                console.warn('⚠️ AdminService: Mode Mock pour Étudiants');
                const students = getFromStorage(MOCK_STORAGE_KEYS.STUDENTS, INITIAL_MOCK_DATA.students);
                resolve({ data: students as User[] });
            }
        });
    }

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getAllTeachers(): CancelablePromise<{ data: User[] }> {
        return new CancelablePromise(async (resolve) => {
            try {
                const result = await __request(OpenAPI, {
                    method: 'GET',
                    url: '/api/v1/admin/teachers',
                });
                resolve(result as any);
            } catch (e) {
                console.warn('⚠️ AdminService: Mode Mock pour Enseignants');
                const teachers = getFromStorage(MOCK_STORAGE_KEYS.TEACHERS, INITIAL_MOCK_DATA.teachers);
                resolve({ data: teachers as User[] });
            }
        });
    }

    /**
     * @param userId
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteUser(userId: string): CancelablePromise<ApiResponseVoid> {
        return new CancelablePromise(async (resolve) => {
            try {
                const result = await __request(OpenAPI, {
                    method: 'DELETE',
                    url: '/api/v1/admin/users/{userId}',
                    path: { 'userId': userId },
                });
                resolve(result as any);
            } catch (e) {
                console.warn('⚠️ AdminService: Suppression Mock pour', userId);
                const students = getFromStorage(MOCK_STORAGE_KEYS.STUDENTS, INITIAL_MOCK_DATA.students);
                const updatedStudents = students.filter((s: any) => s.id !== userId);
                saveToStorage(MOCK_STORAGE_KEYS.STUDENTS, updatedStudents);

                const teachers = getFromStorage(MOCK_STORAGE_KEYS.TEACHERS, INITIAL_MOCK_DATA.teachers);
                const updatedTeachers = teachers.filter((t: any) => t.id !== userId);
                saveToStorage(MOCK_STORAGE_KEYS.TEACHERS, updatedTeachers);

                resolve({ success: true } as any);
            }
        });
    }

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getAllCourses(): CancelablePromise<{ data: CourseResponse[] }> {
        return new CancelablePromise(async (resolve) => {
            try {
                const result = await __request(OpenAPI, {
                    method: 'GET',
                    url: '/courses',
                });
                resolve(result as any);
            } catch (e) {
                console.warn('⚠️ AdminService: Mode Mock pour Cours');
                const courses = getFromStorage(MOCK_STORAGE_KEYS.COURSES, INITIAL_MOCK_DATA.courses);
                resolve({ data: courses });
            }
        });
    }

    /**
     * @param courseId
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteCourse(courseId: number): CancelablePromise<ApiResponseVoid> {
        return new CancelablePromise(async (resolve) => {
            try {
                const result = await __request(OpenAPI, {
                    method: 'DELETE',
                    url: '/courses/{courseId}',
                    path: { 'courseId': courseId },
                });
                resolve(result as any);
            } catch (e) {
                console.warn('⚠️ AdminService: Suppression Mock pour cours', courseId);
                const courses = getFromStorage(MOCK_STORAGE_KEYS.COURSES, INITIAL_MOCK_DATA.courses);
                const updatedCourses = courses.filter((c: any) => c.id !== courseId);
                saveToStorage(MOCK_STORAGE_KEYS.COURSES, updatedCourses);
                resolve({ success: true } as any);
            }
        });
    }

    /**
     * Helper to add mock data from UI
     */
    public static addMockUser(user: User) {
        if (user.role === 'student' || String(user.role).toLowerCase() === 'student') {
            const students = getFromStorage<any[]>(MOCK_STORAGE_KEYS.STUDENTS, INITIAL_MOCK_DATA.students);
            students.push({
                id: user.id || 'mock-' + Date.now(),
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                role: 'student',
                university: user.university || '',
                city: user.city || '',
                specialization: user.specialization || ''
            });
            saveToStorage(MOCK_STORAGE_KEYS.STUDENTS, students);
        } else if (user.role === 'teacher' || String(user.role).toLowerCase() === 'teacher') {
            const teachers = getFromStorage<any[]>(MOCK_STORAGE_KEYS.TEACHERS, INITIAL_MOCK_DATA.teachers);
            teachers.push({
                id: user.id || 'mock-' + Date.now(),
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                role: 'teacher',
                specialization: user.specialization || ''
            });
            saveToStorage(MOCK_STORAGE_KEYS.TEACHERS, teachers);
        }
    }
}
