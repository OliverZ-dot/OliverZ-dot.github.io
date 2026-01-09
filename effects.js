// ============================================
// 赛博朋克特效脚本
// ============================================

// 打字机效果
class TypeWriter {
    constructor(element, texts, options = {}) {
        this.element = element;
        this.texts = texts;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.speed = options.speed || 100;
        this.deleteSpeed = options.deleteSpeed || 50;
        this.pauseTime = options.pauseTime || 2000;
        
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
            var typeSpeed = this.deleteSpeed;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
            var typeSpeed = this.speed;
        }
        
        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// 矩阵雨效果
class MatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        this.matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
        this.matrixArray = this.matrix.split("");
        
        this.fontSize = 14;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        
        for (let x = 0; x < this.columns; x++) {
            this.drops[x] = Math.random() * -100;
        }
        
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
    }
    
    draw() {
        // 淡入效果
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置字体和颜色
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = this.fontSize + 'px monospace';
        
        // 绘制字符
        for (let i = 0; i < this.drops.length; i++) {
            const text = this.matrixArray[Math.floor(Math.random() * this.matrixArray.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            // 渐变效果
            const opacity = Math.min(1, (this.canvas.height - y) / 200);
            this.ctx.fillStyle = `rgba(0, 255, 65, ${opacity})`;
            
            this.ctx.fillText(text, x, y);
            
            // 重置drop
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            
            this.drops[i]++;
        }
    }
    
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 鼠标跟随效果
class CursorTrail {
    constructor() {
        this.cursor = document.querySelector('.cursor-trail');
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        document.addEventListener('mousemove', (e) => {
            this.targetX = e.clientX;
            this.targetY = e.clientY;
        });
        
        this.animate();
    }
    
    animate() {
        this.x += (this.targetX - this.x) * 0.1;
        this.y += (this.targetY - this.y) * 0.1;
        
        this.cursor.style.left = this.x - 10 + 'px';
        this.cursor.style.top = this.y - 10 + 'px';
        this.cursor.style.opacity = '1';
        
        requestAnimationFrame(() => this.animate());
    }
}

// 系统时间更新
function updateSystemTime() {
    const timeElement = document.getElementById('system-time');
    if (timeElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 导航栏高亮
function initNavHighlight() {
    const sections = document.querySelectorAll('.section, .hero-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// 卡片进入动画
function initCardAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.cyber-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'opacity 0.6s, transform 0.6s';
        observer.observe(card);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 打字机效果
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        new TypeWriter(typewriterElement, [
            '研究员 | 开发者 | 探索者',
            'Student | Researcher | Innovator',
            '探索未知 | 创造未来',
            'Hacker | Researcher | Creator'
        ], {
            speed: 100,
            deleteSpeed: 50,
            pauseTime: 2000
        });
    }
    
    // 矩阵雨
    new MatrixRain('matrix-canvas');
    
    // 鼠标跟随
    new CursorTrail();
    
    // 系统时间
    updateSystemTime();
    setInterval(updateSystemTime, 1000);
    
    // 平滑滚动
    initSmoothScroll();
    
    // 导航高亮
    initNavHighlight();
    
    // 卡片动画
    initCardAnimations();
    
    // 添加故障效果触发
    document.querySelectorAll('.glitch-text').forEach(element => {
        setInterval(() => {
            element.classList.add('glitch-active');
            setTimeout(() => {
                element.classList.remove('glitch-active');
            }, 200);
        }, 5000);
    });
    
    console.log('%c⚡ CYBERPUNK SYSTEM ONLINE ⚡', 'color: #00ffff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00ffff;');
    console.log('%c欢迎来到赛博朋克学术主页！', 'color: #00ff41; font-size: 14px;');
});

