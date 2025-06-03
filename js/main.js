// Main JavaScript functionality with enhanced performance and Apple-style interactions
document.addEventListener('DOMContentLoaded', function() {
    // Performance optimization: use requestAnimationFrame for smooth animations
    let rafId = null;
    let isScrolling = false;
    
    // Navigation functionality
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const sections = document.querySelectorAll('.section, .hero-section');

    // Create parallax background element
    const parallaxBg = document.createElement('div');
    parallaxBg.className = 'parallax-bg';
    parallaxBg.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -2;
        pointer-events: none;
        background: transparent;
    `;
    document.body.appendChild(parallaxBg);
    
    // 确保粒子系统覆盖整个页面
    const particleCanvas = document.getElementById('particles-canvas');
    if (particleCanvas) {
        particleCanvas.style.position = 'fixed';
        particleCanvas.style.top = '0';
        particleCanvas.style.left = '0';
        particleCanvas.style.width = '100%';
        particleCanvas.style.height = '100%';
        particleCanvas.style.zIndex = '-3';
        particleCanvas.style.pointerEvents = 'none';
    }



    // Mobile menu toggle with enhanced animation
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Smooth body scroll lock
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Enhanced smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                
                // 优化跳转速度
                smoothScrollTo(offsetTop, 600);
            }
        });
    });

    // Custom smooth scroll function with Apple-style easing
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Apple-style cubic-bezier easing
            const easeProgress = cubicBezier(0.25, 0.46, 0.45, 0.94, progress);
            
            window.scrollTo(0, startPosition + distance * easeProgress);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Cubic bezier easing function
    function cubicBezier(x1, y1, x2, y2, t) {
        // Approximation of cubic-bezier using polynomial
        const cx = 3 * x1;
        const bx = 3 * (x2 - x1) - cx;
        const ax = 1 - cx - bx;
        
        const cy = 3 * y1;
        const by = 3 * (y2 - y1) - cy;
        const ay = 1 - cy - by;
        
        function bezierX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        
        function bezierY(t) {
            return ((ay * t + by) * t + cy) * t;
        }
        
        // Binary search for t value
        let start = 0, end = 1, mid;
        for (let i = 0; i < 20; i++) {
            mid = (start + end) / 2;
            const x = bezierX(mid);
            if (x < t) start = mid;
            else end = mid;
        }
        
        return bezierY(mid);
    }

    // 智能导航栏控制
    let lastScrollTop = 0;
    let navbarVisible = true;
    
    // Throttled scroll handler for performance
    function handleScroll() {
        if (!isScrolling) {
            requestAnimationFrame(() => {
                updateActiveNavLink();
                updateNavbarBackground();
                updateParallaxEffects();
                handleSmartNavbar(); // 添加智能导航栏处理
                isScrolling = false;
            });
            isScrolling = true;
        }
    }

    // 优化的智能导航栏显示/隐藏逻辑
    function handleSmartNavbar() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDifference = Math.abs(currentScrollTop - lastScrollTop);
        
        // 如果在页面顶部，始终显示导航栏
        if (currentScrollTop <= 50) {
            showNavbar();
            lastScrollTop = currentScrollTop;
            return;
        }
        
        // 只有在滚动距离足够时才触发（避免微小滚动导致频繁切换）
        if (scrollDifference < 8) {
            return;
        }
        
        // 向下滚动且滚动距离超过阈值时隐藏导航栏
        if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
            if (navbarVisible) {
                hideNavbar();
            }
        } 
        // 向上滚动时显示导航栏
        else if (currentScrollTop < lastScrollTop) {
            if (!navbarVisible) {
                showNavbar();
            }
        }
        
        lastScrollTop = currentScrollTop;
    }

    // 显示导航栏 - 使用requestAnimationFrame优化
    function showNavbar() {
        if (!navbarVisible) {
            requestAnimationFrame(() => {
                navbar.style.transform = 'translateY(0)';
                navbar.style.opacity = '1';
            });
            navbarVisible = true;
        }
    }

    // 隐藏导航栏 - 使用requestAnimationFrame优化
    function hideNavbar() {
        if (navbarVisible) {
            requestAnimationFrame(() => {
                navbar.style.transform = 'translateY(-100%)';
                navbar.style.opacity = '0';
            });
            navbarVisible = false;
        }
    }

    // Update active navigation link on scroll
    function updateActiveNavLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Enhanced navbar background on scroll - 优化性能
    let lastBackgroundUpdate = 0;
    function updateNavbarBackground() {
        const now = performance.now();
        if (now - lastBackgroundUpdate < 16) return; // 限制更新频率到60fps
        
        const scrolled = window.scrollY;
        const opacity = Math.min(scrolled / 100, 1);
        
        requestAnimationFrame(() => {
            if (scrolled > 50) {
                navbar.style.background = `rgba(10, 10, 15, ${0.85 + opacity * 0.13})`;
                navbar.style.backdropFilter = 'blur(40px) saturate(150%)';
                navbar.style.borderBottomColor = `rgba(59, 130, 246, ${0.15 + opacity * 0.1})`;
            } else {
                navbar.style.background = 'rgba(10, 10, 15, 0.85)';
                navbar.style.backdropFilter = 'blur(40px) saturate(150%)';
                navbar.style.borderBottomColor = 'rgba(59, 130, 246, 0.15)';
            }
        });
        
        lastBackgroundUpdate = now;
    }

    // Enhanced parallax effects
    function updateParallaxEffects() {
        const scrolled = window.pageYOffset;
        


        // 移除matrix背景视差效果，统一使用粒子系统
    }

    // 移除鼠标轨迹效果，统一使用Canvas粒子系统的鼠标交互
    let mouseX = 0, mouseY = 0;

    // 简化的鼠标位置跟踪
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Throttled parallax background update
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                updateMouseParallax(mouseX, mouseY);
                rafId = null;
            });
        }
    });

    // Enhanced mouse parallax interaction
    function updateMouseParallax(clientX, clientY) {
        const mouseXPercent = (clientX / window.innerWidth) * 100;
        const mouseYPercent = (clientY / window.innerHeight) * 100;
        
        // Update CSS custom properties for background interaction
        document.documentElement.style.setProperty('--mouse-x', mouseXPercent + '%');
        document.documentElement.style.setProperty('--mouse-y', mouseYPercent + '%');
        
        // Enhanced background gradient based on mouse position
        const offsetX = (mouseXPercent - 50) * 0.5;
        const offsetY = (mouseYPercent - 50) * 0.5;
        
        document.body.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
        
        // Update parallax background
        parallaxBg.style.background = `radial-gradient(circle at ${mouseXPercent}% ${mouseYPercent}%, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.04) 40%, transparent 70%)`;
    }

    // 移除旧的DOM粒子系统，统一使用Canvas粒子系统

    // Optimized scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize on page load
    updateActiveNavLink();
    updateNavbarBackground();

    // Enhanced Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) rotate(0deg)';
                entry.target.classList.add('interactive-element');
                
                // Staggered animation for grid items
                const siblings = Array.from(entry.target.parentNode.children);
                const index = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 0.1}s`;
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.about-card, .project-card, .skill-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px) rotate(-2deg)';
        el.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        observer.observe(el);
    });

    // Enhanced hover effects for cards
    const cards = document.querySelectorAll('.about-card, .project-card, .skill-item, .card');
    cards.forEach(card => {
        let hoverTimeout;
        
        card.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            this.style.transform = 'translateY(-12px) scale(1.02) rotate(1deg)';
            this.style.filter = 'brightness(1.1) drop-shadow(0 0 30px rgba(59, 130, 246, 0.4))';
            this.style.zIndex = '10';
        });

        card.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
                this.style.filter = 'none';
                this.style.zIndex = 'auto';
            }, 150);
        });
    });

    // Enhanced button ripple effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 800);
        });
    });

    // Enhanced CSS for effects
    const enhancedStyles = document.createElement('style');
    enhancedStyles.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1) rotate(0deg);
            }
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8) rotate(-5deg);
            }
        }
        
        /* Enhanced performance styles */
        .hero-section, .section {
            transform: translateZ(0);
        }
        
        .mouse-trail, .particle {
            will-change: transform, opacity;
        }
    `;
    document.head.appendChild(enhancedStyles);

    // Keyboard shortcuts with enhanced UX
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

    });

    // Resize handler for responsive optimizations
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate positions and update effects
            updateParallaxEffects();
        }, 250);
    }, { passive: true });

    // Page visibility API for performance
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Pause animations when page is hidden
            document.body.style.animationPlayState = 'paused';
        } else {
            // Resume animations when page is visible
            document.body.style.animationPlayState = 'running';
        }
    });

});