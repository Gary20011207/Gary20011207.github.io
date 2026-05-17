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
        let rainColumns = [];
        let codeRows = [];
        let animationId = 0;
        const rainTokens = [
            "0", "1", "AI", "LLM", "RAG", "SOC", "EDA", "GPU", "CUDA", "eval", "idx", "fn",
            "{", "}", "[]", "::", "=>", "k=8", "p95", "0x7f", "rank", "safe", "trace", "agent",
        ];
        const codeSnippets = [
            "$ ai-agent run --tools rag,eval,eda --guarded",
            "retriever.topk(query, k=8).then(rerank.cross_encoder)",
            "guardrails.check(output).require(source_trace=True)",
            "trace.log({latency_ms:238, faithfulness:0.91})",
            "cuda_stream.synchronize(); profile.bank_conflicts()",
            "pytest workflows/test_agent_eval.py -q",
            "vector_db.commit(namespace='public', acl='scoped')",
            "human_review.enqueue(spec_diff, risk='medium')",
            "eda_rules.validate(layout_pattern).emit_yaml()",
            "agent.plan(task).use(['search', 'lint', 'eval'])",
            "docker compose up ai-service --profile internal",
            "fl_server.start(rounds=20, privacy='institutional')",
        ];

        function resizeCanvas() {
            const ratio = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.floor(width * ratio);
            canvas.height = Math.floor(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            rainColumns = Array.from({ length: Math.min(94, Math.max(42, Math.floor(width / 16))) }, (_, index) => ({
                x: (index * 23 + (index % 7) * 13) % Math.max(width + 120, 1) - 60,
                offset: (index * 89) % Math.max(height + 420, 1),
                speed: 0.07 + (index % 9) * 0.018,
                stride: 16 + (index % 4) * 3,
                length: 12 + (index % 11),
                phase: index % rainTokens.length,
            }));
            codeRows = Array.from({ length: Math.min(28, Math.max(14, Math.floor(height / 30))) }, (_, index) => ({
                y: 74 + index * 32 + (index % 3) * 5,
                offset: (index * 167) % Math.max(width + 900, 1),
                speed: 0.018 + (index % 5) * 0.006,
                direction: index % 2 === 0 ? 1 : -1,
                snippetIndex: index % codeSnippets.length,
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

        function drawCodeRain(time) {
            context.save();
            context.font = "700 12px 'SFMono-Regular', Menlo, Consolas, monospace";
            context.textBaseline = "top";
            context.shadowBlur = root.dataset.theme === "dark" ? 7 : 1.5;

            rainColumns.forEach((column, columnIndex) => {
                const headY = ((time * column.speed + column.offset) % (height + 420)) - 220;
                for (let row = 0; row < column.length; row += 1) {
                    const y = headY - row * column.stride;
                    if (y < -40 || y > height + 40) {
                        continue;
                    }
                    const token = rainTokens[(column.phase + columnIndex * 2 + row + Math.floor(time / 760)) % rainTokens.length];
                    const fade = Math.max(0, 1 - row / column.length);
                    const tone = row === 0 ? "green" : row % 4 === 0 ? "cyan" : "text";
                    const alpha = (root.dataset.theme === "dark" ? 0.075 : 0.045) + fade * (root.dataset.theme === "dark" ? 0.34 : 0.22);
                    context.shadowColor = themeColor(alpha, tone);
                    context.fillStyle = themeColor(alpha, tone);
                    context.fillText(token, column.x, y);
                }
            });

            context.restore();
        }

        function drawCodeRows(time) {
            const isDark = root.dataset.theme === "dark";
            context.save();
            context.font = "650 12px 'SFMono-Regular', Menlo, Consolas, monospace";
            context.textBaseline = "top";

            codeRows.forEach((row, index) => {
                const snippet = codeSnippets[row.snippetIndex];
                const repeated = `${snippet}   // ${rainTokens[(index * 5 + Math.floor(time / 1100)) % rainTokens.length]}   `;
                const textWidth = context.measureText(repeated).width || 520;
                const travel = width + textWidth * 2;
                const raw = (row.offset + time * row.speed * 1000) % travel;
                const x = row.direction > 0 ? raw - textWidth : width - raw;
                const pulse = (Math.sin(time / 850 + index) + 1) / 2;
                const alpha = (isDark ? 0.08 : 0.045) + pulse * (isDark ? 0.15 : 0.08);
                context.fillStyle = index % 3 === 0 ? themeColor(alpha, "green") : themeColor(alpha, "cyan");
                context.fillText(repeated, x, row.y);
                context.fillText(repeated, x + textWidth + 40, row.y);
                context.fillText(repeated, x - textWidth - 40, row.y);
            });
            context.restore();
        }

        function drawScanlines() {
            context.save();
            context.strokeStyle = themeColor(root.dataset.theme === "dark" ? 0.05 : 0.03, "cyan");
            context.lineWidth = 1;
            for (let y = 0; y < height; y += 32) {
                context.beginPath();
                context.moveTo(0, y + 0.5);
                context.lineTo(width, y + 0.5);
                context.stroke();
            }
            context.restore();
        }

        function animate(time) {
            context.clearRect(0, 0, width, height);
            drawScanlines();
            drawCodeRows(time);
            drawCodeRain(time);

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
