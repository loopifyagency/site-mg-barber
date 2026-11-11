/* ==========================================================================
   MG Barber — mouvement
   GSAP + ScrollTrigger + Lenis. Les contenus sont visibles par défaut :
   tout état « caché » est posé ici, jamais en CSS, pour que la page reste
   lisible sans JavaScript ou avec prefers-reduced-motion.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ----------------------------------------------------------------------
     Heure de Paris : statut, repère « maintenant », jour du tableau
     ---------------------------------------------------------------------- */
  const OPEN = 9, CLOSE = 19, OPEN_DAYS = [2, 3, 4, 5, 6];
  const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const parisFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function parisNow() {
    const p = {};
    parisFmt.formatToParts(new Date()).forEach((x) => (p[x.type] = x.value));
    let h = parseInt(p.hour, 10);
    if (h === 24) h = 0;
    const m = parseInt(p.minute, 10);
    return { dow: DOW[p.weekday], h, m, t: h + m / 60 };
  }

  function openStatus(n) {
    const isDay = OPEN_DAYS.includes(n.dow);
    if (isDay && n.t >= OPEN && n.t < CLOSE) return { open: true, label: "Ouvert · jusqu'à 19 h" };
    if (isDay && n.t < OPEN) return { open: false, label: "Fermé · ouvre aujourd'hui à 9 h" };
    for (let i = 1; i <= 7; i++) {
      const d = (n.dow + i) % 7;
      if (OPEN_DAYS.includes(d)) {
        return { open: false, label: i === 1 ? "Fermé · ouvre demain à 9 h" : `Fermé · ouvre ${DAYS[d]} à 9 h` };
      }
    }
    return { open: false, label: "Fermé" };
  }

  function tickClock() {
    const n = parisNow();
    const s = openStatus(n);
    const isDay = OPEN_DAYS.includes(n.dow);

    const nowEl = $("#now");
    if (nowEl) {
      const p = isDay ? Math.min(1, Math.max(0, (n.t - OPEN) / (CLOSE - OPEN))) : 0;
      nowEl.style.setProperty("--p", p.toFixed(4));
      nowEl.classList.toggle("is-closed", !s.open);
      const chip = $("#now-time");
      if (chip) chip.textContent = `${String(n.h).padStart(2, "0")}:${String(n.m).padStart(2, "0")}`;
    }

    const heroLabel = $("#now-label");
    if (heroLabel) heroLabel.textContent = s.label;
    $("#hero-status")?.classList.toggle("is-open", s.open);

    const status = $("#status");
    if (status) {
      status.classList.toggle("is-open", s.open);
      $("span", status).textContent = (s.open ? "Ouvert maintenant · jusqu'à 19 h" : s.label);
    }

    $$("#week li").forEach((li) => {
      const today = Number(li.dataset.dow) === n.dow;
      li.classList.toggle("is-today", today);
      const bar = $(".week__bar", li);
      let tick = $(".week__tick", li);
      if (today && bar) {
        if (!tick) { tick = document.createElement("b"); tick.className = "week__tick"; bar.appendChild(tick); }
        tick.style.left = `${(n.t / 24) * 100}%`;
      } else if (tick) tick.remove();
    });
    return n;
  }

  /* ----------------------------------------------------------------------
     Sélecteur de créneau (le rendez-vous se confirme par téléphone)
     ---------------------------------------------------------------------- */
  function setupSlip() {
    const form = $("#slip");
    if (!form) return;
    const when = $("#slip-when"), say = $("#slip-say");
    const days = $$('input[name="jour"]', form), hours = $$('input[name="heure"]', form);

    const update = () => {
      const d = Number(days.find((i) => i.checked)?.value);
      const h = hours.find((i) => i.checked)?.value;
      if (Number.isNaN(d) || !h) return;
      const name = DAYS[d];
      when.textContent = `${name.charAt(0).toUpperCase()}${name.slice(1)}, vers ${h} h`;
      say.textContent = `« Bonjour, je voudrais un rendez-vous ${name} vers ${h} h. »`;
    };
    form.addEventListener("change", update);

    // Valeurs par défaut : aujourd'hui si le salon est encore ouvert, sinon le prochain jour d'ouverture
    const n = parisNow();
    let day = n.dow, hour = 17;
    if (OPEN_DAYS.includes(n.dow) && n.t < 17) hour = Math.min(18, Math.max(10, Math.ceil(n.t) + 1));
    else {
      for (let i = 1; i <= 7; i++) { const d = (n.dow + i) % 7; if (OPEN_DAYS.includes(d)) { day = d; break; } }
    }
    const dIn = days.find((i) => Number(i.value) === day && !i.disabled);
    const hIn = hours.find((i) => Number(i.value) === hour);
    if (dIn) dIn.checked = true;
    if (hIn) hIn.checked = true;
    update();
  }

  /* ----------------------------------------------------------------------
     Découpe du texte en mots / lettres (masque qui monte)
     ---------------------------------------------------------------------- */
  function split(el) {
    if (el.dataset.splitDone) return $$(".c", el);
    const label = el.textContent.replace(/\s+/g, " ").trim();
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
            if (!part) return;
            if (/^[ \t\n\r]+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "w"; w.setAttribute("aria-hidden", "true");
            Array.from(part).forEach((ch) => {
              const c = document.createElement("span");
              c.className = "c"; c.textContent = ch; w.appendChild(c);
            });
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.classList.contains("sr-only")) walk(child);
      });
    };
    walk(el);
    if (!el.hasAttribute("aria-hidden")) el.setAttribute("aria-label", label);
    el.dataset.splitDone = "1";
    return $$(".c", el);
  }

  /* ----------------------------------------------------------------------
     Menu mobile
     ---------------------------------------------------------------------- */
  let lenis = null;
  let menuOpen = false;

  function setupMenu() {
    const burger = $("#burger"), menu = $("#menu"), header = $("#site-header");
    if (!burger || !menu) return;
    const links = $$(".menu__nav a span", menu);

    const toggle = (open) => {
      menuOpen = open;
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      header.classList.toggle("is-menu", open);
      if (open) {
        menu.hidden = false;
        document.body.style.overflow = "hidden";
        lenis?.stop();
        header.classList.remove("is-hidden");
        if (hasGSAP && !reduce) {
          gsap.fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
          gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.06, delay: 0.1 });
          gsap.fromTo(".menu__foot", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, delay: 0.5, ease: "power3.out" });
        }
      } else {
        const done = () => { menu.hidden = true; document.body.style.overflow = ""; lenis?.start(); };
        if (hasGSAP && !reduce) gsap.to(menu, { autoAlpha: 0, duration: 0.3, ease: "power2.in", onComplete: done });
        else done();
      }
    };
    burger.addEventListener("click", () => toggle(!menuOpen));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) { toggle(false); burger.focus(); } });
    $$("a", menu).forEach((a) => a.addEventListener("click", () => menuOpen && toggle(false)));
    matchMedia("(min-width: 960px)").addEventListener("change", (e) => { if (e.matches && menuOpen) toggle(false); });
  }

  /* ----------------------------------------------------------------------
     En-tête, bouton d'appel flottant, repère de lecture (défilement natif)
     ---------------------------------------------------------------------- */
  function setupScrollUI() {
    const header = $("#site-header"), fab = $("#fab"), fill = $(".pole__fill");
    let lastY = window.scrollY, acc = 0, ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy;
      header.classList.toggle("is-solid", y > 60);
      if (!menuOpen) {
        if (acc > 14 && y > 420) header.classList.add("is-hidden");
        else if (acc < -8 || y < 200) header.classList.remove("is-hidden");
      }
      fab?.classList.toggle("is-on", y > window.innerHeight * 0.65 && !menuOpen);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (fill && max > 0) fill.style.transform = `scaleY(${Math.min(1, Math.max(0, y / max)).toFixed(4)})`;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ----------------------------------------------------------------------
     Ancres : défilement doux (Lenis) ou natif
     ---------------------------------------------------------------------- */
  function setupAnchors() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute("href");
      if (hash === "#" || hash.length < 2) return;
      const target = hash === "#top" ? document.body : $(hash);
      if (!target) return;
      e.preventDefault();
      const go = () => {
        if (hash === "#top") lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        else if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
        else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      };
      menuOpen ? setTimeout(go, 350) : go();
      if (hash !== "#top") { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
      history.replaceState(null, "", hash);
    });
  }

  /* ----------------------------------------------------------------------
     Carrousel d'avis
     ---------------------------------------------------------------------- */
  function setupReviews() {
    const section = $("#avis"), stage = $("#rev-stage"), controls = $("#rev-controls");
    if (!section || !stage) return;
    const slides = $$(".review", stage), L = slides.length;
    const bar = $("#rev-bar"), count = $("#rev-count");
    let i = 0, paused = false, inView = false, auto = null;
    const DUR = 10;

    section.classList.add("is-carousel-on");
    stage.classList.add("is-carousel");
    controls.hidden = false;
    slides[0].classList.add("is-active");
    slides.forEach((s, k) => s.setAttribute("aria-hidden", String(k !== 0)));

    const startTimer = () => {
      if (reduce || !hasGSAP || !bar) return;
      auto?.kill();
      auto = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: "none", onComplete: () => go(i + 1, 1) });
      if (paused || !inView) auto.pause();
    };

    function go(n, dir) {
      n = (n + L) % L;
      if (n === i) return;
      const cur = slides[i], next = slides[n];
      i = n;
      count.textContent = `${i + 1} / ${L}`;
      slides.forEach((s, k) => s.setAttribute("aria-hidden", String(k !== i)));
      if (hasGSAP && !reduce) {
        cur.classList.remove("is-active");
        next.classList.add("is-active");
        gsap.to(cur, { xPercent: -5 * dir, autoAlpha: 0, duration: 0.45, ease: "power2.in", overwrite: true });
        gsap.fromTo(next, { xPercent: 5 * dir, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power4.out", overwrite: true });
        gsap.fromTo($$(".review__mark, .review__quote > *, .review__by", next), { y: 26, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: "power3.out", delay: 0.12, overwrite: true });
      } else {
        cur.classList.remove("is-active");
        next.classList.add("is-active");
      }
      startTimer();
    }

    $("#rev-prev").addEventListener("click", () => go(i - 1, -1));
    $("#rev-next").addEventListener("click", () => go(i + 1, 1));

    // glisser pour changer d'avis
    let sx = null;
    stage.addEventListener("pointerdown", (e) => { sx = e.clientX; });
    stage.addEventListener("pointerup", (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
    stage.addEventListener("pointercancel", () => { sx = null; });

    const pause = (v) => { paused = v; if (auto) (paused || !inView) ? auto.pause() : auto.resume(); };
    section.addEventListener("pointerenter", () => pause(true));
    section.addEventListener("pointerleave", () => pause(false));
    section.addEventListener("focusin", () => pause(true));
    section.addEventListener("focusout", () => pause(false));
    document.addEventListener("visibilitychange", () => { if (auto) (document.hidden || paused || !inView) ? auto.pause() : auto.resume(); });
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; if (auto) (paused || !inView) ? auto.pause() : auto.resume(); }, { threshold: 0.35 }).observe(section);

    startTimer();
  }

  /* ----------------------------------------------------------------------
     Sans GSAP / mouvement réduit : tout est déjà lisible
     ---------------------------------------------------------------------- */
  function plain() {
    $("#loader")?.remove();
    root.classList.add("is-ready");
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
  }

  /* ======================================================================
     Animations
     ====================================================================== */
  function animate() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "power3.out" });
    ScrollTrigger.config({ ignoreMobileResize: true });

    /* --- Lenis ---------------------------------------------------------- */
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    const heroTitle = $(".hero__title");
    const titleChars = split(heroTitle);
    $$("[data-split]").forEach(split);
    split($(".foot__big"));

    const mm = gsap.matchMedia();
    const big = "(min-width: 900px) and (min-height: 560px)";
    const small = "(max-width: 899px), (max-height: 559px)";

    const revealHeading = (el, opts = {}) => {
      const chars = $$(".c", el);
      if (!chars.length) return;
      gsap.set(chars, { yPercent: 118 });
      gsap.to(chars, {
        yPercent: 0, duration: 1.1, ease: "power4.out", stagger: { each: 0.022, from: "start" },
        scrollTrigger: { trigger: el, start: opts.start || "top 86%", once: true },
      });
    };
    const revealFade = (el) => {
      gsap.set(el, { autoAlpha: 0, y: 34 });
      gsap.to(el, { autoAlpha: 1, y: 0, duration: 1.1, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    };

    /* === 1. Hero ====================================================== */
    const hero = $(".hero");
    const lines = $$(".ruler li i", hero), nums = $$(".ruler li span", hero);
    gsap.set(titleChars, { yPercent: 118 });
    gsap.set(".hero .curtain", { scaleY: 1 });
    gsap.set(".hero__photo", { y: 70, autoAlpha: 0 });
    gsap.set(".hero__photo img", { scale: 1.35 });
    gsap.set(lines, { scaleX: 0, transformOrigin: "left" });
    gsap.set(nums, { autoAlpha: 0 });
    gsap.set(".now__line", { scaleX: 0 });
    gsap.set(".now__chip", { autoAlpha: 0, scale: 0.6 });
    gsap.set(".bulb", { yPercent: -130 });
    gsap.set([".hero__lede", ".hero__actions .btn", ".hero__side > *"], { autoAlpha: 0, y: 34 });
    gsap.set(".site-header", { autoAlpha: 0 });
    gsap.set(".hero__wall", { scale: 1.12 });

    const bulbs = $$(".bulb");
    const swing = () => bulbs.forEach((b, k) => {
      gsap.fromTo(b, { rotation: -2.4 + k * 0.4 }, { rotation: 2.4 - k * 0.4, duration: 2.6 + k * 0.7, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to($(".bulb__glow", b), { opacity: 0.72, duration: 1.7 + k * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });
    // lent mouvement de caméra sur la photo, une fois l'entrée terminée
    const kenBurns = () => gsap.to(".hero__photo img", { scale: 1.07, duration: 16, ease: "sine.inOut", yoyo: true, repeat: -1 });

    function heroIntro() {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".hero__wall", { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
        .to(".bulb", { yPercent: 0, duration: 1.7, ease: "elastic.out(1, 0.55)", stagger: 0.16 }, 0.1)
        .to(lines, { scaleX: 1, duration: 1.5, stagger: 0.05, ease: "power3.inOut" }, 0.1)
        .to(nums, { autoAlpha: 1, duration: 0.6, stagger: 0.05 }, 0.3)
        .to(titleChars, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.045 }, 0.2)
        .to(".hero__photo", { y: 0, autoAlpha: 1, duration: 1.2 }, 0.45)
        .to(".hero .curtain", { scaleY: 0, duration: 1.3, ease: "power4.inOut" }, 0.55)
        .to(".hero__photo img", { scale: 1, duration: 2.2, ease: "power3.out" }, 0.55)
        .to(".now__line", { scaleX: 1, duration: 1.8, ease: "power3.inOut" }, 0.9)
        .to(".now__chip", { autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(2)" }, 1.1)
        .to([".hero__lede", ".hero__actions .btn", ".hero__side > *"], { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 }, 0.9)
        .to(".site-header", { autoAlpha: 1, duration: 1, ease: "power2.out", clearProps: "opacity,visibility" }, 1.1)
        .add(swing, 0.8)
        .add(kenBurns, 3);
      return tl;
    }

    // Parallaxe multicouche au défilement
    const heroST = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero__wall", { yPercent: 14, ease: "none", scrollTrigger: heroST });
    gsap.to(".bulb--a", { y: -80, ease: "none", scrollTrigger: heroST });
    gsap.to(".bulb--b", { y: -150, ease: "none", scrollTrigger: heroST });
    gsap.to(".bulb--c", { y: -40, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero__title", { yPercent: -9, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero__photo", { yPercent: -26, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero__ruler", { autoAlpha: 0.15, ease: "none", scrollTrigger: heroST });
    gsap.to([".hero__copy", ".hero__side"], { yPercent: -30, autoAlpha: 0, ease: "none", scrollTrigger: { ...heroST, end: "70% top" } });

    // Parallaxe à la souris + lumière qui suit le curseur
    if (finePointer) {
      const lightX = gsap.quickTo(".hero__light", "x", { duration: 1.4, ease: "power3.out" });
      const lightY = gsap.quickTo(".hero__light", "y", { duration: 1.4, ease: "power3.out" });
      gsap.set(".hero__light", { x: innerWidth * 0.55, y: innerHeight * 0.35 });
      const layers = [
        [".hero__wall", 14], [".bulb--a", -18], [".bulb--b", -34], [".bulb--c", -10], [".hero__photo", -22], [".hero__title", 8],
      ].map(([sel, amp]) => ({ amp, set: gsap.quickTo(sel, "x", { duration: 1.2, ease: "power3.out" }) }));
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        lightX(e.clientX - r.left); lightY(e.clientY - r.top);
        const nx = (e.clientX / innerWidth - 0.5) * 2;
        layers.forEach((l) => l.set(nx * l.amp));
      });
    }

    /* === 2. Rubans (vitesse et sens liés au défilement) ================ */
    const ribbons = $$(".ribbon").map((r) => {
      const track = $(".ribbon__track", r);
      const count = track.children.length;
      const base = track.innerHTML;
      track.insertAdjacentHTML("beforeend", base);   // au moins deux jeux pour boucler sans couture
      let copies = 2;
      while (track.scrollWidth < r.offsetWidth * 2.4 && copies < 10) { track.insertAdjacentHTML("beforeend", base); copies++; }
      const measure = () => track.children[count].offsetLeft - track.children[0].offsetLeft;
      return { track, dir: Number(r.dataset.dir) || -1, unit: measure(), measure, x: 0 };
    });
    let scrollVel = 0, scrollDir = 1, dirMul = 1;
    ScrollTrigger.create({ onUpdate: (self) => { scrollVel = self.getVelocity(); scrollDir = self.direction; } });
    gsap.ticker.add((time, dt) => {
      const speed = 60 + Math.min(Math.abs(scrollVel) * 0.32, 900);
      dirMul += ((scrollDir > 0 ? 1 : -1) - dirMul) * 0.06;
      scrollVel *= 0.9;
      ribbons.forEach((r) => {
        r.x += r.dir * dirMul * speed * (dt / 1000);
        const u = r.unit;
        r.x = ((r.x % u) - u) % u;
        r.track.style.transform = `translate3d(${r.x}px,0,0)`;
      });
    });
    window.addEventListener("resize", () => ribbons.forEach((r) => (r.unit = r.measure() || r.unit)));

    /* === 3. Le salon (épinglé sur grand écran) ========================= */
    const story = $("#salon");
    revealHeading($(".story__title"), { start: "top 90%" });
    mm.add(big, () => {
      const stage = $(".story__stage", story), steps = $$(".step", story), dots = $$(".story__dots i", story);
      const N = steps.length;
      story.classList.add("is-pinned");

      const parts = steps.map((s) => ({
        s, fig: $(".step__fig", s), curtain: $(".curtain", s), img: $(".step__fig img", s),
        chars: $$(".step__txt .c", s), p: $(".step__txt p", s), txt: $(".step__txt", s),
      }));
      parts.forEach((o, k) => {
        gsap.set(o.chars, { yPercent: 118 });
        gsap.set(o.p, { autoAlpha: 0, y: 30 });
        gsap.set(o.curtain, { scaleY: 1, transformOrigin: "bottom" });
        gsap.set(o.img, { scale: 1.3 });
        if (k > 0) gsap.set(o.s, { autoAlpha: 0 });
      });
      dots[0]?.classList.add("is-on");

      // le 1er pas se joue à l'arrivée dans la section, avant l'épinglage
      const first = parts[0];
      gsap.timeline({ scrollTrigger: { trigger: story, start: "top 65%", once: true } })
        .to(first.curtain, { scaleY: 0, duration: 1.3, ease: "power4.inOut" }, 0)
        .to(first.chars, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.03 }, 0.15)
        .to(first.p, { autoAlpha: 1, y: 0, duration: 1 }, 0.5);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: story, start: "top top", end: () => `+=${N * 95}%`, pin: stage, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            const k = Math.min(N - 1, Math.floor(self.progress * N * 0.9999));
            dots.forEach((d, j) => d.classList.toggle("is-on", j === k));
          },
        },
      });
      parts.forEach((o, k) => {
        if (k > 0) {
          tl.fromTo(o.s, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, k)
            .to(o.curtain, { scaleY: 0, duration: 0.4, ease: "power3.inOut" }, k)
            .to(o.chars, { yPercent: 0, duration: 0.34, ease: "power3.out", stagger: 0.012 }, k + 0.05)
            .to(o.p, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" }, k + 0.22);
        }
        tl.to(o.img, { scale: 1.04, duration: 1, ease: "none" }, k);
        if (k < N - 1) {
          tl.to(o.txt, { autoAlpha: 0, y: -50, duration: 0.2, ease: "power2.in" }, k + 0.78)
            .set(o.curtain, { transformOrigin: "top" }, k + 0.78)
            .to(o.curtain, { scaleY: 1, duration: 0.2, ease: "power2.in" }, k + 0.78)
            .set(o.s, { autoAlpha: 0 }, k + 1);
        }
      });
      return () => story.classList.remove("is-pinned");
    });
    mm.add(small, () => {
      $$(".step", story).forEach((s) => {
        revealHeading($(".step__txt h3", s));
        revealFade($(".step__txt p", s));
        const cur = $(".curtain", s);
        gsap.set(cur, { scaleY: 1 });
        gsap.to(cur, { scaleY: 0, duration: 1.2, ease: "power4.inOut", scrollTrigger: { trigger: s, start: "top 80%", once: true } });
      });
    });

    /* === 4. Prestations =============================================== */
    revealHeading($("#svc-title"));
    revealFade($(".svc__lead"));
    const cards = $$(".svc__card");
    gsap.set(cards, { autoAlpha: 0, y: 90 });
    gsap.to(cards, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.14, scrollTrigger: { trigger: ".svc__grid", start: "top 82%", once: true } });

    /* === 5. Une visite en cinq temps (défilement horizontal) =========== */
    revealHeading($("#visit-title"), { start: "top 88%" });
    mm.add(big, () => {
      const sec = $("#visite"), track = $(".visit__track", sec), needle = $(".visit__needle", sec);
      sec.classList.add("is-hscroll");
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: sec, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (s) => gsap.set(needle, { scaleX: s.progress }),
        },
      });
      $$(".vstep", sec).forEach((p) => {
        gsap.fromTo($(".vstep__n", p), { x: 90 }, { x: -90, ease: "none", scrollTrigger: { trigger: p, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        gsap.from($$("h3, p", p), { y: 46, autoAlpha: 0, duration: 1, stagger: 0.12, scrollTrigger: { trigger: p, containerAnimation: tween, start: "left 88%", toggleActions: "play none none none" } });
      });
      return () => sec.classList.remove("is-hscroll");
    });
    mm.add(small, () => {
      $$(".vstep").forEach((p, k) => gsap.from(p, { autoAlpha: 0, x: 40, duration: 0.9, delay: k * 0.05, scrollTrigger: { trigger: ".visit__track", start: "top 85%", once: true } }));
    });

    /* === 6. Le compte est bon ========================================= */
    revealHeading($("#ledger-title"));
    const rows = $$(".lrow");
    gsap.set(rows, { autoAlpha: 0, y: 40 });
    gsap.to(rows, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.16, scrollTrigger: { trigger: ".ledger__rows", start: "top 82%", once: true } });
    $$("[data-count]").forEach((el, k) => {
      const end = Number(el.dataset.count), o = { v: 0 };
      el.textContent = "0";
      gsap.to(o, {
        v: end, duration: 1.6 + k * 0.25, ease: "power3.out", delay: k * 0.16,
        scrollTrigger: { trigger: ".ledger__rows", start: "top 82%", once: true },
        onUpdate: () => (el.textContent = String(Math.round(o.v))),
      });
    });
    revealFade($(".ledger__note"));

    /* === 7. Galerie =================================================== */
    revealHeading($("#gal-title"));
    gsap.set($$(".tile .curtain"), { scaleY: 1 });
    $$(".tile").forEach((tile) => {
      gsap.to($(".curtain", tile), { scaleY: 0, duration: 1.4, ease: "power4.inOut", scrollTrigger: { trigger: tile, start: "top 88%", once: true } });
      gsap.fromTo($("img", tile), { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: tile, start: "top bottom", end: "bottom top", scrub: true } });
    });
    mm.add(big, () => {
      $$(".tile").forEach((tile) => gsap.to(tile, { y: Number(tile.dataset.speed) || 0, ease: "none", scrollTrigger: { trigger: ".gallery__grid", start: "top bottom", end: "bottom top", scrub: true } }));
    });

    /* === 8. Avis ====================================================== */
    revealHeading($("#rev-title"));
    revealFade($(".reviews__sub"));
    setupReviews();

    /* === 9. Rendez-vous =============================================== */
    revealHeading($("#book-title"));
    revealFade($(".book__copy p"));
    const slip = $("#slip");
    gsap.set(slip, { autoAlpha: 0, y: 70 });
    gsap.to(slip, { autoAlpha: 1, y: 0, duration: 1.2, scrollTrigger: { trigger: slip, start: "top 85%", once: true } });
    gsap.from($$(".chip", slip), { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.035, scrollTrigger: { trigger: slip, start: "top 80%", once: true } });

    /* === 10. Nous trouver ============================================= */
    revealHeading($("#find-title"));
    const wk = $$("#week li");
    gsap.set(wk, { autoAlpha: 0, x: -30 });
    gsap.to(wk, { autoAlpha: 1, x: 0, duration: 0.9, stagger: 0.07, scrollTrigger: { trigger: "#week", start: "top 85%", once: true } });
    gsap.from($$("#week .week__bar i"), { scaleX: 0, duration: 1.4, stagger: 0.08, ease: "power3.inOut", scrollTrigger: { trigger: "#week", start: "top 85%", once: true } });
    const mapFrame = $(".find__map .octa");
    gsap.set(mapFrame, { autoAlpha: 0, y: 80 });
    gsap.to(mapFrame, { autoAlpha: 1, y: 0, duration: 1.3, scrollTrigger: { trigger: mapFrame, start: "top 88%", once: true } });

    /* === Pied de page ================================================= */
    const fchars = $$(".foot__big .c");
    gsap.set(fchars, { yPercent: 105 });
    gsap.to(fchars, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.05, scrollTrigger: { trigger: ".foot__big", start: "top 92%", once: true } });

    /* === Micro-interactions =========================================== */
    if (finePointer) {
      // cartes inclinables avec reflet qui suit la souris
      $$(".tilt").forEach((el) => {
        const glare = $(".tilt__glare", el);
        gsap.set(el, { transformPerspective: 1000 });
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.7, ease: "power3.out" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.7, ease: "power3.out" });
        const gx = gsap.quickTo(glare, "x", { duration: 0.5, ease: "power3.out" });
        const gy = gsap.quickTo(glare, "y", { duration: 0.5, ease: "power3.out" });
        el.addEventListener("pointerenter", () => el.classList.add("is-hover"));
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
          rx(-py * 9); ry(px * 11);
          gx(px * r.width); gy(py * r.height);
        });
        el.addEventListener("pointerleave", () => { el.classList.remove("is-hover"); rx(0); ry(0); gx(0); gy(0); });
      });

      // boutons magnétiques
      const mags = $$(".btn--magnetic").map((btn) => {
        const inner = $(".btn__in", btn);
        return {
          btn,
          bx: gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3.out" }), by: gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3.out" }),
          ix: gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3.out" }), iy: gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3.out" }),
          on: false,
        };
      });
      window.addEventListener("pointermove", (e) => {
        mags.forEach((m) => {
          const r = m.btn.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const dx = e.clientX - cx, dy = e.clientY - cy;
          const near = Math.abs(dx) < r.width / 2 + 50 && Math.abs(dy) < r.height / 2 + 50;
          if (near) { m.on = true; m.bx(dx * 0.26); m.by(dy * 0.4); m.ix(dx * 0.1); m.iy(dy * 0.18); }
          else if (m.on) { m.on = false; m.bx(0); m.by(0); m.ix(0); m.iy(0); }
        });
      }, { passive: true });
    }

    /* === Chargement + entrée ========================================== */
    const loader = $("#loader");
    const finish = () => { loader?.remove(); lenis?.start(); root.classList.add("is-ready"); ScrollTrigger.refresh(); };
    if (!loader) { heroIntro(); } else {
      lenis?.stop();
      window.scrollTo(0, 0);
      const num = $("#loader-num"), poly = $(".loader__oct polygon"), iris = $(".loader__iris");
      const st = { v: 0 };
      const ltl = gsap.timeline({ onComplete: finish });
      ltl.from(".loader__mg", { yPercent: 70, autoAlpha: 0, duration: 0.9, ease: "power4.out" }, 0)
        .to(poly, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, 0)
        .to(st, { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: () => (num.textContent = String(Math.round(st.v)).padStart(2, "0")) }, 0)
        .to(iris, { scale: 14, duration: 1.05, ease: "expo.in" }, 1.55)
        .to([loader, ".loader__tag"], { color: "#0E0B09", duration: 0.35, ease: "none" }, 2.05)
        .add(heroIntro(), 2.55)
        .to(loader, { yPercent: -100, duration: 1.05, ease: "expo.inOut" }, 2.6);
      // filet de sécurité : jamais d'écran bloqué
      setTimeout(() => { if (document.body.contains(loader)) finish(); }, 9000);
    }

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ----------------------------------------------------------------------
     Démarrage
     ---------------------------------------------------------------------- */
  function boot() {
    tickClock();
    setInterval(tickClock, 30000);
    setupSlip();
    setupMenu();
    setupScrollUI();
    setupAnchors();

    if (!hasGSAP || reduce) {
      plain();
      setupReviews();
      return;
    }
    try {
      animate();
    } catch (err) {
      console.error("[MG Barber] animation désactivée :", err);
      plain();
      $$(".curtain").forEach((c) => (c.style.transform = "scaleY(0)"));
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
