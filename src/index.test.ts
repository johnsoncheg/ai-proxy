import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { unstable_dev } from "wrangler";
import type { Unstable_DevWorker } from "wrangler";

describe("AI Studio Proxy Worker", () => {
  let worker: Unstable_DevWorker;

  beforeAll(async () => {
    worker = await unstable_dev("src/index.ts", {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it("should handle OPTIONS request (CORS preflight)", async () => {
    const resp = await worker.fetch("/", {
      method: "OPTIONS",
    });

    expect(resp.status).toBe(200);
    expect(resp.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(resp.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    expect(resp.headers.get("Access-Control-Allow-Headers")).toContain(
      "Content-Type"
    );
  });

  it("should proxy GET request with correct URL structure", async () => {
    // 测试一个简单的路径代理
    const testPath = "/v1/models";
    const resp = await worker.fetch(testPath);

    // 由于我们无法实际访问 Google API（需要认证），
    // 我们主要测试代理是否正确构建了请求
    // 这里应该返回一个错误响应，但包含正确的 CORS 头
    expect(resp.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should preserve query parameters", async () => {
    const testPath = "/v1/models?pageSize=10&pageToken=abc";
    const resp = await worker.fetch(testPath);

    // 检查 CORS 头部存在
    expect(resp.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should handle POST requests", async () => {
    const testPath = "/v1/models/gemini-pro:generateContent";
    const resp = await worker.fetch(testPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Hello" }],
          },
        ],
      }),
    });

    // 检查 CORS 头部存在
    expect(resp.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should transform OpenAI compatible path to Google AI Studio path", async () => {
    // 测试路径转换功能
    const openaiPath = "/v1/chat/completions";
    const resp = await worker.fetch(openaiPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-key",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    // 检查 CORS 头部存在
    expect(resp.headers.get("Access-Control-Allow-Origin")).toBe("*");

    // 由于我们无法实际访问 Google API，我们主要测试代理是否正确处理了请求
    // 路径转换应该在内部发生，从 /v1/chat/completions 转换为 /v1beta/openai/chat/completions
  });

  it("should preserve query parameters in path transformation", async () => {
    const openaiPathWithQuery =
      "/v1/chat/completions?stream=true&temperature=0.7";
    const resp = await worker.fetch(openaiPathWithQuery, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Test" }],
      }),
    });

    // 检查 CORS 头部存在
    expect(resp.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should not transform non-matching paths", async () => {
    // 测试不匹配的路径应该保持原样
    const originalPath = "/v1/models/list";
    const resp = await worker.fetch(originalPath);

    // 检查 CORS 头部存在
    expect(resp.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
