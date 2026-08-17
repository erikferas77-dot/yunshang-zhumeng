"use client";

import { useEffect, useRef, useState } from "react";

// ═══════════════════════════════════════════════════════════
//  Sci-Fi Starfield + Grid + Particle Background
// ═══════════════════════════════════════════════════════════
function SciFiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, frame = 0;
    const stars: { x: number; y: number; z: number; size: number }[] = [];
    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];
    const STAR_COUNT = 300;

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function initStars() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 2 + 0.5,
          size: Math.random() * 1.5 + 0.3,
        });
      }
    }

    function drawGrid() {
      const gridSize = 60;
      ctx!.strokeStyle = "rgba(0, 240, 255, 0.04)";
      ctx!.lineWidth = 0.5;

      for (let y = h * 0.6; y < h; y += gridSize) {
        const fade = (y - h * 0.6) / (h * 0.4);
        ctx!.strokeStyle = `rgba(0, 240, 255, ${0.04 * fade})`;
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }

      const centerX = w / 2;
      for (let x = -w; x < w * 2; x += gridSize * 2) {
        const distFromCenter = Math.abs(x - centerX);
        const fade = Math.max(0, 1 - distFromCenter / (w * 0.8));
        ctx!.strokeStyle = `rgba(0, 240, 255, ${0.03 * fade})`;
        ctx!.beginPath();
        ctx!.moveTo(x + (centerX - x) * 0.3, h * 0.6);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }
    }

    function drawStars() {
      for (const s of stars) {
        const twinkle = Math.sin(frame * 0.02 + s.x) * 0.3 + 0.7;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.size * s.z * twinkle, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200, 230, 255, ${0.6 * twinkle * s.z})`;
        ctx!.fill();
      }
    }

    function drawParticles() {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && Math.random() < 0.3) {
        particles.push({
          x: mx + (Math.random() - 0.5) * 40,
          y: my + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 - 0.3,
          life: 0,
          maxLife: 60 + Math.random() * 60,
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const progress = p.life / p.maxLife;
        const alpha = (1 - progress) * 0.6;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1 * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx!.fill();

        if (p.life >= p.maxLife) particles.splice(i, 1);
      }
    }

    function drawScanlines() {
      ctx!.fillStyle = "rgba(0, 0, 0, 0.02)";
      for (let y = 0; y < h; y += 4) {
        ctx!.fillRect(0, y, w, 1);
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const gradient = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.5, w * 0.8);
      gradient.addColorStop(0, "rgba(5, 10, 30, 0.3)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      drawStars();
      drawGrid();
      drawParticles();
      drawScanlines();

      frame++;
      rafRef.current = requestAnimationFrame(draw);
    }

    resize();
    initStars();
    rafRef.current = requestAnimationFrame(draw);

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };
    const onResize = () => { resize(); initStars(); };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ═══════════════════════════════════════════════════════════
//  Animated Counter
// ═══════════════════════════════════════════════════════════
function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const numericValue = parseFloat(end.replace(/[^0-9.]/g, ""));
  const prefix = end.match(/^[^0-9]*/)?.[0] || "";
  const decimalSuffix = end.match(/[^0-9.]*$/)?.[0] || "";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * numericValue));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericValue, duration]);

  return (
    <div ref={ref}>
      {prefix}{count.toLocaleString()}{decimalSuffix}{suffix}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Glitch Text
// ═══════════════════════════════════════════════════════════
function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 text-cyan-400 opacity-50 animate-pulse" style={{ clipPath: "inset(0 0 50% 0)", transform: "translateX(2px)" }}>{text}</span>
      <span className="absolute top-0 left-0 -z-10 text-fuchsia-400 opacity-30 animate-pulse" style={{ clipPath: "inset(50% 0 0 0)", transform: "translateX(-2px)", animationDelay: "0.1s" }}>{text}</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════════
const STATS = [
  { value: "12", suffix: "+", label: "大模型接入", color: "text-cyan-400" },
  { value: "99.99", suffix: "%", label: "服务可用性", color: "text-emerald-400" },
  { value: "35", suffix: "ms", label: "平均延迟", color: "text-amber-400" },
  { value: "50", suffix: "万+", label: "开发者信赖", color: "text-rose-400" },
  { value: "10", suffix: "亿+", label: "日处理 TOKEN", color: "text-violet-400" },
  { value: "8", suffix: "", label: "全球节点", color: "text-blue-400" },
];

const NAV_LINKS = [
  { label: "产品能力", target: "features" },
  { label: "接入平台", target: "models" },
  { label: "定价方案", target: "pricing" },
  { label: "文档中心", target: "docs" },
];

const CAPABILITIES = [
  {
    icon: "🔀",
    title: "智能路由",
    desc: "按延迟、成本、可用性自动选路。单家限流或区域抖动时无缝 failover，请求日志可追溯实际命中节点。",
  },
  {
    icon: "🔌",
    title: "统一接口",
    desc: "OpenAI 兼容协议，一套 SDK 调遍 GPT、Claude、Gemini、文心、通义。换模型只改 model 参数，业务代码零重写。",
  },
  {
    icon: "📈",
    title: "弹性伸缩",
    desc: "从探索版日千次到企业级亿级 Token，配额与队列自动扩缩。高峰不排队，低谷不浪费。",
  },
  {
    icon: "🛡️",
    title: "企业级安全",
    desc: "全程 TLS、密钥隔离、访问审计。企业版支持专有链路与数据物理隔离，满足合规审计要求。",
  },
  {
    icon: "🌐",
    title: "全球节点",
    desc: "北京、上海、新加坡、东京、硅谷、伦敦、法兰克福、悉尼 8 大节点就近调度，全球平均延迟 < 50ms。",
  },
];

const BRAND_PILLARS = [
  {
    kicker: "不造模型，让模型可用",
    title: "云上逐梦是入口，不是又一个大模型",
    body: "模型会换代，接口不该跟着碎。我们把全球顶尖模型收进同一扇门：一套鉴权、一种调用方式、一张账单。换模型只改一行参数，业务代码不用重写。",
  },
  {
    kicker: "智能路由，而不是死绑一家",
    title: "按延迟、成本和可用性自动选路",
    body: "高峰期某家限流、某个区域抖动，路由会切到下一跳可用节点。你看到的是稳定输出，不是供应商状态页。",
  },
  {
    kicker: "全球化，但不把复杂度甩给你",
    title: "8 个节点，一张世界地图",
    body: "北京、上海、新加坡、东京、硅谷、伦敦、法兰克福、悉尼。请求就近落地，密钥和配额仍在同一控制台。无国界访问，有企业级边界。",
  },
];

const MODELS = [
  { name: "GPT-4o", provider: "OpenAI", desc: "最强通用大模型，逻辑推理之王", color: "#10a37f" },
  { name: "Claude 3.5", provider: "Anthropic", desc: "超长上下文，深度理解专家", color: "#d97757" },
  { name: "Gemini 2.0", provider: "Google", desc: "多模态原生，搜索增强推理", color: "#4285f4" },
  { name: "文心一言", provider: "百度", desc: "中文语义理解，知识增强", color: "#2932e1" },
  { name: "通义千问", provider: "阿里", desc: "企业级AI引擎，全模态覆盖", color: "#ff6a00" },
  { name: "豆包", provider: "字节", desc: "年轻活力，创作与对话专家", color: "#3c8cff" },
  { name: "Kimi", provider: "月之暗面", desc: "长文本处理之王，200万字", color: "#6366f1" },
  { name: "ChatGLM", provider: "智谱AI", desc: "开源双子模型，国产先锋", color: "#1a5cff" },
  { name: "Mistral", provider: "Mistral AI", desc: "欧洲开源先锋，高效推理", color: "#ff6b35" },
  { name: "Llama 3", provider: "Meta", desc: "开源生态基石，自由定制", color: "#0668e1" },
  { name: "DeepSeek", provider: "DeepSeek", desc: "国产推理黑马，代码专家", color: "#4f46e5" },
  { name: "Grok", provider: "xAI", desc: "实时信息，叛逆思维", color: "#ef4444" },
];

const NODES = [
  { name: "北京", x: 78, y: 35, delay: 0 },
  { name: "上海", x: 80, y: 40, delay: 0.5 },
  { name: "新加坡", x: 75, y: 55, delay: 1 },
  { name: "东京", x: 85, y: 32, delay: 1.5 },
  { name: "硅谷", x: 18, y: 35, delay: 2 },
  { name: "伦敦", x: 48, y: 28, delay: 2.5 },
  { name: "法兰克福", x: 51, y: 32, delay: 3 },
  { name: "悉尼", x: 88, y: 72, delay: 3.5 },
];

const SCENES = [
  { title: "智能客服", desc: "7×24h 多语言自动应答，情感识别，智能转人工", icon: "🤖" },
  { title: "内容创作", desc: "文案/脚本/营销一键生成，爆款标题自动优化", icon: "✍️" },
  { title: "代码辅助", desc: "自动补全、Review、重构，Bug 智能诊断", icon: "💻" },
  { title: "数据分析", desc: "海量数据智能洞察，可视化报告自动生成", icon: "📊" },
  { title: "教育辅导", desc: "个性化学习路径规划，知识点精准拆解", icon: "🎓" },
  { title: "多语言翻译", desc: "实时精准跨语言沟通，专业术语自动适配", icon: "🌍" },
];

const LOGOS = ["OpenAI", "Anthropic", "Google", "百度", "阿里", "字节", "Moonshot", "智谱AI", "Mistral", "Meta", "Microsoft", "Amazon"];

const PRICING = [
  { name: "探索版", price: "¥0", period: "/月", desc: "个人开发者尝鲜，零门槛体验", features: ["1000 次 API 调用/天", "5 个主流模型", "社区支持", "基础文档"], highlight: false },
  { name: "专业版", price: "¥99", period: "/月", desc: "中小团队首选，无限可能", features: ["无限 API 调用", "全部 12+ 模型接入", "优先响应队列", "7×24 技术支持", "自定义路由策略", "高级分析面板"], highlight: true },
  { name: "企业版", price: "定制", period: "", desc: "大型企业专属，安全合规", features: ["私有化部署", "SLA 99.99%", "专属客户经理", "合规审计", "数据物理隔离", "定制模型微调"], highlight: false },
];

const FAQS = [
  {
    q: "云上逐梦是什么？和直接调 OpenAI / 通义有什么区别？",
    a: "云上逐梦是全球大模型的统一接入层，不是某一家模型的代理包装。直接对接各家，意味着多套 Key、多种鉴权、不同限流和账单。我们把 GPT-4o、Claude、Gemini、文心、通义、Kimi、DeepSeek 等收成一个 API：同一套 SDK、同一张控制台、一次接入即可按场景切模型。模型会迭代，你的业务接口不用跟着碎。",
  },
  {
    q: "如何接入我的应用？大概要多久？",
    a: "申请 API Key 后，用官方 SDK 三行代码即可发第一条请求。目前提供 Python、Node.js、Go、Java、Rust。已有 OpenAI 兼容调用的项目，通常只需改 Base URL 和 Key，原有 chat.completions 代码可继续用。文档中心有完整示例；探索版可当场试用，多数团队 5–15 分钟跑通联调。",
  },
  {
    q: "现在支持哪些大模型？以后会不会下架？",
    a: "已接入 GPT-4o、Claude 3.5、Gemini 2.0、文心一言、通义千问、豆包、Kimi、ChatGLM、Mistral、Llama 3、DeepSeek、Grok 等 12+ 模型，并持续接入 Groq、Cohere、Azure、AWS Bedrock。某家模型停服或改版时，路由可切到同类替代，避免单点绑定。新模型上线会在控制台和更新日志同步。",
  },
  {
    q: "智能路由具体怎么工作？我会被随机切到很贵的模型吗？",
    a: "路由按你设定的策略选路，不会擅自换成更贵的模型。可选：固定模型、同能力档位内选最低延迟、同能力档位内选最低成本、以及故障自动 failover。限流、超时、区域故障会切到下一跳可用节点，请求日志里能看到实际命中的供应商与节点，便于对账和排障。",
  },
  {
    q: "数据安全吗？会拿我的对话去训练吗？",
    a: "传输全程 TLS。默认不把业务数据用于训练自有模型，也不向第三方模型提供商授权「用你的数据微调」——各家模型方自己的保留策略以对方文档为准，我们在控制台标明。企业版支持专有链路、数据隔离、访问审计；需要物理隔离或私有化部署可走企业方案，并配合合规审计（含 SOC2 等路径）。",
  },
  {
    q: "全球都能访问吗？在国内和海外延迟差多少？",
    a: "可以。节点覆盖北京、上海、新加坡、东京、硅谷、伦敦、法兰克福、悉尼。请求按来源就近调度，全球平均延迟目标低于 50ms 量级（视模型和网络而定）。无国家封锁式限制：海外团队调国产模型、国内团队调国际模型，走的是同一套账号与配额，不需要自己搭跨境代理。",
  },
  {
    q: "探索版（免费）有哪些限制？够不够做 Demo？",
    a: "探索版每天 1000 次 API 调用、开放 5 个主流模型、社区支持与基础文档。适合个人学习、黑客松和产品原型。不包含优先队列、自定义路由和企业审计。额度用完可次日重置，或随时升到专业版，Key 和调用代码不用改。",
  },
  {
    q: "如何计费？会不会有隐藏费用？",
    a: "探索版 ¥0；专业版 ¥99/月，含无限次平台调用额度（底层模型按官方价透传或套餐内配额，以控制台标价为准，不含未开通的私有化实施）。没有最低消费、没有沉默账号年费。企业版按节点、隔离级别和 SLA 报价。账单按自然月出具，可导出调用明细对账。",
  },
  {
    q: "出故障了怎么办？有 SLA 吗？",
    a: "平台状态页展示各模型与节点可用性。专业版含 7×24 工单；企业版可签 SLA 99.99%，含专属客户经理和故障升级通道。单个供应商故障时，已开启 failover 的路由会自动切走。建议生产环境至少配置一个同能力备选模型，避免单模型依赖。",
  },
  {
    q: "品牌名叫「云上逐梦」，你们到底卖什么？",
    a: "卖的是「把全球顶尖 AI 变成基础设施」这件事：统一接口、智能路由、全球节点、可审计的安全边界。我们不跟模型厂抢训练，也不做又一个聊天窗口。开发者少写胶水代码，企业少养一堆供应商关系——这就是云上逐梦。",
  },
];

// ═══════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [typingText, setTypingText] = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const fullText = "云上逐梦";

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Typing effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypingText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden selection:bg-cyan-500/30 font-sans">
      <SciFiBackground />

      {/* CRT overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1]" style={{
        background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)",
        backgroundSize: "100% 4px",
        opacity: 0.3,
      }} />

      {/* ═══ NAV ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/70 backdrop-blur-xl border-b border-cyan-500/10" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button type="button" onClick={() => scrollToSection("hero")} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-[0.15em] uppercase text-cyan-400">云上逐梦</span>
          </button>
          <div className="hidden md:flex items-center gap-8 text-xs tracking-wider uppercase text-zinc-500">
            {NAV_LINKS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => scrollToSection(item.target)}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => scrollToSection("pricing")}
              className="text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer tracking-wider uppercase"
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("pricing")}
              className="px-5 py-2 rounded-lg text-xs font-medium tracking-wider uppercase border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/60 transition-all"
            >
              开始使用 →
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section id="hero" className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-10 scroll-mt-20">
        <div className="text-center max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full border border-cyan-500/20 bg-cyan-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-xs tracking-[0.2em] uppercase font-mono">已接入 12+ 全球顶尖大模型 · 服务 50 万+ 开发者</span>
          </div>

          {/* Typing Title */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-4 font-mono">
            <span className="text-white">{typingText}</span>
            <span className="text-cyan-400 animate-pulse">{typingText.length < fullText.length ? "▊" : ""}</span>
          </h1>

          {/* Glitch Subtitle */}
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-8">
            <GlitchText text="让想象触手可及" className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent" />
          </h2>

          <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-4 font-mono">
            一站式接入 GPT-4o、Claude 3.5、Gemini、文心、通义等全球顶尖 AI
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl mx-auto mb-4">
            模型会换代，接口不该跟着碎。云上逐梦把全球算力收进同一扇门——一套 Key，任意模型，就近节点响应。
          </p>
          <p className="text-xs text-zinc-600 tracking-[0.3em] uppercase mb-12 font-mono">
            智能路由 · 统一接口 · 弹性伸缩 · 企业级安全 · 全球节点
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              type="button"
              onClick={() => scrollToSection("pricing")}
              className="group relative px-8 py-4 rounded-xl text-sm font-bold tracking-wider uppercase overflow-hidden border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:text-black transition-colors duration-300"
            >
              <span className="relative z-10">免费开始使用 →</span>
              <span className="absolute inset-0 bg-cyan-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>
            <button
              type="button"
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 rounded-xl text-sm tracking-wider uppercase border border-white/10 text-zinc-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
            >
              ▷ 观看演示
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="relative min-w-0 overflow-hidden p-4 md:p-5 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:border-cyan-500/10 transition-all">
                <div className={`text-lg md:text-xl font-bold font-mono ${s.color} mb-1 leading-tight tabular-nums whitespace-nowrap`}>
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[10px] text-zinc-600 tracking-wider uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CAPABILITIES ═══ */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] scroll-mt-20">
        <div className="text-center mb-12">
          <div className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-3 font-mono">core capabilities</div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">五大核心能力，一次接入全拥有</h2>
          <p className="text-zinc-500 text-sm max-w-2xl mx-auto leading-relaxed">
            智能路由、统一接口、弹性伸缩、企业级安全、全球节点——不是营销口号，是云上逐梦平台默认开启的基础设施。
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:border-cyan-500/20 transition-all text-left">
              <div className="text-2xl mb-3">{cap.icon}</div>
              <h3 className="text-zinc-100 font-semibold mb-2">{cap.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BRAND ═══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04]">
        <div className="text-center mb-14">
          <div className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-3 font-mono">manifesto</div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">为什么是云上逐梦</h2>
          <p className="text-zinc-500 text-sm max-w-2xl mx-auto leading-relaxed">
            我们不训练下一个万亿参数模型，也不做又一个聊天窗口。云上逐梦只做一件事：让全球顶尖 AI 像水电一样，打开就能用。
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {BRAND_PILLARS.map((p) => (
            <div key={p.title} className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02] text-left">
              <div className="text-[10px] text-cyan-400 tracking-[0.2em] uppercase mb-3 font-mono">{p.kicker}</div>
              <h3 className="text-zinc-100 font-semibold mb-3 leading-snug">{p.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-zinc-600 text-xs tracking-wide">
          云上逐梦 · 把想象接到云上，把模型接到你的产品里
        </p>
      </section>

      {/* ═══ MODEL CARDS ═══ */}
      <section id="models" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] scroll-mt-20">
        <div className="text-center mb-12">
          <div className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-3 font-mono">unified gateway</div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">一个接口，调用全宇宙模型</h2>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto">
            无需对接多个平台，一次接入即可调用 GPT-4o、Claude、Gemini、DeepSeek 等 12+ 顶尖大模型，智能路由自动选择最优路径
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MODELS.map((m) => (
            <div
              key={m.name}
              className="group relative p-5 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:border-cyan-500/20 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${m.color}15`, color: m.color }}>
                  {m.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-zinc-200 font-semibold text-sm">{m.name}</h3>
                  <p className="text-[10px] text-zinc-600">{m.provider}</p>
                </div>
              </div>
              <p className="text-zinc-600 text-xs leading-relaxed">{m.desc}</p>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: `inset 0 0 20px ${m.color}10` }} />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-zinc-600 text-xs">
            还有更多模型正在接入中… <span className="text-cyan-400">Groq · Cohere · Azure · AWS Bedrock</span>
          </p>
        </div>
      </section>

      {/* ═══ GLOBAL NODES ═══ */}
      <section id="nodes" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] scroll-mt-20">
        <div className="text-center mb-12">
          <div className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-3 font-mono">global infrastructure</div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">全球 8 大节点，低延迟无国界</h2>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto">
            覆盖亚太、北美、欧洲、澳洲，任何地方都能享受毫秒级响应。无国家限制，真正的全球化 AI 基础设施。
          </p>
        </div>

        <div className="relative rounded-3xl border border-white/[0.04] bg-white/[0.01] overflow-hidden p-8 md:p-12">
          {/* World Map Background */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(0,240,255,0.15)" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="100" height="60" fill="url(#grid)" />
              <path d="M20 20 Q25 15 30 20 Q35 25 30 30 Q25 35 20 30 Q15 25 20 20" fill="none" stroke="rgba(0,240,255,0.2)" strokeWidth="0.3" />
              <path d="M45 15 Q55 12 60 18 Q65 25 55 30 Q48 28 45 22 Q43 18 45 15" fill="none" stroke="rgba(0,240,255,0.2)" strokeWidth="0.3" />
              <path d="M70 15 Q80 12 88 18 Q92 25 85 32 Q78 35 72 30 Q68 22 70 15" fill="none" stroke="rgba(0,240,255,0.2)" strokeWidth="0.3" />
              <path d="M75 40 Q85 38 90 45 Q88 55 80 58 Q72 55 75 40" fill="none" stroke="rgba(0,240,255,0.2)" strokeWidth="0.3" />
              <path d="M12 25 Q8 30 10 38 Q15 42 20 38" fill="none" stroke="rgba(0,240,255,0.2)" strokeWidth="0.3" />
            </svg>
          </div>

          {/* Nodes */}
          {NODES.map((node) => (
            <div
              key={node.name}
              className="absolute group"
              style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${node.delay}s` }}
            >
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-30" />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <span className="text-[10px] text-cyan-400 font-mono tracking-wider">{node.name}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Center info */}
          <div className="relative z-10 text-center">
            <div className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 mb-2">&lt; 50ms</div>
            <p className="text-zinc-500 text-sm mb-6">全球平均响应延迟</p>
            <div className="flex flex-wrap justify-center gap-3">
              {NODES.map((n) => (
                <span key={n.name} className="px-3 py-1 rounded-full text-[10px] tracking-wider uppercase border border-white/[0.06] text-zinc-500 hover:border-cyan-500/20 hover:text-cyan-400 transition-all cursor-default">
                  {n.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCENES BENTO ═══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04]">
        <div className="text-center mb-12">
          <div className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-3 font-mono">use cases</div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">全场景 AI 赋能</h2>
          <p className="text-zinc-500 text-sm">一个平台，无限可能</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SCENES.map((s, i) => (
            <div
              key={s.title}
              className={`group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-cyan-500/20 transition-all duration-300 ${i === 0 ? "md:col-span-2" : ""}`}
            >
              <div className="text-2xl mb-3">{s.icon}</div>
              <h3 className="text-zinc-200 font-semibold mb-1">{s.title}</h3>
              <p className="text-zinc-600 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ DEVELOPER CODE ═══ */}
      <section id="docs" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] scroll-mt-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-3 font-mono">developer first</div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">3 行代码，即刻接入</h2>
            <p className="text-zinc-500 text-sm mb-6">支持 Python、Node.js、Go、Java、Rust 等多种语言 SDK。5 分钟完成集成，1 秒切换任意模型。</p>
            <div className="flex flex-wrap gap-3">
              {["Python", "Node.js", "Go", "Java", "Rust"].map((lang) => (
                <span key={lang} className="px-3 py-1 rounded-lg text-[10px] tracking-wider uppercase border border-white/[0.08] text-zinc-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-all cursor-pointer">{lang}</span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="bg-[#0a0a0f] rounded-2xl border border-white/[0.06] p-5 font-mono text-xs overflow-hidden">
              <div className="flex items-center gap-2 mb-3 text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <span className="ml-2 text-[10px]">example.py</span>
              </div>
              <pre className="text-zinc-400 leading-relaxed">
                <span className="text-fuchsia-400">import</span> <span className="text-cyan-400">yunshang</span>{"\n"}
                {"\n"}
                client = yunshang.<span className="text-cyan-400">Client</span>(<span className="text-emerald-400">"your-api-key"</span>){"\n"}
                response = client.chat.<span className="text-cyan-400">create</span>({"\n"}
                {"    "}model=<span className="text-emerald-400">"gpt-4o"</span>,{"\n"}
                {"    "}messages=[{`{`}"role": <span className="text-emerald-400">"user"</span>, "content": <span className="text-emerald-400">"Hello"</span>{`}`}]{"\n"}
                ){"\n"}
                {"\n"}
                <span className="text-zinc-600"># 一行代码切换任意模型</span>{"\n"}
                <span className="text-cyan-400">print</span>(response.choices[0].message.content)
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LOGO MARQUEE ═══ */}
      <section className="relative z-10 py-16 border-t border-white/[0.04] overflow-hidden">
        <div className="text-center mb-8">
          <p className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase">trusted by 500+ companies worldwide</p>
        </div>
        <div className="relative flex overflow-hidden">
          <div className="flex gap-16 animate-marquee whitespace-nowrap">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <span key={i} className="text-zinc-700 text-sm font-bold tracking-wider uppercase hover:text-zinc-500 transition-colors">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] scroll-mt-20">
        <div className="text-center mb-12">
          <div className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-3 font-mono">pricing</div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">简单透明的定价</h2>
          <p className="text-zinc-500 text-sm">按实际调用量计费，无最低消费，随时可升级</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {PRICING.map((p) => (
            <div key={p.name} className={`relative p-6 rounded-2xl border ${p.highlight ? "border-cyan-500/30 bg-cyan-500/[0.03]" : "border-white/[0.04] bg-white/[0.01]"}`}>
              {p.highlight && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-b-lg text-[10px] tracking-wider uppercase bg-cyan-500 text-black font-bold">
                  推荐
                </div>
              )}
              <h3 className="text-zinc-300 font-semibold mb-1">{p.name}</h3>
              <p className="text-zinc-600 text-xs mb-4">{p.desc}</p>
              <div className="text-3xl font-bold font-mono mb-6">
                <span className={p.highlight ? "text-cyan-400" : "text-white"}>{p.price}</span>
                <span className="text-sm text-zinc-600">{p.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-zinc-500 flex items-center gap-2">
                    <span className="text-cyan-500/60">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => scrollToSection(p.name === "企业版" ? "faq" : "docs")}
                className={`w-full py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-all ${
                  p.highlight
                    ? "bg-cyan-500 text-black hover:bg-cyan-400"
                    : "border border-white/[0.08] text-zinc-400 hover:border-cyan-500/30 hover:text-cyan-400"
                }`}
              >
                {p.name === "企业版" ? "联系销售" : p.price === "¥0" ? "免费开通" : "立即订阅"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t border-white/[0.04] scroll-mt-20">
        <div className="text-center mb-12">
          <div className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-3 font-mono">faq</div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">常见问题</h2>
          <p className="text-zinc-500 text-sm">接入、安全、计费、故障——先看这里，少走一圈工单</p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.01] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left text-sm text-zinc-300 hover:text-cyan-400 transition-colors"
              >
                <span className="pr-4">{faq.q}</span>
                <span className={`text-cyan-400 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-5 text-sm text-zinc-500 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04]">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/10 bg-cyan-500/[0.02] p-12 md:p-16 text-center">
          <div className="absolute inset-0 rounded-3xl" style={{
            backgroundImage: "linear-gradient(rgba(0,240,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.02) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }} />
          <div className="relative">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              <GlitchText text="准备好逐梦了吗？" />
            </h2>
            <p className="text-zinc-500 mb-8 text-sm max-w-xl mx-auto leading-relaxed">
              加入 50 万+ 开发者。少对接几家供应商，多把时间花在产品上——这就是云上逐梦要替你省下的。
            </p>
            <button
              type="button"
              onClick={() => scrollToSection("pricing")}
              className="group relative px-8 py-4 rounded-xl text-sm font-bold tracking-wider uppercase overflow-hidden border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:text-black transition-colors duration-300"
            >
              <span className="relative z-10">立即注册，免费体验 →</span>
              <span className="absolute inset-0 bg-cyan-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/[0.04] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-700 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
              </svg>
            </div>
            <span className="tracking-wider uppercase">云上逐梦 © 2026</span>
          </div>
          <div className="flex gap-6">
            <button type="button" onClick={() => scrollToSection("faq")} className="hover:text-cyan-400 transition-colors cursor-pointer">隐私政策</button>
            <button type="button" onClick={() => scrollToSection("faq")} className="hover:text-cyan-400 transition-colors cursor-pointer">服务条款</button>
            <a href="mailto:hello@yszmai.com" className="hover:text-cyan-400 transition-colors cursor-pointer">联系我们</a>
          </div>
        </div>
      </footer>

      {/* ═══ DEMO MODAL ═══ */}
      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setShowDemo(false)}>
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/20 bg-[#0a0a0f] p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowDemo(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-cyan-400 text-xl leading-none"
              aria-label="关闭"
            >
              ×
            </button>
            <div className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-3 font-mono">live demo</div>
            <h3 className="text-xl font-bold mb-2">30 秒看懂云上逐梦</h3>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              同一套 API，切换 model 即可调用不同大模型。智能路由在后台自动选最优节点，你只管写业务逻辑。
            </p>
            <div className="bg-black/50 rounded-xl border border-white/[0.06] p-4 font-mono text-xs text-zinc-400 mb-4 leading-relaxed">
              <div className="text-zinc-600 mb-2"># 一行切换模型</div>
              <div><span className="text-fuchsia-400">for</span> model <span className="text-cyan-400">in</span> [<span className="text-emerald-400">&quot;gpt-4o&quot;</span>, <span className="text-emerald-400">&quot;claude-3.5&quot;</span>, <span className="text-emerald-400">&quot;deepseek&quot;</span>]:</div>
              <div className="pl-4">resp = client.chat.create(model=model, messages=[...])</div>
              <div className="text-cyan-400 mt-2">→ 路由命中: 新加坡节点 · 延迟 28ms</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => { setShowDemo(false); scrollToSection("docs"); }}
                className="flex-1 py-3 rounded-lg text-xs font-medium tracking-wider uppercase border border-white/[0.08] text-zinc-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
              >
                查看接入文档
              </button>
              <button
                type="button"
                onClick={() => { setShowDemo(false); scrollToSection("pricing"); }}
                className="flex-1 py-3 rounded-lg text-xs font-medium tracking-wider uppercase bg-cyan-500 text-black hover:bg-cyan-400 transition-all"
              >
                免费开始使用
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
