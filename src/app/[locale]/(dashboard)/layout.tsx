import AIGenerationDashboardShell from '@/components/editor/AIGenerationDashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AIGenerationDashboardShell>
      {children}
    </AIGenerationDashboardShell>
  );
}
