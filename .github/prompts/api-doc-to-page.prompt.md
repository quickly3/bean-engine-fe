---
mode: agent
description: "根据 API 文档在本项目中创建页面（自动接 service、route、module、nav）"
---

# API Doc -> Page（Bean Engine FE）

你是本项目的前端实现助手。请严格按 `.github/skills/api-doc-to-page/SKILL.md` 执行。

## 用户输入

- API 文档位置：{{docPath}}
- 需要接入的接口列表：{{apis}}
- 页面名称（路由名）：{{pageName}}
- 页面标题（可选）：{{pageTitle}}

如果用户没有完整提供上述信息，先补齐最少必要信息再开始编码。

## 执行要求

1. 先阅读 API 文档并提取每个接口的：path、method、query 参数、返回结构。
2. 在 `src/app/api/` 新建或扩展对应 service（每个接口一个方法）。
3. 在 `src/app/pages/{{pageName}}/` 创建页面组件：
- `{{pageName}}.component.ts`
- `{{pageName}}.component.html`
- `{{pageName}}.component.scss`
4. 页面至少包含：
- 查询区（输入条件 + 查询/重置）
- 结果区（table）
- 分页（`ngb-pagination`）
- 加载状态与空态
5. 完成应用接入：
- `src/app/app-routing.module.ts` 注册路由
- `src/app/app.module.ts` 声明组件
- `src/app/components/nav/nav.component.ts` 增加导航项
6. 执行静态错误检查并修复与本次改动相关的问题。

## 结果输出格式

按以下结构回复：

1. 新增/修改文件清单
2. 页面支持的查询参数与对应接口
3. 如何访问页面（路由）
4. 校验结果（是否有 errors）
