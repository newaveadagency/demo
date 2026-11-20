/* Eurooptika Kljajić – interakcije (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* 1. zaglavlje se smanjuje */
  var nav = $(".nav");
  function onScroll() { if (nav) nav.classList.toggle("small", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* 2. otkrivanje pri skrolanju (fade, blur-fokus, clip, maska redaka) */
  $$("[data-d]").forEach(function (el) { el.style.setProperty("--d", el.getAttribute("data-d")); });
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    anims.forEach(function (el) { el.classList.add("in"); });
  } else {
    /* retci naslova su u maski (overflow:hidden), pa se promatra njihov omotač */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target.__anim || e.target; t.classList.add("in"); io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    anims.forEach(function (el) {
      if (el.getAttribute("data-anim") === "line" && el.parentNode) { el.parentNode.__anim = el; io.observe(el.parentNode); }
      else io.observe(el);
    });
  }

  /* 3. SVG crtanje vremenske crte */
  $$("[data-tl]").forEach(function (tl) {
    var p = $("path", tl); if (!p) return;
    tl.style.setProperty("--len", "1000");
    if (reduce || !("IntersectionObserver" in window)) { tl.classList.add("in"); return; }
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { tl.classList.add("in"); o.disconnect(); } }); }, { threshold: 0.2 });
    o.observe(tl);
  });

  /* 4. brojači */
  function count(el) {
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0), t0 = null, dur = 1600;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = to; }, dur + 300);
  }
  var counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* 5. paralaksa + optotip koji se izoštrava pri skrolanju */
  var pars = $$("[data-par]"), chart = $("#chart"), ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    pars.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var c = (r.top + r.height / 2 - vh / 2) * +el.getAttribute("data-par");
      el.style.transform = "translate3d(0," + c.toFixed(1) + "px,0)";
    });
    if (chart) {
      var cr = chart.getBoundingClientRect();
      var k = Math.max(0, Math.min(1, (cr.top + cr.height / 2 - vh * 0.45) / (vh * 0.5)));
      chart.style.setProperty("--b", (k * 9).toFixed(2) + "px");
    }
  }
  if (!reduce) {
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  } else if (chart) chart.style.setProperty("--b", "0px");

  /* 6. reflektor koji prati kursor (hero sjaj + staklene kartice) i nagib kartica */
  if (fine && !reduce) {
    $$(".hero, .phero").forEach(function (h) {
      var g = $(".glow", h); if (!g) return;
      h.addEventListener("mousemove", function (e) {
        var r = h.getBoundingClientRect();
        g.style.setProperty("--gx", (e.clientX - r.left) + "px");
        g.style.setProperty("--gy", (e.clientY - r.top) + "px");
      });
    });
    $$(".card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty("--x", x + "px"); c.style.setProperty("--y", y + "px");
        if (c.classList.contains("tilt")) {
          c.style.setProperty("--ry", ((x / r.width - 0.5) * 6).toFixed(2) + "deg");
          c.style.setProperty("--rx", ((0.5 - y / r.height) * 6).toFixed(2) + "deg");
        }
      });
      c.addEventListener("mouseleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
    /* 7. magnetni gumbi */
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
  }

  /* 8. otvoreno / zatvoreno (Europe/Zagreb) + današnji dan u tablici */
  function zg() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), m: (+o.hour % 24) * 60 + +o.minute };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  var now = zg();
  var slots = now.d >= 1 && now.d <= 5 ? [[480, 780], [960, 1200]] : now.d === 6 ? [[480, 780]] : [];
  var isOpen = slots.some(function (s) { return now.m >= s[0] && now.m < s[1]; });
  $$("[data-open]").forEach(function (el) {
    el.classList.toggle("open", isOpen);
    el.textContent = (isOpen ? "Sada otvoreno" : "Trenutno zatvoreno") + " · Tržnica, Karlovac";
  });
  $$(".hours tr[data-days]").forEach(function (tr) {
    if (tr.getAttribute("data-days").split(",").indexOf(String(now.d)) > -1) tr.classList.add("today");
  });

  /* 9. odabir oblika lica (kartice s tipkovnicom) */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function sel(t) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (!k) return; e.preventDefault();
        var n = tabs[(i + k + tabs.length) % tabs.length]; sel(n); n.focus();
      });
    });
  });

  /* 10. aktivna stavka u podizborniku ponude */
  var sub = $$(".subnav a");
  if (sub.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        sub.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sub.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) so.observe(s); });
  }

  /* 11. obrazac -> pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [
        "Ime i prezime: " + (f.get("name") || ""),
        "Telefon: " + (f.get("phone") || ""),
        "Zanima me: " + (f.get("service") || ""),
        "Termin: " + (f.get("when") || "-"),
        "", (f.get("msg") || "")
      ];
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("service") || "Eurooptika") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
