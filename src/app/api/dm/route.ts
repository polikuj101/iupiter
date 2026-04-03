import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth0 } from "@/lib/auth0";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDMSystemPrompt, buildDMUserPrompt } from "@/lib/ai/dm-prompt-builder";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { dmText } = body;
  if (!dmText?.trim()) {
    return NextResponse.json({ error: "DM text is required" }, { status: 400 });
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
      .select("id, address, price, details")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const settings = settingsResult.data ?? {
    agent_name: "AI Assistant",
    tone: "friendly" as const,
    business_description: "",
  };

  const listings = listingsResult.data ?? [];

  const systemPrompt = buildDMSystemPrompt(settings, listings);
  const userPrompt = buildDMUserPrompt(dmText.trim());

  let aiResponse: string;
  try {
    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    aiResponse =
      message.content[0].type === "text" ? message.content[0].text : "";
  } catch (err) {
    console.error("[dm] Anthropic error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    );
  }

  await supabase.from("conversations").insert({
    user_id: userId,
    dm_text: dmText.trim(),
    ai_response: aiResponse,
  });

  return NextResponse.json({ response: aiResponse });
}
