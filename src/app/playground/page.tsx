"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buildCurlSnippet, chatCompletion, type ChatMessage } from "@/lib/api";
import { DEFAULT_BASE_URL, MODEL_OPTIONS, STORAGE_KEYS } from "@/lib/models";

type UiMessage = ChatMessage & { meta?: { latencyMs?: number; demo?: boolean; model?: string } };

export default function PlaygroundPage() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(MODEL_OPTIONS[0].id);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      role: "assistant",
      content: "欢迎使用云上逐梦团队接入台。当前固定使用 GPT-5.6 Sol；未填团队 Key 时为演示模式，填入后发起真实请求。",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedBase = localStorage.getItem(STORAGE_KEYS.baseUrl) ?? DEFAULT_BASE_URL;
    const savedKey = sessionStorage.getItem(STORAGE_KEYS.apiKey) ?? "";
    const params = new URLSearchParams(window.location.search);
    const queryModel = params.get("model");
    const savedModel = localStorage.getItem(STORAGE_KEYS.model) ?? MODEL_OPTIONS[0].id;
    const validQuery = MODEL_OPTIONS.some((m) => m.id === queryModel);
    const validSaved = MODEL_OPTIONS.some((m) => m.id === savedModel);

    const frame = window.requestAnimationFrame(() => {
      setBaseUrl(savedBase);
      setApiKey(savedKey);
      setModel(validQuery && queryModel ? queryModel : validSaved ? savedModel : MODEL_OPTIONS[0].id);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.baseUrl, baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.apiKey, apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.model, model);
  }, [model]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const selectedModel = MODEL_OPTIONS.find((m) => m.id === model) ?? MODEL_OPTIONS[0];
  const demoMode = !apiKey.trim();
  const curlSnippet = buildCurlSnippet(baseUrl, apiKey, model, input || "你好，介绍一下云上逐梦");

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError("");
    setInput("");
    const userMsg: UiMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const result = await chatCompletion({
        baseUrl,
        apiKey,
        model,
        messages: nextMessages
          .slice(1)
          .map(({ role, content }) => ({ role, content })),
        demoMode,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.content,
          meta: { latencyMs: result.latencyMs, demo: result.demo, model: result.model },
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  const copyCurl = async () => {
    await navigator.clipboard.writeText(curlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.08) 0%, transparent 60%)",
      }} />

      <header className="relative z-10 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-cyan-400 hover:text-cyan-300 transition-colors">
            <div className="w-8 h-8 rounded-lg border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center text-xs">云</div>
            <span className="font-bold text-sm tracking-[0.15em] uppercase">云上逐梦</span>
          </Link>
          <div className="text-xs text-zinc-500 tracking-wider uppercase hidden sm:block">GPT-5.6 Sol · Playground</div>
          <Link href="/#pricing" className="px-4 py-2 rounded-lg text-xs border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all">
            获取 API Key →
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-2 font-mono">model gateway</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">接入 GPT-5.6 Sol</h1>
          <p className="text-zinc-500 text-sm max-w-2xl leading-relaxed">
            OpenAI 兼容接口，供你的团队统一调用 Sol。团队 Key 只在当前浏览器会话保存，请求时仅发送至 api.yszmai.com。
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Config */}
          <aside className="space-y-4">
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <h2 className="text-sm font-semibold text-zinc-200 mb-4">连接配置</h2>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Base URL</label>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full mb-4 px-3 py-2 rounded-lg bg-black/50 border border-white/[0.08] text-xs text-zinc-300 focus:border-cyan-500/40 focus:outline-none"
                placeholder="https://api.yszmai.com/v1"
              />
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">API Key</label>
              <div className="relative mb-4">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 pr-16 rounded-lg bg-black/50 border border-white/[0.08] text-xs text-zinc-300 focus:border-cyan-500/40 focus:outline-none"
                  placeholder="sk-yszmai-..."
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-cyan-400"
                >
                  {showKey ? "隐藏" : "显示"}
                </button>
              </div>
              {demoMode && (
                <p className="text-[10px] text-amber-400/80 mb-4 leading-relaxed">未填 Key，当前为演示模式（模拟回复）。填入 Key 后自动切换真实请求。</p>
              )}
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">模型</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/[0.08] text-xs text-zinc-300 focus:border-cyan-500/40 focus:outline-none"
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} · {m.provider}</option>
                ))}
              </select>
              <div className="mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedModel.color }} />
                <span className="text-xs text-zinc-500">{selectedModel.desc}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-200">cURL 示例</h2>
                <button type="button" onClick={copyCurl} className="text-[10px] text-cyan-400 hover:text-cyan-300">
                  {copied ? "已复制" : "复制"}
                </button>
              </div>
              <pre className="text-[10px] text-zinc-500 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all font-mono">
                {curlSnippet}
              </pre>
            </div>

            <div className="p-5 rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.03]">
              <h2 className="text-sm font-semibold text-cyan-400 mb-3">三步接入</h2>
              <ol className="space-y-2 text-xs text-zinc-500">
                <li><span className="text-cyan-400">1.</span> 向管理员获取团队 API Key</li>
                <li><span className="text-cyan-400">2.</span> Base URL 填 <code className="text-zinc-400">api.yszmai.com/v1</code></li>
                <li><span className="text-cyan-400">3.</span> model 使用 <code className="text-zinc-400">gpt-5.6-sol</code></li>
              </ol>
            </div>
          </aside>

          {/* Chat */}
          <section className="flex flex-col min-h-[560px] rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono">chat.completions</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${demoMode ? "border-amber-500/30 text-amber-400" : "border-emerald-500/30 text-emerald-400"}`}>
                {demoMode ? "演示模式" : "真实请求"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[400px] max-h-[520px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cyan-500/15 border border-cyan-500/20 text-zinc-100"
                      : "bg-white/[0.03] border border-white/[0.06] text-zinc-300"
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.meta && (
                      <div className="mt-2 text-[10px] text-zinc-600 font-mono">
                        {msg.meta.demo ? "demo" : msg.meta.model} · {msg.meta.latencyMs}ms
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm text-zinc-500">
                    <span className="animate-pulse">路由中…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {error && (
              <div className="mx-5 mb-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="p-4 border-t border-white/[0.06] flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="输入消息测试模型，例如：如何接入云上逐梦？"
                className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-sm text-zinc-200 focus:border-cyan-500/40 focus:outline-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-6 py-3 rounded-xl text-sm font-medium bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                发送
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
