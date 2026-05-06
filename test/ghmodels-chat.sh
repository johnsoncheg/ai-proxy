#!/bin/bash

# GitHub AI 模型代理测试脚本
# 向 ghmodels.example.com 发送 chat/completions 请求

curl -X POST https://ghmodels.example.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }'