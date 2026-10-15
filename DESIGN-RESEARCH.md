# 天空之城：第二版研究与设计取舍

本次阅读了以下仓库的 README、依赖与实际布局/样式文件。没有复制作者的内容、图片或主题代码。

| 项目 | 查阅的实现 | 采用的原则 |
| --- | --- | --- |
| [Paco](https://github.com/pacocoursey/paco) | styles/global.css、styles/markdown.css | 统一间距变量、克制的动效、适合长文的宽度。此仓库是历史版本，仅作视觉研究。 |
| [Anthony Fu](https://github.com/antfu/antfu.me) | src/styles/prose.css、内容组织 | 让文字成为主体，兴趣与文章分开组织，控制阅读行长。 |
| [Lee Robinson](https://github.com/leerob/next-mdx-blog) | app/layout.tsx、app/globals.css | 简单导航、清楚的文字层级、小而完整的页面结构。 |
| [Tailwind Next.js Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) | layouts/ListLayout.tsx | 内容模型驱动列表、按标题/摘要/标签搜索、状态反馈。 |
| [Shiro](https://github.com/innei/Shiro) | 首页 TwoColumnLayout、架构说明 | 区分访客阅读与内容管理，桌面与手机采用不同布局。当前上游处于维护模式，不作为代码依赖。 |

## 新版方向

- 保留“天空之城”名字，取消生成式风景横幅、英文装饰眉题与口号堆叠。
- 使用石白、深灰和少量蓝色；统一 4/8px 间距、边线、圆角、阴影与 Lucide 图标。
- 首页以近期文章、专题入口和书桌为中心，首屏可直接进入内容。
- 采用 React + Vite；阅读界面与写作台共用数据模型。
- 文章、书单、音乐支持新增、编辑、回收站、恢复、搜索、排序和筛选。
- 草稿保存在当前浏览器；“发布到网站”通过 GitHub Contents API 写入 public/data/content.json，并由现有 Pages 工作流部署。
- 访客只读取公开快照，不能写入仓库。GitHub 访问令牌只留在页面会话内存，不进入本地存储、导出文件或仓库。

## 技术资料

- [React 官方：从零构建应用](https://react.dev/learn/build-a-react-app-from-scratch)
- [Vite 官方：GitHub Pages 部署](https://vite.dev/guide/static-deploy#github-pages)
- [GitHub 官方：Contents API](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents)

GitHub Pages 的静态托管不会替浏览器提供管理凭据。首次使用在线发布时，由站主在写作台连接仅授权 sky-city 仓库 Contents 读写的令牌。草稿保存与公开发布分别标注，避免把本机保存误认为全网发布。
