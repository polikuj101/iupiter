import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { createAdminClient } from "@/lib/supabase/admin";
import { streamChat } from "@/lib/ai/providers";
import type { AgentConfig, Message } from "@/lib/types";

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { messages } = body as { messages: Message[] };
  if (!messages?.length) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const userId = session.user.sub;

  const [settingsResult, listingsResult] = await Promise.all([
    supabase
      .from("client_settings")
      .select("agent_name, tone, business_description")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("listings")
      .select("address, price, details")
      .eq("user_id", userId),
  ]);

  const settings = settingsResult.data;
  const listings = listingsResult.data ?? [];

  const listingsText =
    listings.length > 0
      ? listings
          .map(
            (l) =>
              `${l.address}${l.price ? ` — ${l.price}` : ""}${l.details ? `\n${l.details}` : ""}`
          )
          .join("\n\n")
      : "No listings currently available.";

  const agentConfig: AgentConfig = {
    businessName: settings?.business_description?.split(".")[0] ?? "Real Estate",
    businessDescription:
      settings?.business_description ?? "A professional real estate agent.",
    agentName: settings?.agent_name ?? "AI Assistant",
    tone: (settings?.tone as AgentConfig["tone"]) ?? "friendly",
    greeting: `Hi! I'm ${settings?.agent_name ?? "your AI assistant"}. How can I help you today?`,
    knowledgeTexts:
      listings.length > 0
        ? [{ filename: "listings.txt", content: listingsText }]
        : [],
    contactInfo: "",
  };

  try {
    const stream = await streamChat(messages, agentConfig);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[test-chat]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI provider error" },
      { status: 500 }
    );
  }
}
