import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { instruction, columns } = await req.json();
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "MISTRAL_API_KEY is not set" },
        { status: 500 }
      );
    }

    const prompt = `
      You are an assistant that converts natural language instructions into chart parameters.

      Instruction: "${instruction}"
      Available columns: ${columns.join(", ")}

      Respond ONLY with valid JSON in this exact format:
      {
        "chartType": "bar|line|pie|donut",
        "xColumn": "column_name",
        "yColumn": "column_name"
      }

      - Select the most appropriate chartType based on the instruction.
      - Use only the provided columns for xColumn and yColumn.
      - If the instruction is unclear, choose sensible defaults.
      - Do NOT include any explanation or extra text.
    `;

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-small",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: "Mistral API error", details: text },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON response", raw: content },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Mistral API Error:", error);
    return NextResponse.json(
      { error: "Failed to interpret instruction" },
      { status: 500 }
    );
  }
}
