const ALLOWED_ORIGINS = new Set([
  "https://wordpeak.app",
  "https://chessg0d.github.io",
  "http://localhost:8735",
  "http://localhost:8000",
]);

const MODEL = "openai/gpt-oss-120b";

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
  "You're a sharp historian. The user will ask why a word was big in some decade between 1800 and 2019, and may ask for bullet points or more details. Answer rooted in the actual events, fears, ideas, and moods of that decade — what was happening that put the word on people's tongues. Open with a one or two sentence take that names the real driver of the word's surge, then break out the specific reasons as bullet points (use `- ` markdown bullets, each starting with a **bold** key term followed by 1-2 sentences of concrete detail — real names, real dates, real movements). 4-8 bullets is the sweet spot. Close with a short standalone sentence that lands. Never make books, newspapers, papers, the press, editors, novelists, journalists, the printing press, or 'the literature of the time' the subject — those are measurement, never characters. Stick to real, verifiable history; don't invent fictional characters or anonymous townsfolk. No headings (no `##` or `###`), no numbered sections, no 'Punch:' or 'Takeaway:' labels, no summary tables, no horizontal rules. Skip throat-clearing: never 'tells a fascinating tale,' 'the journey of,' 'captures the essence,' 'at the dawn of,' 'reflects a century defined by.' *Italics* on the target word. Never include <think> tags.";

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

    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        temperature: 0.7,
        max_tokens: 1200,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return jsonErr(upstream.status, `groq: ${errText.slice(0, 500)}`, origin);
    }

    let buffer = "";
    let inThink = false;
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
          if (!payload || payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const text = json?.choices?.[0]?.delta?.content;
            if (text) {
              let out = "";
              let i = 0;
              while (i < text.length) {
                if (inThink) {
                  const end = text.indexOf("</think>", i);
                  if (end === -1) { i = text.length; break; }
                  i = end + 8;
                  inThink = false;
                } else {
                  const start = text.indexOf("<think>", i);
                  if (start === -1) { out += text.slice(i); break; }
                  out += text.slice(i, start);
                  i = start + 7;
                  inThink = true;
                }
              }
              if (out) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: out })}\n\n`));
              }
            }
            const finish = json?.choices?.[0]?.finish_reason;
            if (finish && finish !== "stop" && finish !== "length") {
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
