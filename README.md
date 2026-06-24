# 青心树洞 🌳

> 你的情绪陪伴角落 — 记录心情、倾诉心事、看见成长

面向校园场景的情绪陪伴应用，提供情绪日记、AI 树洞倾诉、情绪卡牌、每日日签、呼吸放松、正向内容、成长档案等功能，帮助用户记录情绪、缓解压力、看见自己的成长轨迹。

> ⚠️ **项目状态说明**：本项目目前仅为 Demo 状态，后续还会有更多新功能的开发与优化迭代。

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 📔 情绪日记 | 记录每日心情，支持情绪趋势图表与日历回溯 |
| 💬 AI 树洞 | 基于 Agnes AI 的流式对话陪伴，支持情绪识别与危机干预 |
| 🎴 情绪卡牌 | 记忆配对小游戏，放松心情 |
| 🌅 每日日签 | AI 生成治愈文案 + 生图模型背景，可下载分享 |
| 🌬️ 呼吸放松 | 4-7-8 / 等长 / 方框呼吸法引导动画 |
| 📚 正向内容 | AI 每日生成 20+ 条治愈短句与文章 |
| 📊 成长档案 | 情绪雷达图、使用统计、AI 月度小结、成就墙 |

## 🛠️ 技术栈

- **框架**：React 18 + TypeScript 5
- **构建**：Vite 5
- **路由**：React Router 6（HashRouter）
- **样式**：Tailwind CSS 3 + CSS 变量主题系统
- **状态**：Zustand 4
- **数据**：IndexedDB（idb）本地持久化，纯前端无后端
- **AI**：Agnes AI（agnes-2.0-flash 文本 + agnes-image-2.1-flash 生图）

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- pnpm ≥ 8（推荐）

### 安装与运行

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 类型检查
pnpm typecheck

# 生产构建
pnpm build

# 预览构建产物
pnpm preview
```

### 体验账号

应用启动后会自动创建预设账号与测试数据：

- **用户名**：`demo`
- **密码**：`demo123`

登录页点击"使用体验账号一键登录"即可快速体验，已预置 14 天测试数据。

## 🔑 AI 功能配置

AI 功能（树洞对话、日签生成、正向内容）依赖 Agnes AI 接口。在项目根目录创建 `.env` 文件：

```env
VITE_LLM_API_BASE=/llm-api
VITE_LLM_API_KEY=your_api_key_here
VITE_LLM_MODEL=agnes-2.0-flash
VITE_IMAGE_GEN_API_BASE=/llm-api
VITE_IMAGE_GEN_API_KEY=your_api_key_here
VITE_IMAGE_GEN_MODEL=agnes-image-2.1-flash
```

> **说明**：开发环境下 `/llm-api` 由 Vite 代理转发到 Agnes AI 接口，避免 CORS 限制。
> 生产环境（GitHub Pages / Gitee Pages）为纯静态托管，AI 请求会自动降级为预设回复与 Canvas 渲染，核心功能不受影响。

## 📦 部署

项目已配置为部署在 `/qingxin-shudong/` 子路径，适配 GitHub Pages 与 Gitee Pages。

### GitHub Pages

推送代码后，GitHub Actions 会自动构建并部署到 `https://<username>.github.io/qingxin-shudong/`。

### Gitee Pages

1. 推送代码到 Gitee 仓库
2. 在仓库「服务」→「Gitee Pages」中开启服务
3. 部署目录设为 `dist`（需先本地执行 `pnpm build`）
4. 访问 `https://<username>.gitee.io/qingxin-shudong/`

## 📁 项目结构

```
qingxin-shudong/
├── public/              # 静态资源（favicon、.nojekyll）
├── src/
│   ├── components/      # 通用组件（布局、UI、业务组件）
│   ├── constants/       # 常量配置（呼吸法、卡牌、提示词）
│   ├── db/              # IndexedDB 数据层
│   ├── hooks/           # 自定义 Hooks
│   ├── pages/           # 页面组件
│   ├── services/        # AI 服务（LLM、内容生成、危机检测）
│   ├── stores/          # Zustand 状态管理
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 路由配置
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── .github/workflows/   # GitHub Actions 部署工作流
├── vite.config.ts       # Vite 配置
└── tailwind.config.js   # Tailwind 配置
```

## 📄 License

MIT
