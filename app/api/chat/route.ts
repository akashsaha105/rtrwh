import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `
You are a rooftop rainwater harvesting assistant. Be concise and practical in SI units.
Ask for: city, roof area (m²), annual rainfall (mm), roof material, intended use.
Potential (L/yr) ≈ Area (m²) × Rainfall (mm/yr) × Runoff coefficient (0.6–0.9).
`;

type Role = 'system' | 'user' | 'assistant';
interface ChatReqBody {
  messages: Array<{ role: Role; content: string }>;
}

function toGeminiContents(messages: ChatReqBody['messages']) {
  const contents: any[] = [];
  contents.push({ role: 'user', parts: [{ text: SYSTEM_PROMPT }] });
  for (const m of messages) {
    contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] });
  }
  return contents;
}

const MODELS = [
  'gemini-2.5-flash-latest',
  'gemini-2.5-flash-8b-latest',
  'gemini-2.5-pro-latest',
];

async function callGemini(model: string, contents: any, apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
  const payload = {
    contents,
    generationConfig: { temperature: 0.4, topP: 0.95 },
  };
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = "AIzaSyB1MuwvayM1gBvr6m0MqmIEP_uGjqHs9zk";
    if (!apiKey) return NextResponse.json({ error: 'Missing GOOGLE_GEMINI_API_KEY' }, { status: 500 });

    const body = (await req.json()) as ChatReqBody;
    if (!Array.isArray(body?.messages)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    // Trim conversation to last N turns to keep payload small
    const recent = body.messages.slice(-8);
    const contents = toGeminiContents(recent);

    // Try models with retries and exponential backoff on 503
    for (const model of MODELS) {
      let attempt = 0;
      const delays = [400, 900, 1800]; // ms
      while (true) {
        const res = await callGemini(model, contents, apiKey);
        if (res.ok) {
          const data = await res.json();
          const txt =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p?.text)
              .filter(Boolean)
              .join('\n') ?? 'Sorry, I could not generate a response.';
          return NextResponse.json({ content: txt });
        }
        if (res.status === 503 && attempt < delays.length) {
          await new Promise(r => setTimeout(r, delays[attempt]));
          attempt++;
          continue; // retry same model
        }
        // Non-503 or retries exhausted: break to try next model
        break;
      }
    }

    return NextResponse.json({ error: 'Service temporarily unavailable. Please try again.' }, { status: 503 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}