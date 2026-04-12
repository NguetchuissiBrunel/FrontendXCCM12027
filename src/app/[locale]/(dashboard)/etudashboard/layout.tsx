import DashboardSidebarLayout from '@/components/dashboard/DashboardSidebarLayout';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardSidebarLayout role="student">
            {children}
        </DashboardSidebarLayout>
    );
}
