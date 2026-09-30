import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GPT-5.6 Sol - 云上逐梦接入台",
  description: "在线测试 GPT-5.6 Sol。OpenAI 兼容接口，团队统一调用。",
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
