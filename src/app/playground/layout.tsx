import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "接入大模型 - 云上逐梦 Playground",
  description: "在线测试 GPT-4o、Claude、Gemini、DeepSeek 等 12+ 大模型。OpenAI 兼容接口，一套 Key 统一调用。",
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
