# 天空之城
在书页与风声之间，筑一座自己的城。

一个奶油白、雾蓝和灰橄榄配色的个人杂志网站。内容包含考公笔记、科研札记、生活随笔、学习心得、工作思考、读书和音乐。

## 本地预览
进入本项目文件夹，运行：
```
python -m http.server 4173 --directory dist
```
浏览器打开 http://localhost:4173 。

## 修改内容
- 文章、分类、书单：修改 dist/content.js。首版内容均为原创示例。
- 配色与排版：修改 dist/styles.css。
- 首页结构：修改 dist/index.html。
- 关于页面：修改 dist/about.html。
- 配图：放在 dist/assets/，并使用相对路径引用。
- 每篇文章的链接：article.html?id=文章的唯一id。
- 音乐试听为站内原创合成音色片段，无外部音乐文件或付费服务。

## 免费发布到 GitHub Pages
目标公开仓库：ikun80723/sky-city。
1. 创建空的公开 sky-city 仓库。
2. 上传本项目的 dist 文件夹和 .github/workflows/deploy.yml，保持目录结构。
3. 仓库 Settings → Pages → Source 选择 GitHub Actions。
4. Actions → Deploy Sky City to GitHub Pages → Run workflow。
5. 等待成功后访问 https://ikun80723.github.io/sky-city/ 。

如果使用网页上传，请分别上传 dist 文件夹和工作流；若上传工具会跳过隐藏目录，可以在 GitHub 上创建 .github/workflows/deploy.yml，并复制本项目对应文件内容。
公开仓库与 GitHub Pages 的免费方案适合这个个人静态网站；网址与部署成功状态须以 GitHub 实际返回为准。

## 素材
- 两张页面摄影由内置 ImageGen 创作，提示词见 IMAGE-PROMPTS.md。
- 书籍封面为原创排版，并非出版社原版封面。
- 字体：Noto Serif SC，SIL Open Font License，许可见 dist/assets/FONT-LICENSE.txt。
- 页面无第三方分析脚本、远程字体或外部图片依赖。
