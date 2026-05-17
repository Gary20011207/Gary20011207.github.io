document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const header = document.getElementById("header");
    const navMenu = document.getElementById("nav-menu");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const scrollTopBtn = document.getElementById("scroll-top");
    const themeToggle = document.getElementById("theme-toggle");
    const navLinks = document.querySelectorAll(".nav-menu a");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function preferredTheme() {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark" || savedTheme === "light") {
            return savedTheme;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function setTheme(theme) {
        root.dataset.theme = theme;
        localStorage.setItem("theme", theme);
        if (themeToggle) {
            const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
            themeToggle.setAttribute("aria-label", label);
            themeToggle.setAttribute("title", label);
        }
    }

    setTheme(preferredTheme());

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            setTheme(root.dataset.theme === "dark" ? "light" : "dark");
        });
    }

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("active");
            mobileMenuBtn.classList.toggle("active", isOpen);
            mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            if (!targetId || !targetId.startsWith("#")) {
                return;
            }

            event.preventDefault();
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const top = targetSection.offsetTop - (header?.offsetHeight || 0) + 1;
                window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
            }

            navMenu?.classList.remove("active");
            mobileMenuBtn?.classList.remove("active");
            mobileMenuBtn?.setAttribute("aria-expanded", "false");
        });
    });

    function updateActiveNavLink() {
        const sections = document.querySelectorAll("section[id]");
        const scrollPosition = window.scrollY + (header?.offsetHeight || 0) + 60;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute("id");

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${sectionId}`);
                });
            }
        });
    }

    function handleScroll() {
        header?.classList.toggle("scrolled", window.scrollY > 40);
        scrollTopBtn?.classList.toggle("visible", window.scrollY > 520);
        updateActiveNavLink();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    scrollTopBtn?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });

    const revealElements = document.querySelectorAll(
        ".text-panel, .focus-panel, .focus-item, .experience-card, .education-card, .project-card, .skill-category, .contact-panel, .resume-panel"
    );

    if (!reduceMotion && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-fade-in-up");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealElements.forEach((element, index) => {
            element.classList.add("reveal-ready");
            element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
            revealObserver.observe(element);
        });
    }

    document.querySelectorAll(".stat-number").forEach((stat) => {
        stat.textContent = stat.dataset.value || stat.textContent.trim();
    });

    const canvas = document.getElementById("hero-canvas");
    if (canvas && !reduceMotion) {
        const context = canvas.getContext("2d");
        let width = 0;
        let height = 0;
        let particles = [];
        let codeColumns = [];
        let animationId = 0;
        const codeSnippets = [
            "async def build_service():",
            "retriever.search(query, k=8)",
            "agent.plan(tool_graph)",
            "trace.eval(latency, faithfulness)",
            "config = load_safe_context()",
            "eda_rules.validate(spec)",
            "cuda_stream.synchronize()",
            "pytest tests/ai_workflow",
            "rerank(passages, policy)",
            "guardrails.check(output)",
        ];

        function resizeCanvas() {
            const ratio = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.floor(width * ratio);
            canvas.height = Math.floor(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            particles = Array.from({ length: Math.min(36, Math.max(18, Math.floor(width / 36))) }, (_, index) => ({
                x: (index * 97) % Math.max(width, 1),
                y: (index * 53) % Math.max(height, 1),
                vx: 0.08 + (index % 4) * 0.024,
                vy: 0.05 + (index % 5) * 0.018,
                r: 1 + (index % 3) * 0.36,
            }));
            codeColumns = Array.from({ length: Math.min(18, Math.max(8, Math.floor(width / 92))) }, (_, index) => ({
                x: (index * 173) % Math.max(width, 1),
                offset: (index * 89) % Math.max(height + 160, 1),
                speed: 0.012 + (index % 5) * 0.003,
                stride: 34 + (index % 3) * 7,
            }));
        }

        function themeColor(alpha) {
            const isDark = root.dataset.theme === "dark";
            return isDark ? `rgba(96, 165, 250, ${alpha})` : `rgba(37, 99, 235, ${alpha})`;
        }

        function accentColor(alpha) {
            const isDark = root.dataset.theme === "dark";
            return isDark ? `rgba(251, 191, 36, ${alpha})` : `rgba(217, 119, 6, ${alpha})`;
        }

        function codeColor(alpha) {
            const isDark = root.dataset.theme === "dark";
            return isDark ? `rgba(148, 163, 184, ${alpha})` : `rgba(30, 64, 175, ${alpha})`;
        }

        function drawCodeLayer(time) {
            context.save();
            context.font = "600 11px 'SFMono-Regular', Menlo, Consolas, monospace";
            context.textBaseline = "top";

            codeColumns.forEach((column, columnIndex) => {
                const startY = ((time * column.speed + column.offset) % (height + 180)) - 140;
                for (let row = 0; row < 6; row += 1) {
                    const snippet = codeSnippets[(columnIndex + row * 2) % codeSnippets.length];
                    const y = startY + row * column.stride;
                    const fade = 1 - Math.min(Math.abs(y - height * 0.5) / Math.max(height * 0.65, 1), 1);
                    context.fillStyle = codeColor(0.035 + fade * 0.075);
                    context.fillText(snippet, column.x, y);
                }
            });

            context.restore();
        }

        function drawWaferArcs(time) {
            const centerX = width * 0.72;
            const centerY = height * 0.48;
            const base = Math.min(width, height) * 0.28;
            context.lineWidth = 1;
            for (let i = 0; i < 5; i += 1) {
                context.beginPath();
                context.strokeStyle = i % 2 === 0 ? themeColor(0.09) : accentColor(0.07);
                const radius = base + i * 26;
                const start = 0.35 + Math.sin(time / 1200 + i) * 0.08;
                context.arc(centerX, centerY, radius, start, start + Math.PI * 1.25);
                context.stroke();
            }
        }

        function animate(time) {
            context.clearRect(0, 0, width, height);
            drawCodeLayer(time);
            drawWaferArcs(time);

            particles.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                if (particle.x > width + 20) particle.x = -20;
                if (particle.y > height + 20) particle.y = -20;
            });

            for (let i = 0; i < particles.length; i += 1) {
                for (let j = i + 1; j < particles.length; j += 1) {
                    const a = particles[i];
                    const b = particles[j];
                    const distance = Math.hypot(a.x - b.x, a.y - b.y);
                    if (distance < 122) {
                        context.beginPath();
                        context.strokeStyle = themeColor(0.08 * (1 - distance / 122));
                        context.lineWidth = 1;
                        context.moveTo(a.x, a.y);
                        context.lineTo(b.x, b.y);
                        context.stroke();
                    }
                }
            }

            particles.forEach((particle, index) => {
                context.beginPath();
                context.fillStyle = index % 5 === 0 ? accentColor(0.28) : themeColor(0.32);
                context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
                context.fill();
            });

            animationId = requestAnimationFrame(animate);
        }

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas, { passive: true });
        animationId = requestAnimationFrame(animate);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animationId = requestAnimationFrame(animate);
            }
        });
    }

    console.log(
        "%c Gary Chen Portfolio ",
        "background: linear-gradient(135deg,#2563eb,#0891b2,#d97706); color: white; padding: 8px 12px; border-radius: 6px; font-weight: 700;"
    );
});
