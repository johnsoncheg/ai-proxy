# AI Studio Proxy

一个基于 Cloudflare Workers 的简单代理服务，用于将请求转发到 Google AI Studio API (`generativelanguage.googleapis.com`)。

## 功能特性

- ✅ 完整的路径和查询参数映射
- ✅ **OpenAI 兼容路径转换**：自动将 `/v1/chat/completions` 转换为 `/v1beta/openai/chat/completions`
- ✅ 支持所有 HTTP 方法（GET, POST, PUT, DELETE 等）
- ✅ 自动处理 CORS 跨域请求
- ✅ 错误处理和日志记录
- ✅ 移除 Cloudflare 特定的请求头
- ✅ 可扩展的路径映射规则

## 部署

### 1. 安装依赖

```bash
npm install
```

### 2. 开发环境运行

```bash
npm start
```

### 3. 部署到 Cloudflare Workers

```bash
npm run deploy
```

## 使用方法

部署后，你可以通过代理域名访问 Google AI Studio API：

### 路径转换功能

代理服务支持 OpenAI 兼容的路径自动转换：

**OpenAI 兼容路径：**

```
https://your-worker-domain.workers.dev/v1/chat/completions
```

**自动转换为：**

```
https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
```

### 原始 API 地址：

```
https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR_API_KEY
```

### 通过代理访问：

```
https://your-worker-domain.workers.dev/v1/models/gemini-pro:generateContent?key=YOUR_API_KEY
```

### 示例请求

#### 1. 使用 OpenAI 兼容接口

```javascript
// 使用 OpenAI 兼容的路径，会自动转换
const response = await fetch(
  "https://your-worker-domain.workers.dev/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_API_KEY",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, how are you?" }],
    }),
  }
);

const data = await response.json();
console.log(data);
```

#### 2. 使用原生 Gemini API

```javascript
// 使用代理访问 Gemini API
const response = await fetch(
  "https://your-worker-domain.workers.dev/v1/models/gemini-pro:generateContent?key=YOUR_API_KEY",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: "Hello, how are you?" }],
        },
      ],
    }),
  }
);

const data = await response.json();
console.log(data);
```

## 配置

### 自定义域名

在 `wrangler.toml` 中配置你的自定义域名：

```toml
name = "aistudio"
main = "src/index.ts"
compatibility_date = "2025-07-01"
routes = ["your-domain.com/*"]
```

### 环境变量

你可以在 `wrangler.toml` 中添加环境变量：

```toml
[env.production.vars]
API_KEY = "your-api-key"
```

然后在代码中使用：

```typescript
export interface Env {
  API_KEY: string;
}
```

## 测试

运行测试：

```bash
npm test
```

## 注意事项

1. **API 密钥安全**：请确保妥善保管你的 Google AI Studio API 密钥
2. **速率限制**：代理会保持 Google API 的原始速率限制
3. **CORS**：代理已配置为允许所有来源的跨域请求
4. **日志**：错误信息会记录在 Cloudflare Workers 日志中

## 许可证

MIT License
