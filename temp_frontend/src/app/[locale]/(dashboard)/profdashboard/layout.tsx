import DashboardSidebarLayout from '@/components/dashboard/DashboardSidebarLayout';

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardSidebarLayout role="professor">
            {children}
        </DashboardSidebarLayout>
    );
}
