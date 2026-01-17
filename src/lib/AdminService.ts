import { AdministrationService } from './services/AdministrationService';
import type { EnrollmentUpdateRequest } from './models/EnrollmentUpdateRequest';

export const AdminService = {
  getAllCourses: () => AdministrationService.getAllCourses1(),
  deleteCourse: (id: number) => AdministrationService.deleteCourse1(id),
  deleteUser: (id: string) => AdministrationService.deleteUser(id),
  createAdmin: (data: any) => AdministrationService.createAdmin(data),
  registerStudent: (data: any) => AdministrationService.createStudent(data),
  registerTeacher: (data: any) => AdministrationService.createTeacher(data),
  getAdminStats: async () => {
    const res = await AdministrationService.getStatistics();
    return (res && (res as any).data) || res;
  },
  getAllEnrollments: () => AdministrationService.getAllEnrollments(),
  getAllUsers: () => AdministrationService.getAllUsers(),
  getAllStudents: () => AdministrationService.getAllStudents(),
  getAllTeachers: () => AdministrationService.getAllTeachers(),
  approveEnrollment: (id: number) => AdministrationService.updateEnrollment(id, { status: 'APPROVED' } as EnrollmentUpdateRequest),
  rejectEnrollment: (id: number) => AdministrationService.updateEnrollment(id, { status: 'REJECTED' } as EnrollmentUpdateRequest),
  // fallback to underlying service for any other calls
  __raw: AdministrationService,
};

export default AdminService;
