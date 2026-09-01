export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatResult = {
  content: string;
  latencyMs: number;
  model: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  demo?: boolean;
};

const DEMO_REPLIES: Record<string, string> = {
  "gpt-5.6-sol": "你好，我是 GPT-5.6 Sol。云上逐梦已通过服务器端网关接入 OpenAI，网页不会接触 OpenAI 上游密钥。",
};

function demoReply(model: string, prompt: string): string {
  const base = DEMO_REPLIES[model] ?? `你好，我是 ${model}。这是云上逐梦演示模式——填入 API Key 后即可发起真实请求。`;
  if (prompt.includes("路由") || prompt.includes("接入")) {
    return `${base}\n\n你问的是接入问题：把 Base URL 设为 https://api.yszmai.com/v1，Header 带上 Authorization: Bearer <团队Key>，model 使用 gpt-5.6-sol 即可。`;
  }
  return `${base}\n\n（演示回复）你刚才说：「${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}」`;
}

export async function chatCompletion(params: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  demoMode?: boolean;
}): Promise<ChatResult> {
  const start = performance.now();

  if (params.demoMode || !params.apiKey.trim()) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    const lastUser = [...params.messages].reverse().find((m) => m.role === "user");
    return {
      content: demoReply(params.model, lastUser?.content ?? ""),
      latencyMs: Math.round(performance.now() - start),
      model: params.model,
      demo: true,
    };
  }

  const url = `${params.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      stream: false,
    }),
  });

  const latencyMs = Math.round(performance.now() - start);

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = await res.json();
      detail = err?.error?.message ?? JSON.stringify(err);
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status}: ${detail}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "(空响应)";

  return {
    content,
    latencyMs,
    model: data?.model ?? params.model,
    usage: data?.usage,
  };
}

export function buildCurlSnippet(baseUrl: string, apiKey: string, model: string, prompt: string): string {
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  return `curl ${url} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -d '{
    "model": "${model}",
    "messages": [{"role": "user", "content": "${prompt.replace(/"/g, '\\"') || "Hello"}"}]
  }'`;
}
