# 📸 图片插入指南

本指南将详细说明如何在赛博朋克学术主页中插入图片。

## 📁 准备工作

### 1. 创建图片文件夹
在项目根目录下创建一个 `images` 文件夹来存放所有图片：

```
OliverZ-dot.github.io/
├── index.html
├── styles.css
├── effects.js
├── particles.js
├── images/          ← 创建这个文件夹
│   ├── profile.jpg
│   ├── about-photo.jpg
│   ├── project1.jpg
│   ├── paper1-thumbnail.jpg
│   └── ...
```

### 2. 图片格式建议
- **格式**: JPG、PNG、WebP
- **头像**: 建议 400x400px 或更大（正方形）
- **项目图片**: 建议 1200x675px（16:9比例）
- **论文配图**: 建议 800x600px 或更大

---

## 🖼️ 插入图片的方法

### 方法一：基本图片插入

最简单的方式，使用 `cyber-image` 类：

```html
<div class="cyber-image">
    <img src="images/your-image.jpg" alt="图片描述">
</div>
```

**效果**: 会有青色边框、发光效果、扫描线动画和悬停特效

---

### 方法二：头像照片（圆形）

在 **About Me（关于我）** 部分插入个人头像：

```html
<div class="cyber-image profile-image" style="float: right; margin: 0 0 20px 20px; max-width: 250px;">
    <img src="images/profile.jpg" alt="Profile Photo">
</div>
```

或者居中显示：

```html
<div class="cyber-image profile-image">
    <img src="images/profile.jpg" alt="Profile Photo">
</div>
```

**位置**: 在 `<!-- 关于我 -->` 部分的 `card-body` 中

---

### 方法三：英雄区域头像

在首页英雄区域添加头像（终端窗口旁边）：

```html
<div class="profile-image cyber-image">
    <img src="images/profile.jpg" alt="Profile Photo">
</div>
```

**位置**: 在终端窗口和数据可视化图表之间

---

### 方法四：项目图片

在研究项目部分插入项目截图：

```html
<div class="cyber-image project-image">
    <img src="images/project1.jpg" alt="Project 1 Screenshot">
</div>
```

**位置**: 在项目标题和描述之间，或者在描述后面

---

### 方法五：论文配图

在论文卡片中插入论文缩略图：

```html
<div class="cyber-image paper-image">
    <img src="images/paper1-thumbnail.jpg" alt="Paper 1 Thumbnail">
</div>
```

**位置**: 在论文信息（标题、作者、期刊）和链接按钮之间

---

### 方法六：图片网格（多图展示）

如果你想在一个区域展示多张图片：

```html
<div class="image-grid">
    <div class="cyber-image">
        <img src="images/image1.jpg" alt="Image 1">
    </div>
    <div class="cyber-image">
        <img src="images/image2.jpg" alt="Image 2">
    </div>
    <div class="cyber-image">
        <img src="images/image3.jpg" alt="Image 3">
    </div>
</div>
```

**效果**: 自动响应式网格布局，每张图片都有赛博朋克效果

---

### 方法七：全息投影效果图片

更高级的全息投影风格：

```html
<div class="cyber-image hologram-image">
    <img src="images/hologram-effect.jpg" alt="Hologram Image">
</div>
```

**效果**: 额外的全息投影光效叠加

---

## 🎨 图片样式类说明

| 类名 | 效果 | 适用场景 |
|------|------|---------|
| `cyber-image` | 基础赛博朋克效果（边框、发光、扫描线） | 所有图片 |
| `profile-image` | 圆形头像（200x200px） | 个人照片 |
| `project-image` | 项目图片样式（最大500px宽） | 项目截图 |
| `paper-image` | 论文配图样式（最大400px宽） | 论文缩略图 |
| `hologram-image` | 全息投影叠加效果 | 特殊展示 |
| `image-grid` | 网格布局容器 | 多图展示 |

---

## 📝 实际操作步骤

### 示例：在 About Me 部分添加头像

1. **准备图片**
   - 将你的照片保存为 `profile.jpg`
   - 放入 `images` 文件夹

2. **编辑 HTML**
   - 打开 `index.html`
   - 找到 `<!-- 关于我 -->` 部分（大约第112行）
   - 找到注释部分：
   ```html
   <!-- 
   <div class="cyber-image profile-image" style="float: right; margin: 0 0 20px 20px; max-width: 250px;">
       <img src="images/about-photo.jpg" alt="About Me">
   </div>
   -->
   ```

3. **取消注释并修改**
   ```html
   <div class="cyber-image profile-image" style="float: right; margin: 0 0 20px 20px; max-width: 250px;">
       <img src="images/profile.jpg" alt="About Me">
   </div>
   ```

4. **保存并刷新**
   - 保存文件
   - 在浏览器中刷新页面查看效果

---

## 🔗 使用外部图片链接

如果你想把图片放在其他地方（如CDN），可以使用完整URL：

```html
<div class="cyber-image">
    <img src="https://example.com/images/photo.jpg" alt="External Image">
</div>
```

---

## 💡 高级技巧

### 1. 自定义图片大小

```html
<div class="cyber-image" style="max-width: 300px; margin: 20px auto;">
    <img src="images/custom.jpg" alt="Custom Size">
</div>
```

### 2. 添加图片标题/说明

```html
<div class="cyber-image" style="position: relative;">
    <img src="images/photo.jpg" alt="Photo">
    <div class="image-caption">这里是图片说明</div>
</div>
```

### 3. 让图片可点击链接

```html
<a href="https://example.com" target="_blank">
    <div class="cyber-image">
        <img src="images/link-image.jpg" alt="Clickable Image">
    </div>
</a>
```

### 4. 响应式图片

```html
<div class="cyber-image" style="width: 100%; max-width: 600px;">
    <img src="images/responsive.jpg" alt="Responsive" style="width: 100%; height: auto;">
</div>
```

---

## ⚠️ 注意事项

1. **图片路径**: 
   - 如果图片在 `images` 文件夹，使用 `images/filename.jpg`
   - 路径区分大小写（特别是在Linux服务器上）

2. **图片大小**:
   - 建议压缩图片以减少加载时间
   - 可以使用 [TinyPNG](https://tinypng.com/) 等工具压缩

3. **alt 属性**:
   - 始终添加有意义的 `alt` 文本
   - 有助于SEO和无障碍访问

4. **文件命名**:
   - 使用小写字母和连字符：`my-photo.jpg`
   - 避免空格和特殊字符

---

## 🎯 快速参考

**最常用的图片插入代码**：

```html
<!-- 圆形头像 -->
<div class="cyber-image profile-image">
    <img src="images/profile.jpg" alt="Profile">
</div>

<!-- 项目图片 -->
<div class="cyber-image project-image">
    <img src="images/project.jpg" alt="Project">
</div>

<!-- 普通图片 -->
<div class="cyber-image">
    <img src="images/photo.jpg" alt="Photo">
</div>
```

---

## 📞 需要帮助？

如果遇到问题：
1. 检查图片路径是否正确
2. 确认图片文件是否存在
3. 查看浏览器控制台是否有错误
4. 确保图片格式被浏览器支持

祝你使用愉快！🎉

