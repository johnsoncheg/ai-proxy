/**
 * AI Studio Proxy - Cloudflare Worker
 *
 * 多域名代理服务：
 * - aistudioproxy.example.com -> generativelanguage.googleapis.com
 * - ghmodels.example.com -> models.github.ai
 */

import { getProxyConfig } from './config';

export interface Env {
  // 可以在这里添加环境变量，比如 API 密钥等
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: any
  ): Promise<Response> {
    try {
      // 解析原始请求的 URL
      const url = new URL(request.url);

      // 根据主机名获取代理配置
      const config = getProxyConfig(url.hostname);

      // 转换路径
      const transformedPath = config.transformPath(url.pathname);

      // 构建目标 URL，使用转换后的路径和查询参数
      const targetUrl = new URL(transformedPath + url.search, config.targetBaseUrl);

      // 直接使用原始请求头部，简单转发
      const headers = new Headers(request.headers);

      // 添加 CORS 头部以支持跨域请求
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-API-Key",
        "Access-Control-Max-Age": "86400",
      };

      // 处理预检请求
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }

      // 处理请求体转换
      let transformedBody = request.body;
      if (config.transformBody && request.body) {
        const bodyText = await request.text();
        const transformedBodyText = config.transformBody(bodyText);
        transformedBody = transformedBodyText;
      }

      // 创建代理请求
      const proxyRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: headers,
        body: transformedBody,
      });

      // 发送请求到目标服务器
      const response = await fetch(proxyRequest);

      // 创建响应，添加 CORS 头部
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const proxyResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...responseHeaders,
          ...corsHeaders,
        },
      });

      return proxyResponse;
    } catch (error) {
      // 错误处理
      console.error("代理请求失败:", error);

      return new Response(
        JSON.stringify({
          error: "代理请求失败",
          message: error instanceof Error ? error.message : "未知错误",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};