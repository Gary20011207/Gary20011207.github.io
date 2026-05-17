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
        let traceNodes = [];
        let rainColumns = [];
        let animationId = 0;
        const rainTokens = ["0", "1", "AI", "RAG", "SOC", "CUDA", "eval", "idx", "λ", "{", "}", "=>", "fn", "∑"];
        const terminalLines = [
            "$ ai-agent run --tools rag,eval,eda",
            "retriever.topk(query, k=8) -> rerank",
            "guardrails.check(output) :: pass",
            "trace.latency=238ms faithfulness=0.91",
            "cuda_stream.sync() // profile clean",
            "pytest workflows/test_agent_eval.py",
            "vector_db.commit(namespace='public')",
            "human_review.enqueue(spec_diff)",
        ];

        function resizeCanvas() {
            const ratio = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.floor(width * ratio);
            canvas.height = Math.floor(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            traceNodes = Array.from({ length: Math.min(34, Math.max(18, Math.floor(width / 38))) }, (_, index) => ({
                x: (index * 97) % Math.max(width, 1),
                y: (index * 53) % Math.max(height, 1),
                vx: 0.06 + (index % 4) * 0.018,
                vy: 0.04 + (index % 5) * 0.014,
                r: 0.9 + (index % 3) * 0.32,
            }));
            rainColumns = Array.from({ length: Math.min(46, Math.max(18, Math.floor(width / 36))) }, (_, index) => ({
                x: (index * 41 + (index % 4) * 11) % Math.max(width + 80, 1) - 40,
                offset: (index * 113) % Math.max(height + 280, 1),
                speed: 0.045 + (index % 7) * 0.012,
                stride: 18 + (index % 3) * 2,
                length: 8 + (index % 7),
            }));
        }

        function themeColor(alpha, tone = "blue") {
            const isDark = root.dataset.theme === "dark";
            const palettes = {
                blue: isDark ? "96, 165, 250" : "37, 99, 235",
                cyan: isDark ? "34, 211, 238" : "8, 145, 178",
                green: isDark ? "74, 222, 128" : "15, 118, 110",
                amber: isDark ? "251, 191, 36" : "217, 119, 6",
                text: isDark ? "203, 213, 225" : "30, 64, 175",
            };
            return `rgba(${palettes[tone] || palettes.blue}, ${alpha})`;
        }

        function accentColor(alpha) {
            const isDark = root.dataset.theme === "dark";
            return isDark ? `rgba(251, 191, 36, ${alpha})` : `rgba(217, 119, 6, ${alpha})`;
        }

        function drawCodeRain(time) {
            context.save();
            context.font = "700 12px 'SFMono-Regular', Menlo, Consolas, monospace";
            context.textBaseline = "top";
            context.shadowBlur = root.dataset.theme === "dark" ? 8 : 2;

            rainColumns.forEach((column, columnIndex) => {
                const headY = ((time * column.speed + column.offset) % (height + 280)) - 160;
                for (let row = 0; row < column.length; row += 1) {
                    const y = headY - row * column.stride;
                    if (y < -40 || y > height + 40) {
                        continue;
                    }
                    const token = rainTokens[(columnIndex * 3 + row + Math.floor(time / 900)) % rainTokens.length];
                    const fade = Math.max(0, 1 - row / column.length);
                    const tone = row === 0 ? "green" : row % 5 === 0 ? "cyan" : "text";
                    const alpha = (root.dataset.theme === "dark" ? 0.06 : 0.035) + fade * (root.dataset.theme === "dark" ? 0.26 : 0.16);
                    context.shadowColor = themeColor(alpha, tone);
                    context.fillStyle = themeColor(alpha, tone);
                    context.fillText(token, column.x, y);
                }
            });

            context.restore();
        }

        function drawTerminalTraces(time) {
            const panelWidth = Math.min(520, width * 0.52);
            const panelHeight = 178;
            const x = width > 900 ? width * 0.42 : width * 0.08;
            const y = height * 0.13;
            const isDark = root.dataset.theme === "dark";

            context.save();
            context.globalAlpha = isDark ? 0.72 : 0.42;
            context.fillStyle = isDark ? "rgba(2, 6, 23, 0.38)" : "rgba(255, 255, 255, 0.32)";
            context.strokeStyle = themeColor(isDark ? 0.18 : 0.12, "cyan");
            context.lineWidth = 1;
            context.beginPath();
            if (typeof context.roundRect === "function") {
                context.roundRect(x, y, panelWidth, panelHeight, 8);
            } else {
                context.rect(x, y, panelWidth, panelHeight);
            }
            context.fill();
            context.stroke();

            context.font = "650 12px 'SFMono-Regular', Menlo, Consolas, monospace";
            terminalLines.forEach((line, index) => {
                const phase = (Math.sin(time / 950 + index * 0.9) + 1) / 2;
                const alpha = (isDark ? 0.17 : 0.09) + phase * (isDark ? 0.16 : 0.08);
                context.fillStyle = index % 3 === 0 ? themeColor(alpha, "green") : themeColor(alpha, "cyan");
                context.fillText(line, x + 18, y + 24 + index * 19);
            });
            context.restore();
        }

        function drawScanlines() {
            context.save();
            context.strokeStyle = themeColor(root.dataset.theme === "dark" ? 0.035 : 0.025, "cyan");
            context.lineWidth = 1;
            for (let y = 0; y < height; y += 44) {
                context.beginPath();
                context.moveTo(0, y + 0.5);
                context.lineTo(width, y + 0.5);
                context.stroke();
            }
            context.restore();
        }

        function drawWaferArcs(time) {
            const centerX = width * 0.72;
            const centerY = height * 0.48;
            const base = Math.min(width, height) * 0.28;
            context.lineWidth = 1;
            for (let i = 0; i < 5; i += 1) {
                context.beginPath();
                context.strokeStyle = i % 2 === 0 ? themeColor(0.10, "cyan") : accentColor(0.08);
                const radius = base + i * 26;
                const start = 0.35 + Math.sin(time / 1200 + i) * 0.08;
                context.arc(centerX, centerY, radius, start, start + Math.PI * 1.25);
                context.stroke();
            }
        }

        function animate(time) {
            context.clearRect(0, 0, width, height);
            drawScanlines();
            drawCodeRain(time);
            drawTerminalTraces(time);
            drawWaferArcs(time);

            traceNodes.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                if (particle.x > width + 20) particle.x = -20;
                if (particle.y > height + 20) particle.y = -20;
            });

            for (let i = 0; i < traceNodes.length; i += 1) {
                for (let j = i + 1; j < traceNodes.length; j += 1) {
                    const a = traceNodes[i];
                    const b = traceNodes[j];
                    const distance = Math.hypot(a.x - b.x, a.y - b.y);
                    if (distance < 122) {
                        context.beginPath();
                        context.strokeStyle = themeColor(0.08 * (1 - distance / 122), "cyan");
                        context.lineWidth = 1;
                        context.moveTo(a.x, a.y);
                        context.lineTo(b.x, b.y);
                        context.stroke();
                    }
                }
            }

            traceNodes.forEach((particle, index) => {
                context.beginPath();
                context.fillStyle = index % 5 === 0 ? accentColor(0.28) : themeColor(0.34, "green");
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
