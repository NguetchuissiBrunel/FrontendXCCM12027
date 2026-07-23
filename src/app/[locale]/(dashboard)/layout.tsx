import Navbar from '@/components/layout/Navbar';
import AIGenerationDashboardShell from '@/components/editor/AIGenerationDashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AIGenerationDashboardShell>
      {/* Navbar fixe (offset par le pt-16 de DashboardSidebarLayout).
          Retirée par erreur lors du passage au shell AI generation → restaurée. */}
      <Navbar />
      {children}
    </AIGenerationDashboardShell>
  );
}
