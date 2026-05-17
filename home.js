document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const header = document.getElementById("header");
    const navMenu = document.getElementById("nav-menu");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const scrollTopBtn = document.getElementById("scroll-top");
    const scrollProgress = document.getElementById("scroll-progress");
    const themeToggle = document.getElementById("theme-toggle");
    const navLinks = document.querySelectorAll(".nav-menu a");
    const themeMeta = document.querySelector('meta[name="theme-color"]');
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
        themeMeta?.setAttribute("content", theme === "dark" ? "#070b12" : "#fbfcff");
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

    function closeMobileMenu() {
        navMenu?.classList.remove("active");
        mobileMenuBtn?.classList.remove("active");
        mobileMenuBtn?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
    }

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = navMenu.classList.toggle("active");
            mobileMenuBtn.classList.toggle("active", isOpen);
            mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
            document.body.classList.toggle("nav-open", isOpen);
        });

        document.addEventListener("click", (event) => {
            if (!navMenu.classList.contains("active")) {
                return;
            }
            const target = event.target;
            if (target instanceof Node && !navMenu.contains(target) && !mobileMenuBtn.contains(target)) {
                closeMobileMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMobileMenu();
            }
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

            closeMobileMenu();
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
        const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
        scrollProgress?.style.setProperty("--scroll-progress", progress.toFixed(4));
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
        let codeRows = [];
        let animationId = 0;
        const codeTags = ["rag", "agent", "eval", "cuda", "eda", "safe", "trace", "rank", "acl", "topK"];
        const codeSnippets = [
            "async function buildAgentService(ctx) { return await planner.run(ctx); }",
            "const hits = await retriever.search(query, { topK: 8, acl: 'scoped' });",
            "answer = rag.generate(query, sources=rerank(hits), cite=True)",
            "if (!guardrails.pass(answer)) throw new EvalError('human_review');",
            "trace.span('eda.rules.validate').set({ latency_ms: 238, p95: 410 });",
            "cudaStream.synchronize(); profiler.kernel('attention_fused');",
            "pytest tests/workflows/test_agent_eval.py --maxfail=1 -q",
            "vectorDb.commit({ namespace: 'public', policy: 'least-privilege' });",
            "const spec = await tools.eda.emitYaml(layoutPattern, constraints);",
            "ranker.score(passages).filter((p) => p.access === 'approved');",
            "for await (const chunk of llm.stream(prompt)) renderToken(chunk);",
            "assert privacy.boundary === 'institutional';",
            "docker compose up ai-service --profile internal --detach",
            "agent.plan(task).use(['search', 'lint', 'eval', 'review']);",
            "metrics.observe({ usefulness, faithfulness, latency, safety });",
            "loraAdapter.load('workflow-policy').merge({ dtype: 'bf16' });",
        ];

        function resizeCanvas() {
            const ratio = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.floor(width * ratio);
            canvas.height = Math.floor(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            codeRows = Array.from({ length: Math.min(32, Math.max(18, Math.floor(height / 26))) }, (_, index) => ({
                x: 36 + (index % 4) * 22,
                y: 74 + index * 24,
                indent: " ".repeat((index % 5) * 2),
                phase: index * 13,
                speed: 16 + (index % 6) * 2.6,
                hold: 16 + (index % 4) * 7,
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

        function drawCodeRows(time) {
            const isDark = root.dataset.theme === "dark";
            context.save();
            context.font = "650 12px 'SFMono-Regular', Menlo, Consolas, monospace";
            context.textBaseline = "top";
            context.shadowBlur = isDark ? 9 : 1.8;

            codeRows.forEach((row, index) => {
                const lineNumber = String(index + 1).padStart(2, "0");
                const tag = codeTags[(index * 3 + Math.floor(time / 2400)) % codeTags.length];
                const code = `${row.indent}${codeSnippets[row.snippetIndex]}    // ${tag}`;
                const x = row.x;
                const y = row.y;
                const verticalFade = 1 - Math.min(Math.abs(y - height * 0.52) / Math.max(height * 0.72, 1), 1);
                const cycle = code.length + row.hold;
                const progress = ((time / 1000) * row.speed + row.phase) % cycle;
                const visibleChars = Math.min(code.length, Math.floor(progress));
                const typed = code.slice(0, visibleChars);
                const baseWidth = 34;
                const gutterAlpha = (isDark ? 0.18 : 0.10) + verticalFade * (isDark ? 0.10 : 0.06);
                const activeAlpha = (isDark ? 0.25 : 0.15) + verticalFade * (isDark ? 0.30 : 0.18);

                context.shadowColor = "transparent";
                context.fillStyle = themeColor(gutterAlpha, "text");
                context.fillText(lineNumber, x, y);

                if (visibleChars <= 0) {
                    return;
                }

                const cursorX = x + baseWidth + context.measureText(typed).width + 4;
                const tone = index % 4 === 0 ? "green" : index % 3 === 0 ? "cyan" : "text";

                context.shadowColor = themeColor(activeAlpha, tone);
                context.fillStyle = themeColor(activeAlpha, tone);
                context.fillText(typed, x + baseWidth, y);

                context.strokeStyle = themeColor(isDark ? 0.28 : 0.16, "green");
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(x + baseWidth, y + 17.5);
                context.lineTo(cursorX, y + 17.5);
                context.stroke();

                if (progress < code.length || Math.floor(time / 420 + index) % 2 === 0) {
                    context.fillStyle = themeColor(isDark ? 0.72 : 0.42, "green");
                    context.fillRect(cursorX, y + 1, 2, 13);
                }
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
