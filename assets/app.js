(() => {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem("dev-theme") || "noir";
  root.dataset.theme = storedTheme;

  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  const themeTrigger = document.querySelector(".theme-trigger");
  const themePanel = document.querySelector(".theme-panel");
  themeTrigger?.addEventListener("click", (event) => {
    event.stopPropagation();
    themePanel.classList.toggle("open");
    themePanel.setAttribute("aria-hidden", String(!themePanel.classList.contains("open")));
  });
  document.querySelectorAll("[data-theme-value]").forEach(button => {
    button.addEventListener("click", () => {
      root.dataset.theme = button.dataset.themeValue;
      localStorage.setItem("dev-theme", button.dataset.themeValue);
      document.querySelectorAll("[data-theme-value]").forEach(option => {
        option.classList.toggle("active", option === button);
      });
      themePanel.classList.remove("open");
    });
  });
  const activeThemeButton = document.querySelector(`[data-theme-value="${storedTheme}"]`);
  activeThemeButton?.classList.add("active");
  document.addEventListener("click", event => {
    if (!themePanel?.contains(event.target)) themePanel?.classList.remove("open");
  });

  const menuTrigger = document.querySelector(".menu-trigger");
  const mobileMenu = document.querySelector(".mobile-menu");
  menuTrigger?.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    menuTrigger.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });

  const header = document.querySelector(".site-header");
  addEventListener("scroll", () => header?.classList.toggle("scrolled", scrollY > 30), { passive: true });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      if (entry.target.querySelector("[data-count]")) animateCounts(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(el);
  });

  function animateCounts(scope) {
    scope.querySelectorAll("[data-count]").forEach(el => {
      const target = Number(el.dataset.count);
      const decimals = String(target).includes(".") ? 2 : 0;
      const start = performance.now();
      const tick = now => {
        const progress = Math.min((now - start) / 1400, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const finePointer = matchMedia("(pointer: fine)").matches;
  let mx = innerWidth / 2, my = innerHeight / 2, dx = mx, dy = my, rx = mx, ry = my;

  if (dot && ring && finePointer) {
    const setCursorTransform = (el, x, y) => {
      el.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    };
    addEventListener("pointermove", event => {
      mx = event.clientX;
      my = event.clientY;
      document.body.classList.remove("cursor-hidden");
    }, { passive: true });
    addEventListener("pointerdown", () => ring.classList.add("press"));
    addEventListener("pointerup", () => ring.classList.remove("press"));
    addEventListener("pointerleave", () => document.body.classList.add("cursor-hidden"));
    addEventListener("pointerenter", () => document.body.classList.remove("cursor-hidden"));

    const followCursor = () => {
      dx += (mx - dx) * .42;
      dy += (my - dy) * .42;
      rx += (mx - rx) * .14;
      ry += (my - ry) * .14;
      setCursorTransform(dot, dx, dy);
      setCursorTransform(ring, rx, ry);
      requestAnimationFrame(followCursor);
    };
    followCursor();

    const hoverTargets = "a,button,.tilt,.magnetic,.theme-panel button,.path-row,.feature-card,.project-card,label,input,textarea,select";
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hover", "press"));
    });
    document.querySelectorAll("p,h1,h2,h3,li,span:not(.cursor-dot):not(.cursor-ring)").forEach(el => {
      el.addEventListener("mouseenter", () => ring.classList.add("text"));
      el.addEventListener("mouseleave", () => ring.classList.remove("text"));
    });
  }

  document.querySelectorAll(".tilt").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener("pointerleave", () => card.style.transform = "");
  });

  document.querySelectorAll(".magnetic").forEach(button => {
    button.addEventListener("pointermove", event => {
      const rect = button.getBoundingClientRect();
      button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px,${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
    });
    button.addEventListener("pointerleave", () => button.style.transform = "");
  });

  const transition = document.querySelector(".page-transition");
  document.querySelectorAll("a[href]").forEach(link => {
    link.addEventListener("click", event => {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || link.target === "_blank" || url.protocol === "mailto:" || url.protocol === "tel:") return;
      event.preventDefault();
      transition.style.transition = "transform .55s cubic-bezier(.76,0,.24,1)";
      transition.style.transform = "translateY(0)";
      setTimeout(() => location.href = link.href, 560);
    });
  });
  addEventListener("pageshow", () => {
    if (!transition) return;
    transition.style.transition = "none";
    transition.style.transform = "translateY(-100%)";
    requestAnimationFrame(() => {
      transition.style.transition = "transform .55s cubic-bezier(.76,0,.24,1)";
      transition.style.transform = "translateY(-100%)";
    });
  });

  const canvas = document.querySelector("#field");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || reduced) return;
  const ctx = canvas.getContext("2d");
  let points = [];
  const resize = () => {
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(65, Math.floor(innerWidth / 22));
    points = Array.from({ length: count }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22 }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const accent = getComputedStyle(root).getPropertyValue("--accent").trim();
    const theme = root.dataset.theme;
    const connectionRange = theme === "airforce" ? 165 : theme === "cyber" ? 95 : theme === "quantum" ? 145 : 125;
    points.forEach((p, i) => {
      const speed = theme === "cyber" ? 1.8 : theme === "quantum" ? 1.35 : .9;
      p.x += p.vx * speed; p.y += p.vy * speed;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      ctx.fillStyle = accent; ctx.globalAlpha = theme === "cyber" ? .55 : .35;
      if (theme === "airforce") {
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.strokeStyle = accent; ctx.stroke();
      } else {
        ctx.fillRect(p.x, p.y, theme === "cyber" ? 2 : 1.4, theme === "cyber" ? 2 : 1.4);
      }
      points.slice(i + 1).forEach(q => {
        const distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (distance < connectionRange) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.globalAlpha = (1 - distance / connectionRange) * (theme === "cyber" ? .2 : .12); ctx.strokeStyle = accent; ctx.stroke();
        }
      });
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  };
  addEventListener("resize", resize); resize(); draw();
})();
