import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("client_settings")
    .select("agent_name, tone, business_description")
    .eq("user_id", session.user.sub)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data ?? { agent_name: "", tone: "friendly", business_description: "" }
  );
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { agent_name, tone, business_description } = body;

  if (!agent_name?.trim()) {
    return NextResponse.json({ error: "Agent name is required" }, { status: 400 });
  }

  const validTones = ["formal", "friendly", "adaptive"];
  if (!validTones.includes(tone)) {
    return NextResponse.json({ error: "Invalid tone" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("client_settings").upsert(
    {
      user_id: session.user.sub,
      agent_name: agent_name.trim(),
      tone,
      business_description: business_description?.trim() ?? "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
