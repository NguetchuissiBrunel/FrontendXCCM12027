import DashboardSidebarLayout from '@/components/dashboard/DashboardSidebarLayout';
import StudentOnboarding from '@/components/StudentOnboarding';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
    	<>
		<DashboardSidebarLayout role="student">
		    {children}
		</DashboardSidebarLayout>
		<StudentOnboarding />
	</>
    );
}
