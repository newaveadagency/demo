/* Elwood's Tree Service – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
    });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* reveal on scroll: fade-up, clip-path pop, masked hero lines, SVG timeline drawing */
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    anims.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { (e.target._anim || e.target).classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    anims.forEach(function (el) {
      var kind = el.getAttribute("data-anim"), t = el;
      if (kind === "line" && el.parentNode) t = el.parentNode;        /* masked lines: watch the clipping parent */
      if (kind === "draw") t = el.closest(".tl") || el;               /* timeline path: watch the timeline */
      if (t !== el) t._anim = el;
      io.observe(t);
    });
  }

  /* count-up numbers (years count up from a nearby start) */
  function runCount(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), start = end > 1000 ? end - 60 : 0, t0 = Date.now(), dur = 1600;
    (function step() {
      var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) setTimeout(step, 30);
    })();
  }
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (el) { co.observe(el); });
  }

  /* shrinking header + hero parallax (one rAF per frame, passive scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      if (y > window.innerHeight * 1.2) return;
      el.style.translate = "0 " + (y * (parseFloat(el.getAttribute("data-parallax")) || 0)).toFixed(1) + "px";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  if (!reduce && hover) {
    /* service index: photo follows the cursor */
    var peek = $(".idx-peek"), pimg = peek && $("img", peek), px = 0, py = 0, cx = 0, cy = 0, raf = null;
    if (peek) {
      var loop = function () {
        cx += (px - cx) * 0.18; cy += (py - cy) * 0.18;
        peek.style.transform = "translate(" + (cx + 24).toFixed(1) + "px," + (cy - 110).toFixed(1) + "px) rotate(" + ((px - cx) * 0.04).toFixed(2) + "deg)";
        raf = Math.abs(px - cx) + Math.abs(py - cy) > 0.5 ? requestAnimationFrame(loop) : null;
      };
      $$(".idx a").forEach(function (a) {
        a.addEventListener("mouseenter", function () { pimg.src = a.getAttribute("data-img"); peek.classList.add("show"); });
        a.addEventListener("mouseleave", function () { peek.classList.remove("show"); });
        a.addEventListener("mousemove", function (e) { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
      });
    }
    /* magnetic call button */
    $$(".magnet").forEach(function (m) {
      m.addEventListener("mousemove", function (e) {
        var b = m.getBoundingClientRect();
        m.style.translate = ((e.clientX - b.left - b.width / 2) * 0.25).toFixed(1) + "px " + ((e.clientY - b.top - b.height / 2) * 0.35).toFixed(1) + "px";
      });
      m.addEventListener("mouseleave", function () { m.style.translate = ""; });
    });
  }

  /* message forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["where", "Street or area"], ["service", "Service"], ["message", "About the tree"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("service") || "Tree question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from elwoodstreeservice.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
