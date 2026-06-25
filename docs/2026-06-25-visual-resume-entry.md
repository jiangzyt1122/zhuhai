# 互动简历入口变更说明

## 背景

主应用当前首页提供英语学习、地图探索和开心小鸡农场三个入口。用户希望把 `interactive-visual-resume` 页面接入主页面，并单独增加一个入口。

## 范围

- 在首页入口卡片中新增「互动简历」入口。
- 入口打开独立构建后的简历子应用路径 `/visual-resume/`。
- 保持互动简历作为独立 Vite 子应用，不把 Tailwind 4 简历界面直接混入主应用 Tailwind 3 React 树。
- 主应用构建时先构建互动简历嵌入版本，再构建主应用。
- 主应用本地开发服务支持访问 `/visual-resume/` 已构建产物。

## 字段与数据

| Field | Meaning | Source | Owner Object | Editable | Notes |
|---|---|---|---|---|---|
| visualResumeHref | 首页入口跳转地址 | derived | App | no | 由 `import.meta.env.BASE_URL + visual-resume/` 派生 |

## 验收

- 首页出现独立「互动简历」入口。
- 点击入口打开 `/visual-resume/`。
- `npm run build` 会构建主应用和互动简历入口所需的子应用产物。
- 不新增持久化业务字段。
