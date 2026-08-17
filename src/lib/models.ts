export type ModelOption = {
  id: string;
  name: string;
  provider: string;
  desc: string;
  color: string;
};

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", desc: "最强通用大模型", color: "#10a37f" },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5", provider: "Anthropic", desc: "超长上下文", color: "#d97757" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0", provider: "Google", desc: "多模态原生", color: "#4285f4" },
  { id: "ernie-4.0", name: "文心一言", provider: "百度", desc: "中文语义理解", color: "#2932e1" },
  { id: "qwen-max", name: "通义千问", provider: "阿里", desc: "企业级引擎", color: "#ff6a00" },
  { id: "doubao-pro", name: "豆包", provider: "字节", desc: "创作与对话", color: "#3c8cff" },
  { id: "moonshot-v1-128k", name: "Kimi", provider: "月之暗面", desc: "长文本处理", color: "#6366f1" },
  { id: "glm-4", name: "ChatGLM", provider: "智谱AI", desc: "国产先锋", color: "#1a5cff" },
  { id: "mistral-large", name: "Mistral", provider: "Mistral AI", desc: "高效推理", color: "#ff6b35" },
  { id: "llama-3-70b", name: "Llama 3", provider: "Meta", desc: "开源生态", color: "#0668e1" },
  { id: "deepseek-chat", name: "DeepSeek", provider: "DeepSeek", desc: "代码专家", color: "#4f46e5" },
  { id: "grok-beta", name: "Grok", provider: "xAI", desc: "实时信息", color: "#ef4444" },
];

export const DEFAULT_BASE_URL = "https://api.yszmai.com/v1";

export const STORAGE_KEYS = {
  apiKey: "yszmai_api_key",
  baseUrl: "yszmai_base_url",
  model: "yszmai_model",
} as const;
