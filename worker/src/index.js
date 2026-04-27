const ALLOWED_ORIGINS = new Set([
  "https://wordpeak.app",
  "https://chessg0d.github.io",
  "http://localhost:8735",
  "http://localhost:8000",
]);

const MODEL = "gemini-3.1-pro-preview";

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://wordpeak.app";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function jsonErr(status, message, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

const SYSTEM_PROMPT =
  "You're a sharp historian explaining why an English word's Google Books Ngram chart looks the way it does. Make it READ LIKE AN ESSAY, not a list of facts — bullets are a structure, but each one should flow as a small connected paragraph and the bullets together should tell a continuous story. Use natural transitions between bullets (think 'meanwhile,' 'a generation later,' 'by the time the dust settled,' 'the same impulse later resurfaced as') so the reader feels the arc, not a checklist. Cover the full arc — rise, peak, decline, any rebound — through the real eras, movements, and events that pulled the word in and out of circulation. Bring depth across religious, political, scientific, literary, technological, and cultural angles where they apply, with real names, dates, and surprising specifics (e.g., the Methodist revival, abolitionist pamphlets, Dickens displacing theological vocabulary, Mercy Corps and NGO branding, Civil-rights rhetoric reaching for 'justice' over 'mercy'). Use this exact structure: (1) two or three opening sentences naming the deepest driver of the trajectory's shape and setting up the arc; (2) 5-9 markdown bullet points (`- ` only), each opening with a **bold** key term — a movement, war, event, or shift — followed by 3-5 sentences of concrete detail that connects to what came before and after; (3) one short closing paragraph (3-4 sentences) on what the rise and fall reveals about people: moral anxieties, what we name, what we stop naming, what we reach for in crisis. Hard bans: no tables of any kind (no `|---|` syntax, no `<br>` tags), no `##`/`###` headings, no top-level numbered sections like '1. The raw trajectory,' no 'Bottom line:' / 'Take-away' / 'Quick reference' / 'TL;DR' sections, no horizontal rules. Never make books, newspapers, papers, the press, editors, novelists, journalists, or 'the literature of the time' the subject — they're measurement, never characters. Stick to real, verifiable history; don't invent people. Skip throat-clearing: never 'tells a fascinating tale,' 'the journey of,' 'captures the essence,' 'at the dawn of,' 'reflects a century defined by.' *Italics* on the target word, **bold** on key movements/events.";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return jsonErr(405, "POST only", origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonErr(400, "invalid json", origin);
    }

    const messages = Array.isArray(body.messages) ? body.messages : null;
    if (!messages || messages.length === 0) {
      return jsonErr(400, "messages[] required", origin);
    }
    if (messages.length > 30) {
      return jsonErr(400, "too many messages", origin);
    }
    for (const m of messages) {
      if (typeof m?.content !== "string" || m.content.length > 4000) {
        return jsonErr(400, "bad message", origin);
      }
      if (m.role !== "user" && m.role !== "assistant") {
        return jsonErr(400, "bad role", origin);
      }
    }

    const geminiBody = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
        thinkingConfig: {
          thinkingLevel: "high",
          includeThoughts: false,
        },
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return jsonErr(upstream.status, `gemini: ${errText.slice(0, 500)}`, origin);
    }

    let buffer = "";
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const transform = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;
          try {
            const json = JSON.parse(payload);
            const parts = json?.candidates?.[0]?.content?.parts;
            if (Array.isArray(parts)) {
              for (const part of parts) {
                if (part?.thought) continue;
                const text = part?.text;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              }
            }
            const finish = json?.candidates?.[0]?.finishReason;
            if (finish && finish !== "STOP" && finish !== "MAX_TOKENS") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `stopped: ${finish}` })}\n\n`));
            }
          } catch {
            // skip malformed chunks
          }
        }
      },
      flush(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      },
    });

    return new Response(upstream.body.pipeThrough(transform), {
      headers: {
        ...corsHeaders(origin),
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  },
};
