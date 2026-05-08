---
name: api-doc-to-page
description: "根据 OpenAPI/JSON API 文档在本项目中创建可查询页面。Use when: 用户提出'根据接口文档建页面'、'查看 api doc 并做查询页'、'把某些接口做成前端列表/检索页面'。"
---

# API Doc To Page (Bean Engine FE)

## 目标

把后端 API 文档中的接口，快速落地为本项目可用的 Angular 页面，包含：
- 查询表单
- 列表展示
- 分页
- 路由入口和导航入口
- 基础加载/空态处理

## 适用范围

适用于以下需求：
- 已有接口文档（OpenAPI/Swagger/JSON）
- 需要创建新页面来查询和展示接口数据
- 需要同时接入多个相关接口（如主列表 + 扩展详情）

## 项目约定（本仓库）

### 目录与文件位置

- API 封装：`src/app/api/*.service.ts`
- 页面文件：`src/app/pages/<page-name>/`
- 路由注册：`src/app/app-routing.module.ts`
- 页面声明：`src/app/app.module.ts`
- 顶部导航：`src/app/components/nav/nav.component.ts`

### 技术约束

- 使用 Angular + HttpClient + FormsModule（模板驱动表单）
- API 查询参数通过 GET `params` 传递
- 页面内使用 `ngb-pagination` 做分页
- 新页面统一包含 `<app-nav></app-nav>`

## 标准流程

1. 读 API 文档并提取字段
- 接口路径、方法、参数类型、是否必填
- 返回结构（`list/total/page/pageSize`）
- 是否有可切换模式（例如普通列表 vs 带关联数据列表）

2. 设计最小可用查询模型
- 每个接口准备一个 query 对象，至少包含：`page`、`pageSize`
- 其余查询条件按文档补齐（例如 `keyword`、`sourceId`）
- 清理空参数后再请求，避免发送空字符串

3. 新建 API Service
- 在 `src/app/api` 下新增 service
- 每个接口一个方法
- 命名清晰、与接口语义一致

4. 新建页面组件
- 在 `src/app/pages/<page-name>` 下创建 `ts/html/scss`
- 页面拆分为：查询区 + 结果区（可多块）
- 支持：查询、重置、分页、加载状态、空数据状态

5. 接入应用
- 在 `app-routing.module.ts` 注册路由
- 在 `app.module.ts` 声明组件
- 在 `nav.component.ts` 增加导航入口

6. 校验
- 使用诊断工具检查新增文件是否有错误
- 至少确认以下项：
  - 页面能打开
  - 查询条件可生效
  - 翻页请求正确
  - 空结果不报错

7. 文档 `example` 变更同步
- 当接口 `responses.200.content.application/json.schema.example` 更新时，先对比页面已展示字段与 example 字段差异
- 新增字段优先补充到表格列（或详情区），缺失值统一显示 `-`，避免模板空值报错
- URL 字段按可点击链接展示（含 `target="_blank"` + `rel="noopener noreferrer"`）
- 长文本字段（如 `description`）使用截断显示并保留 `title` 提示
- 若表格列数变化，必须同步更新空态 `colspan`
- 完成后执行错误检查，确认模板无类型/绑定错误

## 页面实现模板

### 1) API Service 模板

```ts
@Injectable({ providedIn: 'root' })
export class XxxService {
  apiURL = environment.apiURL;
  constructor(private http: HttpClient) {}

  getList = (params: any) => this.http.get(this.apiURL + '/xxx/list', { params });
}
```

### 2) Query/Response 模板

```ts
query = {
  page: 1,
  pageSize: 20,
  keyword: '',
};

resp: any = {
  list: [],
  total: 0,
  page: 1,
  pageSize: 20,
};
```

### 3) 空参数清理模板

```ts
private compactParams(params: any): any {
  const compacted: any = {};
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== '' && value !== null && value !== undefined) {
      compacted[key] = value;
    }
  });
  return compacted;
}
```

## 交付检查清单

- [ ] API service 已创建并可复用
- [ ] 页面支持查询/重置/分页
- [ ] 页面支持加载中和空态
- [ ] 文档 example 新字段已同步到页面展示
- [ ] 路由已注册
- [ ] 模块声明已添加
- [ ] 导航入口已添加
- [ ] 静态错误检查通过

## 本项目示例（WBG）

按此流程已实现过以下接口页面：
- `/wbg/data-sources`
- `/wbg/indicators`
- `/wbg/indicators-with-data-source`

页面能力包括：
- Data Sources 查询与分页
- Indicators 查询与分页
- 切换 indicators 与 indicators-with-data-source 模式
- 通过 data-source 一键反向设置 `sourceId` 过滤 indicators
