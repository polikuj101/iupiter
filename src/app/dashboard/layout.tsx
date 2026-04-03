import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { createAdminClient } from "@/lib/supabase/admin";
import DashboardNav from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from("client_settings")
    .select("agent_name")
    .eq("user_id", session.user.sub)
    .single();

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNav
        agentName={settings?.agent_name ?? "My Agent"}
        userEmail={session.user.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
