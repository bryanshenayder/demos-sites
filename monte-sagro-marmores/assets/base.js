/* Base compartilhada: rolagem suave, animações, menu, galeria, slider, contadores.
   Depende de gsap.min.js, ScrollTrigger.min.js e lenis.min.js (servidos localmente). */
(function () {
  const semMov = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const temGsap = typeof gsap !== "undefined";
  if (temGsap && typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  /* ---------- imagens: fallback elegante se a foto não carregar ---------- */
  $$("img[data-fb]").forEach((img) => {
    const falha = () => {
      const d = document.createElement("div");
      d.className = "img-fb " + (img.className || "");
      d.setAttribute("role", "img");
      d.setAttribute("aria-label", img.alt || "");
      d.dataset.label = img.dataset.fb;
      img.replaceWith(d);
    };
    if (img.complete && img.naturalWidth === 0) falha();
    else img.addEventListener("error", falha, { once: true });
  });

  /* ---------- rolagem suave ---------- */
  let lenis = null;
  if (!semMov && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
    if (temGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  window.__lenis = lenis;
  const irPara = (alvo) => {
    const el = typeof alvo === "string" ? $(alvo) : alvo;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -76 });
    else el.scrollIntoView({ behavior: semMov ? "auto" : "smooth" });
  };
  window.__irPara = irPara;
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2 || !$(id)) return;
    e.preventDefault();
    document.body.classList.remove("menu-aberto");
    irPara(id);
    history.replaceState(null, "", id);
  });

  /* ---------- abertura ---------- */
  const loader = $("#loader");
  const fimLoader = () => {
    if (!loader || loader.dataset.fim) return;
    loader.dataset.fim = 1;
    document.documentElement.classList.add("carregado");
    if (temGsap && !semMov) {
      gsap.to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut", onComplete: () => loader.remove() });
    } else loader.remove();
    abrirHero();
  };
  if (loader) {
    if (sessionStorage.getItem("visto") || semMov) { loader.remove(); document.documentElement.classList.add("carregado"); }
    else {
      sessionStorage.setItem("visto", 1);
      window.addEventListener("load", () => setTimeout(fimLoader, 650));
      setTimeout(fimLoader, 2200);
    }
  }

  /* ---------- títulos que sobem palavra por palavra ---------- */
  $$("[data-split]").forEach((el) => {
    const partes = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((w) => partes.push(w));
      else partes.push(n.outerHTML);
    });
    el.innerHTML = partes.map((w) => (/^\s+$/.test(w) || w === "" ? w : w.startsWith("<br") ? w : `<span class="pal"><span>${w}</span></span>`)).join("");
  });

  function abrirHero() {
    if (!temGsap || semMov) return;
    const h = $("[data-hero]");
    if (!h) return;
    gsap.from($$("[data-split] .pal > span", h), { yPercent: 115, duration: 1.1, ease: "power4.out", stagger: 0.06, delay: 0.05 });
    gsap.from($$("[data-hero-fade]", h), { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.45 });
    const img = $("[data-hero-img]", h);
    if (img) gsap.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 2.4, ease: "power2.out" });
  }
  if (!loader || document.documentElement.classList.contains("carregado")) requestAnimationFrame(abrirHero);

  if (temGsap && !semMov) {
    $$("[data-split]").forEach((el) => {
      if (el.closest("[data-hero]")) return;
      gsap.from($$(".pal > span", el), { yPercent: 115, duration: 1, ease: "power4.out", stagger: 0.045, scrollTrigger: { trigger: el, start: "top 86%" } });
    });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      onEnter: (els) => gsap.fromTo(els, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.08, overwrite: true }),
    });
    gsap.set("[data-reveal]", { opacity: 0 });
    $$("[data-parallax]").forEach((el) => {
      const v = parseFloat(el.dataset.parallax) || 12;
      gsap.fromTo(el, { yPercent: -v }, { yPercent: v, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-count]").forEach((el) => {
      const fim = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length;
      const o = { v: 0 };
      gsap.to(o, { v: fim, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => (el.textContent = o.v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec })) });
    });
  }

  /* ---------- topo ---------- */
  const topo = $(".topo");
  let ultimo = 0;
  const aoRolar = () => {
    const y = window.scrollY;
    if (topo) {
      topo.classList.toggle("rolou", y > 30);
      topo.classList.toggle("some", y > 500 && y > ultimo && !document.body.classList.contains("menu-aberto"));
    }
    ultimo = y;
  };
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();
  const btnMenu = $(".btn-menu");
  if (btnMenu) btnMenu.addEventListener("click", () => {
    const ab = document.body.classList.toggle("menu-aberto");
    btnMenu.setAttribute("aria-expanded", ab);
    if (lenis) ab ? lenis.stop() : lenis.start();
  });

  /* ---------- faixa rolando: duplica o conteúdo ---------- */
  $$("[data-marquee]").forEach((t) => { t.innerHTML += t.innerHTML; });

  /* ---------- antes e depois ---------- */
  $$("[data-compare]").forEach((cmp) => {
    let pos = 50, arr = false, demo;
    const set = (v) => { pos = Math.max(0, Math.min(100, v)); cmp.style.setProperty("--p", pos + "%"); cmp.setAttribute("aria-valuenow", Math.round(pos)); };
    const mao = (x) => { const r = cmp.getBoundingClientRect(); set(((x - r.left) / r.width) * 100); };
    cmp.addEventListener("pointerdown", (e) => { if (e.button !== 0) return; cancelAnimationFrame(demo); arr = true; cmp.classList.add("press"); cmp.setPointerCapture(e.pointerId); mao(e.clientX); });
    cmp.addEventListener("pointermove", (e) => arr && mao(e.clientX));
    ["pointerup", "pointercancel"].forEach((t) => cmp.addEventListener(t, () => { arr = false; cmp.classList.remove("press"); }));
    cmp.addEventListener("keydown", (e) => {
      const m = { ArrowLeft: -2, ArrowRight: 2, PageDown: -10, PageUp: 10 };
      if (e.key in m) { e.preventDefault(); cancelAnimationFrame(demo); set(pos + m[e.key]); }
      else if (e.key === "Home") set(0); else if (e.key === "End") set(100);
    });
    set(50);
    if (!semMov) new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting) return; o.disconnect();
      const t0 = performance.now() + 300, d = 1800;
      const p = (t) => { const k = Math.max(0, Math.min(1, (t - t0) / d)); const e = k < 0.55 ? k / 0.55 : (1 - k) / 0.45; set(50 + 26 * (1 - Math.pow(1 - e, 3))); if (k < 1 && !arr) demo = requestAnimationFrame(p); };
      demo = requestAnimationFrame(p);
    }, { threshold: 0.55 }).observe(cmp);
  });

  /* ---------- galeria: filtros e tela cheia ---------- */
  $$("[data-filtros]").forEach((g) => {
    const alvo = $(g.dataset.filtros);
    g.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-f]"); if (!b) return;
      $$("button", g).forEach((x) => x.setAttribute("aria-pressed", x === b));
      const f = b.dataset.f;
      $$("[data-cat]", alvo).forEach((it) => {
        const mostra = f === "todos" || it.dataset.cat.split(" ").includes(f);
        it.hidden = !mostra;
      });
      if (temGsap && !semMov) gsap.fromTo($$("[data-cat]:not([hidden])", alvo), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 });
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    });
  });
  const lb = document.createElement("div");
  lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Foto ampliada");
  lb.innerHTML = '<button class="lb-x" aria-label="Fechar">×</button><button class="lb-a" aria-label="Anterior">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-p" aria-label="Próxima">›</button>';
  document.body.appendChild(lb);
  let grupo = [], idx = 0, origem = null;
  const mostra = () => { const it = grupo[idx]; const img = $("img", it); $("img", lb).src = it.dataset.full || (img && img.src) || ""; $("img", lb).alt = img ? img.alt : ""; $("figcaption", lb).textContent = it.dataset.legenda || (img ? img.alt : ""); };
  const fecha = () => { lb.classList.remove("on"); if (lenis) lenis.start(); origem && origem.focus(); };
  document.addEventListener("click", (e) => {
    const it = e.target.closest("[data-lb]"); if (!it || !$("img", it)) return;
    e.preventDefault(); origem = it;
    grupo = $$(`[data-lb="${it.dataset.lb}"]:not([hidden])`).filter((x) => $("img", x)); idx = grupo.indexOf(it);
    mostra(); lb.classList.add("on"); if (lenis) lenis.stop(); $(".lb-x", lb).focus();
  });
  $(".lb-x", lb).onclick = fecha;
  $(".lb-a", lb).onclick = () => { idx = (idx - 1 + grupo.length) % grupo.length; mostra(); };
  $(".lb-p", lb).onclick = () => { idx = (idx + 1) % grupo.length; mostra(); };
  lb.addEventListener("click", (e) => { if (e.target === lb) fecha(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("on")) return;
    if (e.key === "Escape") fecha(); if (e.key === "ArrowRight") $(".lb-p", lb).click(); if (e.key === "ArrowLeft") $(".lb-a", lb).click();
  });

  /* ---------- ano no rodapé ---------- */
  $$("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));
  window.addEventListener("load", () => typeof ScrollTrigger !== "undefined" && ScrollTrigger.refresh());
})();
