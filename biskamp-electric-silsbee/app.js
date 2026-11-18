/* Biskamp Electric Inc. – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && window.matchMedia("(hover: hover)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* reveal on scroll: fade-up, masked hero lines, clip-path photos, scale cards, SVG wire drawing */
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    anims.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { (e.target._anims || [e.target]).forEach(function (x) { x.classList.add("in"); }); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    anims.forEach(function (el) {
      var k = el.getAttribute("data-anim"), t = el;
      if ((k === "line" || k === "clip") && el.parentNode) t = el.parentNode; /* masked/clipped: watch the parent box */
      if (k === "draw") t = el.closest("svg") || el;                  /* SVG path: watch its svg box */
      if (t !== el) { (t._anims = t._anims || []).push(el); }
      io.observe(t);
    });
  }

  /* count-up numbers */
  function runCount(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), from = parseInt(el.getAttribute("data-from") || "0", 10), t0 = Date.now(), dur = 1600;
    (function step() {
      var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (end - from) * e);
      if (p < 1) requestAnimationFrame(step);
    })();
  }
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (el) { co.observe(el); });
  }

  /* shrinking header + photo parallax (one rAF per frame, passive scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var b = el.parentNode.getBoundingClientRect();
      if (b.bottom < 0 || b.top > vh) return;
      var k = parseFloat(el.getAttribute("data-parallax")) || 0, lim = b.height * 0.045;
      el.style.translate = "0 " + Math.max(-lim, Math.min(lim, (b.top + b.height / 2 - vh / 2) * -k)).toFixed(1) + "px";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  if (!reduce && hover) {
    /* cursor spotlight on glass cards */
    $$(".spot").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var b = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - b.left) + "px");
        c.style.setProperty("--my", (e.clientY - b.top) + "px");
      });
    });
    /* hero glow follows the cursor */
    $$(".spot-area").forEach(function (h) {
      var g = $(".hero-glow", h), raf = 0, x = 70, y = 30;
      if (!g) return;
      h.addEventListener("pointermove", function (e) {
        var b = h.getBoundingClientRect();
        x = ((e.clientX - b.left) / b.width) * 100; y = ((e.clientY - b.top) / b.height) * 100;
        if (!raf) raf = requestAnimationFrame(function () { g.style.setProperty("--hx", (x * 0.6 + 20).toFixed(1) + "%"); g.style.setProperty("--hy", (y * 0.6 + 20).toFixed(1) + "%"); raf = 0; });
      });
    });
    /* magnetic call button */
    $$(".magnet").forEach(function (m) {
      m.addEventListener("pointermove", function (e) {
        var b = m.getBoundingClientRect();
        m.style.translate = ((e.clientX - b.left - b.width / 2) * 0.22).toFixed(1) + "px " + ((e.clientY - b.top - b.height / 2) * 0.3).toFixed(1) + "px";
      });
      m.addEventListener("pointerleave", function () { m.style.translate = ""; });
    });
  }

  /* service request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Type of work"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Service request: " + (f.get("service") || "electrical") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from biskampelectric.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
