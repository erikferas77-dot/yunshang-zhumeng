export type ModelOption = {
  id: string;
  name: string;
  provider: string;
  desc: string;
  color: string;
};

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "gpt-5.6-sol", name: "GPT-5.6 Sol", provider: "OpenAI", desc: "复杂专业工作与代码任务", color: "#10a37f" },
];

export const DEFAULT_BASE_URL = "https://api.yszmai.com/v1";

export const STORAGE_KEYS = {
  apiKey: "yszmai_api_key",
  baseUrl: "yszmai_base_url",
  model: "yszmai_model",
} as const;
