import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 4.5MB limit
    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 4.5MB." },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (filename.endsWith(".txt") || filename.endsWith(".csv")) {
      text = buffer.toString("utf-8");
    } else if (filename.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (
      filename.endsWith(".xlsx") ||
      filename.endsWith(".xls") ||
      filename.endsWith(".csv")
    ) {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheets = workbook.SheetNames.map((name) => {
        const sheet = workbook.Sheets[name];
        return `## ${name}\n${XLSX.utils.sheet_to_csv(sheet)}`;
      });
      text = sheets.join("\n\n");
    } else if (filename.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      // Try as plain text
      text = buffer.toString("utf-8");
    }

    // Truncate if too long
    if (text.length > 50000) {
      text = text.slice(0, 50000) + "\n\n[... truncated]";
    }

    return NextResponse.json({
      filename: file.name,
      text,
      size: file.size,
    });
  } catch (err) {
    console.error("[upload] Error:", err);
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 500 }
    );
  }
}
