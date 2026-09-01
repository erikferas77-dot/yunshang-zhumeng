# 云上逐梦 Sol API 网关

供 `https://yszmai.com/playground/` 和团队应用调用的 OpenAI 兼容网关。

- Base URL：`https://api.yszmai.com/v1`
- 模型：`gpt-5.6-sol`
- 调用鉴权：`Authorization: Bearer <LITELLM_MASTER_KEY>`
- 上游：OpenAI API，密钥只保存在服务器的 `OPENAI_API_KEY`

## 架构

```text
yszmai.com / 团队应用
        │  团队网关 Key
        ▼
api.yszmai.com（LiteLLM）
        │  OpenAI 上游 Key（仅服务器可见）
        ▼
OpenAI GPT-5.6 Sol
```

## 服务器部署

服务器目录为 `/opt/yszmai-api`，DNS 已将 `api.yszmai.com` 指向服务器，Caddy 把 HTTPS 请求反向代理至 `127.0.0.1:8080`。

服务器 `.env` 必须包含：

```dotenv
LITELLM_MASTER_KEY=sk-yszmai-团队网关密钥
OPENAI_API_KEY=sk-OpenAI项目密钥
```

不要把 `.env`、OpenAI Key 或团队网关 Key 提交到 Git，也不要把 OpenAI Key 填入网页。

部署：

```bash
cd /opt/yszmai-api
docker compose up -d --build
```

健康检查：

```bash
curl https://api.yszmai.com/health/liveliness
curl https://api.yszmai.com/v1/models \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

真实请求：

```bash
curl https://api.yszmai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "gpt-5.6-sol",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

## 团队使用

第一阶段可以把 `LITELLM_MASTER_KEY` 作为团队网关 Key，OpenAI Key 始终隐藏在服务器端。40 人正式使用时，建议再接入 LiteLLM 虚拟 Key 和数据库，为每个成员设置独立额度、撤销权限和用量统计。
