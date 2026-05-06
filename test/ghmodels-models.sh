#!/bin/bash

# GitHub AI 模型代理 - Models 端点测试脚本
# 获取可用的模型列表

curl -X GET https://ghmodels.example.com/v1/models \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN"