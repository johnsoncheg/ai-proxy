/**
 * 代理服务配置文件
 * 包含所有代理规则和路径转换函数
 */

// 代理配置接口
export interface ProxyConfig {
  targetBaseUrl: string;
  transformPath: (path: string) => string;
  transformBody?: (body: string) => string;
}

/**
 * Google AI Studio 路径转换函数
 * 将 OpenAI 兼容的路径转换为 Google AI Studio 的路径
 * 将所有 /v1 开头的路径替换为 /v1beta/openai 开头的路径
 */
function transformGooglePath(originalPath: string): string {
  // 如果路径以 /v1 开头，将其替换为 /v1beta/openai
  if (originalPath.startsWith("/v1/")) {
    return originalPath.replace("/v1/", "/v1beta/openai/");
  }

  // 如果不是 /v1 开头的路径，返回原始路径
  return originalPath;
}

/**
 * GitHub AI 模型路径转换函数
 * 将 /v1 开头的路径转换为 /inference 开头的路径
 */
function transformGitHubPath(originalPath: string): string {
  // 如果路径以 /v1 开头，将其替换为 /inference
  if (originalPath.startsWith("/v1/")) {
    return originalPath.replace("/v1/", "/inference/");
  }

  // 如果不是 /v1 开头的路径，返回原始路径
  return originalPath;
}

// 代理规则配置映射
export const PROXY_CONFIGS: Record<string, ProxyConfig> = {
  // Google AI Studio 代理配置
  "aistudioproxy.example.com": {
    targetBaseUrl: "https://generativelanguage.googleapis.com",
    transformPath: transformGooglePath,
  },

  // GitHub AI 模型代理配置
  "ghmodels.example.com": {
    targetBaseUrl: "https://models.github.ai",
    transformPath: transformGitHubPath,
  },
};

// 默认配置（Google AI Studio）
export const DEFAULT_CONFIG: ProxyConfig = {
  targetBaseUrl: "https://generativelanguage.googleapis.com",
  transformPath: transformGooglePath,
};

/**
 * 根据主机名获取代理配置
 * @param hostname 请求的主机名
 * @returns 对应的代理配置
 */
export function getProxyConfig(hostname: string): ProxyConfig {
  return PROXY_CONFIGS[hostname] || DEFAULT_CONFIG;
}