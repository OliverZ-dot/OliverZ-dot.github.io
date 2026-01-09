# 赛博朋克学术主页 🚀

超级无敌高大上的赛博朋克 + 黑客 + 高科技风格个人学术主页模板

## ✨ 特性

### 🎨 视觉特效
- **赛博朋克配色** - 青色、紫色、绿色霓虹灯效果
- **矩阵雨背景** - 经典的Matrix风格数字雨
- **粒子系统** - 动态粒子网络连接效果
- **全息投影** - 3D环形全息投影装饰
- **故障效果** - Glitch文本动画
- **HUD界面** - 科幻风格界面元素（雷达扫描、系统状态）
- **扫描线** - CRT显示器风格的扫描线效果
- **网格覆盖** - 动态网格背景

### 💫 交互效果
- **打字机效果** - 自动循环显示多个文本
- **鼠标跟随** - 霓虹光标跟踪效果
- **平滑滚动** - 优雅的页面导航
- **卡片动画** - 滚动进入视口时的动画
- **悬停特效** - 所有元素的发光和变形效果
- **数据可视化** - 动态柱状图显示技能/能力

### 🎯 功能模块
- **终端窗口** - 黑客风格的终端界面
- **项目展示** - 带进度条的项目卡片
- **论文列表** - 精美的论文展示卡片
- **教育时间线** - 垂直时间线展示教育背景
- **联系方式** - 网格布局的联系信息

## 📁 文件结构

```
.
├── index.html          # 主页面文件
├── styles.css          # 样式表（赛博朋克风格）
├── effects.js          # 特效脚本（打字机、矩阵雨、鼠标跟踪等）
├── particles.js        # 粒子系统
└── README.md          # 说明文档
```

## 🚀 使用方法

### 1. 本地预览
直接打开 `index.html` 文件在浏览器中查看效果。

### 2. 自定义内容
编辑 `index.html` 文件，替换以下占位符内容：

#### 个人信息
- 修改 `<h1>` 标签中的姓名
- 更新 `data-text` 属性（用于故障效果）

#### 关于我部分
```html
<p class="text-content">在这里填写你的个人简介...</p>
```

#### 研究项目
```html
<h3 class="project-title">研究项目 1</h3>
<p class="project-desc">项目描述...</p>
```

#### 发表论文
```html
<h3 class="paper-title">论文标题 1</h3>
<p class="paper-authors">作者列表</p>
```

#### 教育背景
```html
<h3 class="edu-degree">学位名称</h3>
<p class="edu-school">学校名称, 专业</p>
```

#### 联系方式
```html
<span class="contact-value">your.email@university.edu</span>
```

### 3. 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中：
   - 进入 Settings → Pages
   - 选择 Source: Deploy from a branch
   - 选择 Branch: main/master
   - 选择文件夹: / (root)
3. 保存后，访问 `https://你的用户名.github.io`

### 4. 自定义颜色（可选）

编辑 `styles.css` 文件中的 CSS 变量：

```css
:root {
    --cyber-cyan: #00ffff;      /* 青色 */
    --cyber-green: #00ff41;     /* 绿色 */
    --cyber-purple: #ff00ff;    /* 紫色 */
    /* ... 更多颜色 */
}
```

## 🎨 设计特点

### 配色方案
- **主色**: 青色 (#00ffff) - 科技感
- **强调色**: 紫色 (#ff00ff) - 赛博朋克
- **辅助色**: 绿色 (#00ff41) - 黑客风格
- **背景**: 深黑色 (#000000, #0a0a0a)

### 字体
- **标题**: Orbitron (Google Fonts) - 未来感
- **正文**: Courier New / Consolas - 等宽字体

### 动画效果
- 所有动画使用 CSS3 和 JavaScript
- 60fps 流畅动画
- GPU 加速的变换效果

## 🛠️ 技术栈

- **HTML5** - 语义化结构
- **CSS3** - 高级样式和动画
  - CSS Grid & Flexbox
  - CSS Variables
  - Keyframes 动画
  - 渐变和滤镜
- **JavaScript (ES6+)** - 交互效果
  - Canvas API (矩阵雨、粒子系统)
  - Intersection Observer API (滚动动画)
  - RequestAnimationFrame (流畅动画)

## 📱 响应式设计

- ✅ 桌面端优化
- ✅ 平板适配
- ✅ 移动端友好
- ✅ 自适应布局

## 🎯 性能优化

- Canvas 动画优化
- 请求动画帧 (RAF) 使用
- 硬件加速 CSS 属性
- 懒加载动画

## 🌟 特别感谢

设计灵感来自：
- 《攻壳机动队》
- 《银翼杀手》
- Matrix 系列
- 赛博朋克 2077

## 📄 许可证

MIT License - 可自由使用和修改

## 🔧 故障排除

### 动画不流畅？
- 检查浏览器是否支持硬件加速
- 减少粒子数量（编辑 `particles.js` 中的 `particleCount`）

### 字体未加载？
- 确保网络连接正常（使用 Google Fonts）
- 或在本地下载 Orbitron 字体

### 效果太强烈？
- 在 `styles.css` 中降低 `opacity` 值
- 调整发光效果强度（`box-shadow` 值）

---

**享受你的赛博朋克学术主页！** 🚀⚡🎨
