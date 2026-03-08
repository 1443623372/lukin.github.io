// 动态背景实现 (极其细腻的“流光星影”效果)
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height, particles = [];
let time = 0;
const PARTICLE_COUNT = 80; // 增加粒子数量
const CONNECTION_DISTANCE = 200;

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.phase = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.phase += 0.01;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw() {
        const currentAlpha = this.alpha + Math.sin(this.phase) * 0.1;
        const theme = document.documentElement.getAttribute('data-theme');
        const color = theme === 'dark' ? `rgba(255, 255, 255, ${currentAlpha})` : `rgba(0, 122, 255, ${currentAlpha})`;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
}

function drawConnections() {
    const theme = document.documentElement.getAttribute('data-theme');
    const baseColor = theme === 'dark' ? '255, 255, 255' : '0, 122, 255';
    
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONNECTION_DISTANCE) {
                const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.1;
                ctx.strokeStyle = `rgba(${baseColor}, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    time += 0.001;
    ctx.clearRect(0, 0, width, height);
    
    const theme = document.documentElement.getAttribute('data-theme');
    
    // 绘制更加细腻的多重流光
    const centers = [
        { x: width * 0.3 + Math.cos(time) * 100, y: height * 0.3 + Math.sin(time * 0.7) * 100, size: width * 0.6 },
        { x: width * 0.7 + Math.sin(time * 0.8) * 100, y: height * 0.7 + Math.cos(time) * 100, size: width * 0.5 }
    ];

    centers.forEach((c, i) => {
        const gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size);
        if (theme === 'dark') {
            gradient.addColorStop(0, i === 0 ? 'rgba(30, 40, 60, 0.3)' : 'rgba(20, 20, 30, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
            gradient.addColorStop(0, i === 0 ? 'rgba(0, 122, 255, 0.04)' : 'rgba(0, 198, 255, 0.03)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    });

    particles.forEach(p => {
        p.update();
        p.draw();
    });
    drawConnections();
    
    requestAnimationFrame(animate);
}

// 主题切换逻辑
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
};

initTheme();

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// 首页滚动扩散与时间线效果
const spreadLeft = document.querySelector('.spread-left');
const spreadRight = document.querySelector('.spread-right');
const spreadContainer = document.querySelector('.spread-container');
const timelineContainer = document.querySelector('.timeline-container');
const timelineItems = document.querySelectorAll('.timeline-item');

function handleScroll() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    // 首屏扩散效果：控制 spreadContainer 的淡出和位移
    // 逻辑调整：
    // 1. hero-spacer 已移除，时间线现在通过负 margin 向上拉近
    // 2. 这意味着物理距离缩短了，滚动一点点就会遇到时间线
    // 3. 我们需要让扩散动画在更短的距离内完成，比如 30-40vh
    
    const spreadEnd = viewportHeight * 0.4; // 保持 0.4 的淡出行程
    const progress = Math.min(scrollY / spreadEnd, 1);
    
    if (spreadLeft) {
        spreadLeft.style.transform = `translateX(${-progress * 150}%)`;
        spreadLeft.style.opacity = Math.max(0, 1 - (progress * 1.5));
    }
    if (spreadRight) {
        spreadRight.style.transform = `translateX(${progress * 150}%)`;
        spreadRight.style.opacity = Math.max(0, 1 - (progress * 1.5));
    }
    
    if (spreadContainer) {
        const isHidden = progress >= 0.95;
        spreadContainer.style.visibility = isHidden ? 'hidden' : 'visible';
        spreadContainer.style.opacity = Math.max(0, 1 - progress);
        spreadContainer.style.pointerEvents = isHidden ? 'none' : 'auto';
    }

    // 时间线淡入效果
    if (timelineContainer) {
        // 大幅提前淡入时机
        // 由于使用了负 margin，Timeline 物理上已经很近了
        // 我们让它在首屏淡出 20% 时就开始淡入，几乎是“无缝”衔接
        const timelineStart = spreadEnd * 0.2; 
        // 缩短淡入所需的滚动距离，使其更快显示完全
        const timelineProgress = Math.max(0, Math.min((scrollY - timelineStart) / (viewportHeight * 0.3), 1));
        
        timelineContainer.style.opacity = timelineProgress;
        // 减小上浮距离，让归位更迅速
        timelineContainer.style.transform = `translateY(${30 * (1 - timelineProgress)}px)`;
    }

    // 只有当首屏内容彻底淡出后，才允许时间线进入激活逻辑
    const heroAnimationFinished = progress >= 0.9;

    // 时间线节点激活逻辑
    let closestItem = null;
    let minDistance = Infinity;

    // 只有当 hero 动画结束，且时间线容器进入视口后，才开始计算节点
    if (heroAnimationFinished) {
        timelineItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            // 计算 item 中心点
            const itemCenter = rect.top + rect.height / 2;
            // 目标视口中心点，设定在视口中间偏上位置 (40% 高度处)，符合阅读习惯
            const viewportTarget = viewportHeight * 0.4; 
            const distanceToTarget = Math.abs(itemCenter - viewportTarget);
            
            // 只有当节点进入了视口的可视范围（例如 0 到 80% 高度内）才参与计算
            if (rect.top > 0 && rect.bottom < viewportHeight * 0.9) {
                if (distanceToTarget < minDistance) {
                    minDistance = distanceToTarget;
                    closestItem = item;
                }
            }
        });
    }

    timelineItems.forEach(item => {
        // 如果 hero 动画没结束，或者没有找到最近的节点（比如都在视口外），则全部不激活，或者保持第一个激活
        if (!heroAnimationFinished) {
            // Hero 还在显示时，强制重置所有节点状态，或者你可以选择让第一个保持默认状态
             item.classList.remove('active');
             // 如果你希望 timeline 刚出来时第一个就是亮的，可以取消下面这行的注释
             if (item === timelineItems[0]) item.classList.add('active'); 
        } else {
            // 正常逻辑：激活最近的节点
            if (item === closestItem) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
}

// 绑定滚动事件
window.addEventListener('scroll', handleScroll);

// 页面加载和刷新时，立即执行一次 handleScroll 以修正初始状态
// 使用 setTimeout 确保 DOM 布局已就绪（某些浏览器在 restore scroll position 时可能有微小延迟）
window.addEventListener('load', () => {
    handleScroll();
    setTimeout(handleScroll, 100);
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            const offset = targetId === '#home' ? 0 : target.offsetTop;
            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
        }
    });
});

// 照片翻转逻辑
function setupPhotoFlip() {
    const profileCard = document.getElementById('profile-card');
    if (profileCard) {
        const container = profileCard.closest('.profile-card-container');
        if (container) {
            container.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                profileCard.classList.toggle('is-flipped');
            };
        }
    }
}

// 作品集滚动箭头逻辑
function setupPortfolioArrows() {
    const grid = document.getElementById('portfolio-grid');
    const prevBtn = document.getElementById('portfolio-prev');
    const nextBtn = document.getElementById('portfolio-next');

    if (!grid || !prevBtn || !nextBtn) return;

    const scrollAmount = 430; // 400px card + 30px gap

    const updateArrowVisibility = () => {
        const scrollLeft = grid.scrollLeft;
        const maxScroll = grid.scrollWidth - grid.clientWidth;

        // 左侧箭头：只有当向右滚动超过 10px 时才显示
        if (scrollLeft > 10) {
            prevBtn.classList.add('visible');
        } else {
            prevBtn.classList.remove('visible');
        }

        // 右侧箭头：只有当距离最右侧超过 10px 时才显示
        if (scrollLeft < maxScroll - 10) {
            nextBtn.classList.add('visible');
        } else {
            nextBtn.classList.remove('visible');
        }
    };

    prevBtn.addEventListener('click', () => {
        grid.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        grid.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    grid.addEventListener('scroll', updateArrowVisibility);
    
    // 初始化可见性
    updateArrowVisibility();
    
    // 窗口大小变化时重新计算 maxScroll
    window.addEventListener('resize', updateArrowVisibility);
}

// 时间线点击滚动逻辑
timelineItems.forEach(item => {
    item.addEventListener('click', () => {
        const viewportHeight = window.innerHeight;
        const targetOffset = item.offsetTop + timelineContainer.offsetTop - (viewportHeight * 0.35);
        window.scrollTo({
            top: targetOffset,
            behavior: 'smooth'
        });
    });
});

window.addEventListener('resize', init);
init();
animate();
setupPhotoFlip();
setupPortfolioArrows();
