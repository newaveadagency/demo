/* Mogel, Speidel, Bobb & Kershner – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks after scrolling */
  var nav = $(".nav");
  function onScrollNav() { if (nav) nav.classList.toggle("small", window.scrollY > 40); }

  /* reveal on scroll: fade-up, line masks, image masks, rules */
  var anim = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    anim.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
        $$("[data-count]", e.target).concat(e.target.hasAttribute("data-count") ? [e.target] : []).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    anim.forEach(function (el) { io.observe(el); });
    /* safety: never leave content hidden */
    setTimeout(function () { anim.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); }); }, 2500);
  }

  /* counters (years count up to their value) */
  function count(el) {
    if (el._done || reduce) return; el._done = true;
    var end = parseInt(el.getAttribute("data-count"), 10); if (!end) return;
    var start = end > 1000 ? end - 120 : 0, t0 = null, dur = 1800;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* parallax images inside masked frames */
  var px = $$("[data-parallax]");
  var ticking = false;
  function parallax() {
    ticking = false;
    var vh = window.innerHeight;
    px.forEach(function (img) {
      var box = img.parentNode.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      var k = parseFloat(img.getAttribute("data-parallax")) || 0.1;
      var off = (box.top + box.height / 2 - vh / 2) * -k;
      img.style.setProperty("--py", off.toFixed(1) + "px");
    });
    drawLine();
  }

  /* history timeline: SVG line draws with scroll */
  var tl = $(".tl"), path = tl ? $(".tl-line path", tl) : null, len = 0;
  if (path) { len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = reduce ? 0 : len; }
  function drawLine() {
    if (!path || reduce) return;
    var r = tl.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
    path.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
  }

  function onScroll() {
    onScrollNav();
    if (!reduce && !ticking) { ticking = true; requestAnimationFrame(parallax); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* only one FAQ item open at a time per list */
  $$(".acc").forEach(function (acc) {
    $$("details", acc).forEach(function (d) {
      d.addEventListener("toggle", function () { if (d.open) $$("details", acc).forEach(function (o) { if (o !== d) o.open = false; }); });
    });
  });

  /* appointment form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["area", "Matter"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Appointment request – " + (f.get("area") || "General") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the msbk-law.com appointment form");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
