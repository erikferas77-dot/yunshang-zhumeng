# 云上逐梦 API 网关

OpenAI 兼容的统一大模型接入层，供 Playground 与业务方调用。

- 地址：`https://api.yszmai.com/v1`
- 协议：OpenAI Chat Completions（`/v1/chat/completions`）
- 鉴权：`Authorization: Bearer <LITELLM_MASTER_KEY>`

底层基于 [LiteLLM Proxy](https://docs.litellm.ai/docs/proxy/quick_start)，按 `model` 字段路由到各家上游。

---

## 架构

```
Playground / 你的 App
        │
        ▼
api.yszmai.com  ← Fly.io / 云服务器（本目录）
        │
        ├── OpenAI (gpt-4o)
        ├── Anthropic (claude-3-5-sonnet)
        ├── DeepSeek / 通义 / Kimi / 智谱 …
        └── …
```

---

## 方案 A：Fly.io（推荐，Serverless 风格）

免费额度够跑 Demo；新加坡节点 `sin` 离国内较近。

### 1. 安装并登录

```bash
brew install flyctl   # 或 curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. 首次部署

```bash
cd api
fly launch --no-deploy --copy-config --name yszmai-api --region sin
```

### 3. 设置密钥（至少 Master Key + 一个上游 Key）

```bash
fly secrets set \
  LITELLM_MASTER_KEY="sk-yszmai-你的随机密钥" \
  DEEPSEEK_API_KEY="sk-..." \
  OPENAI_API_KEY="sk-..."
```

### 4. 部署

```bash
fly deploy
```

### 5. 绑定自定义域名

```bash
fly certs add api.yszmai.com
```

Fly 会提示 DNS 记录，在 **Spaceship** 添加：

| 类型 | 主机 | 值 |
|------|------|-----|
| CNAME | `api` | `yszmai-api.fly.dev` |

等证书签发（通常几分钟）后，访问：

```bash
curl https://api.yszmai.com/health/liveliness
curl https://api.yszmai.com/v1/models \
  -H "Authorization: Bearer sk-yszmai-你的随机密钥"
```

---

## 方案 B：自有云服务器（Docker）

```bash
cd api
cp .env.example .env
# 编辑 .env 填入密钥
docker compose up -d --build
```

Nginx 反代示例：

```nginx
server {
    listen 443 ssl;
    server_name api.yszmai.com;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_read_timeout 300s;
    }
}
```

DNS：A 记录 `api` → 服务器公网 IP。

---

## Playground 联调

1. 打开 https://yszmai.com/playground
2. Base URL：`https://api.yszmai.com/v1`
3. API Key：填 `LITELLM_MASTER_KEY`
4. 选模型 → 发送

---

## 支持的模型 ID

与 Playground 下拉一致，见 `litellm_config.yaml`。未配置上游 Key 的模型会返回 503，属正常——按需 `fly secrets set` 补充即可。

---

## 费用说明

- **Fly.io 机器**：按量计费，可 `min_machines_running = 0` 空闲停机
- **上游 Token**：按各模型厂商官方价，由你在对应平台充值

---

## 故障排查

| 现象 | 处理 |
|------|------|
| `401 Unauthorized` | 检查 Bearer 是否与 `LITELLM_MASTER_KEY` 一致 |
| 某模型 503 | 该上游 `*_API_KEY` 未配置或余额不足 |
| Playground CORS 报错 | LiteLLM 默认允许；若自建 Nginx 需加 CORS 头 |
| `api.yszmai.com` 无法解析 | 检查 Spaceship CNAME 是否生效（`dig api.yszmai.com`） |
