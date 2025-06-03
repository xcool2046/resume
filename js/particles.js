// 高级粒子背景系统
class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouseParticles = [];
        this.mouse = { x: 0, y: 0, pressed: false };
        this.animationId = null;
        this.time = 0;
        
        this.config = {
            particleCount: 120,
            maxDistance: 150,
            mouseTrailLength: 20,
            particleSpeed: 0.8,
            glowIntensity: 0.8,
            connectionOpacity: 0.5
        };
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.8;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(new Particle());
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.addMouseParticle(e.clientX, e.clientY);
        });
        
        document.addEventListener('mousedown', () => {
            this.mouse.pressed = true;
        });
        
        document.addEventListener('mouseup', () => {
            this.mouse.pressed = false;
        });
    }
    
    addMouseParticle(x, y) {
        if (this.mouseParticles.length > this.config.mouseTrailLength) {
            this.mouseParticles.shift();
        }
        
        this.mouseParticles.push(new MouseParticle(x, y));
    }
    
    animate() {
        this.time += 0.01;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新和绘制粒子
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        this.drawMouseTrail();
        this.drawAmbientGlow();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.update(this.time, this.mouse);
        });
        
        this.mouseParticles.forEach((particle, index) => {
            particle.update();
            if (particle.life <= 0) {
                this.mouseParticles.splice(index, 1);
            }
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.maxDistance) {
                    const opacity = (1 - distance / this.config.maxDistance) * this.config.connectionOpacity;
                    
                    this.ctx.save();
                    this.ctx.globalAlpha = opacity;
                    this.ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
        }
    }
    
    drawMouseTrail() {
        this.mouseParticles.forEach((particle, index) => {
            const opacity = particle.life * (index / this.mouseParticles.length);
            particle.draw(this.ctx, opacity);
        });
    }
    
    drawAmbientGlow() {
        // 创建环境光晕效果
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const glowRadius = Math.max(window.innerWidth, window.innerHeight) * 0.6;
        
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, glowRadius
        );
        
        const intensity = (Math.sin(this.time * 2) + 1) * 0.5 * this.config.glowIntensity;
        gradient.addColorStop(0, `rgba(59, 130, 246, ${intensity * 0.1})`);
        gradient.addColorStop(0.3, `rgba(0, 255, 157, ${intensity * 0.05})`);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx.restore();
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas) {
            document.body.removeChild(this.canvas);
        }
    }
}

// 粒子类
class Particle {
    constructor() {
        this.reset();
        this.baseSpeed = this.config.particleSpeed;
        this.phase = Math.random() * Math.PI * 2;
    }
    
    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.color = this.getRandomColor();
        
        this.config = {
            particleSpeed: 0.5,
            mouseInfluence: 100,
            mouseRepulsion: 50
        };
    }
    
    getRandomColor() {
        const colors = [
            'rgba(59, 130, 246, 0.8)',   // 蓝色
            'rgba(0, 255, 157, 0.6)',    // 绿色
            'rgba(147, 51, 234, 0.7)',   // 紫色
            'rgba(255, 255, 255, 0.9)'   // 白色
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(time, mouse) {
        // 基础移动
        this.x += this.vx * this.config.particleSpeed;
        this.y += this.vy * this.config.particleSpeed;
        
        // 边界检测
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
        
        // 鼠标影响
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.mouseInfluence) {
            const force = (this.config.mouseInfluence - distance) / this.config.mouseInfluence;
            this.vx -= (dx / distance) * force * 0.5;
            this.vy -= (dy / distance) * force * 0.5;
        }
        
        // 呼吸效果
        this.opacity = 0.3 + Math.sin(time * 3 + this.phase) * 0.3;
        this.size = 1 + Math.sin(time * 2 + this.phase) * 0.5;
        
        // 速度限制
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 3) {
            this.vx = (this.vx / speed) * 3;
            this.vy = (this.vy / speed) * 3;
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // 创建发光效果
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心亮点
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 鼠标轨迹粒子类
class MouseParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 4 + 2;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.color = 'rgba(59, 130, 246, 1)';
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    draw(ctx, opacity = 1) {
        ctx.save();
        ctx.globalAlpha = this.life * opacity;
        
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 初始化粒子系统
let particleSystem;

document.addEventListener('DOMContentLoaded', () => {
    particleSystem = new ParticleSystem();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (particleSystem) {
        particleSystem.destroy();
    }
});