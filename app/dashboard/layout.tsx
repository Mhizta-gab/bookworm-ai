import { auth } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getUserPlan } from "@/lib/actions/subscription.actions";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const plan = userId ? await getUserPlan() : "free";

  return (
    <DashboardShell isSignedIn={!!userId} plan={plan}>
      {children}
    </DashboardShell>
  );
}

