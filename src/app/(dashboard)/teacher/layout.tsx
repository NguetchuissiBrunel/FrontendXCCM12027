import DashboardSidebarLayout from '@/components/dashboard/DashboardSidebarLayout';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardSidebarLayout role="professor">
            {children}
        </DashboardSidebarLayout>
    );
}
