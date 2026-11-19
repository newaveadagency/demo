/* Laubacher Upholstery – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + gentle parallax on hero photo (rAF, passive) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (plx && !reduce && y < innerHeight * 1.2) plx.style.transform = "scale(1.12) translate3d(0," + (y * 0.06).toFixed(1) + "px,0)";
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – the final value is already in the HTML */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 75 : 0, t0 = null, dur = 1700;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* SVG stitch lines: measure path length for the draw animation */
  $$('[data-anim="draw"] path').forEach(function (p) { try { p.parentNode.style.setProperty("--len", Math.ceil(p.getTotalLength() + 2)); } catch (e) {} });

  /* reveal on scroll with a playful stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 7) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
        if (el.hasAttribute("data-count")) count(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: words bounce in one after another */
    $$(".hero-h [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 120); });
    $$(".hero-badge [data-count]").forEach(function (el) { setTimeout(function () { count(el); }, 500); });
  }

  /* playful tilt on service cards */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-6px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* before / after slider with project tabs */
  var ba = $(".ba");
  if (ba) {
    var range = $("input", ba), bImg = $(".ba-before", ba), aImg = $(".ba-after", ba), cap = $(".ba-cap");
    var set = function (v) { ba.style.setProperty("--pos", v + "%"); };
    range.addEventListener("input", function () { set(range.value); });
    $$(".ba-tabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".ba-tabs button").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
        bImg.src = b.dataset.b; aImg.src = b.dataset.a; if (cap) cap.textContent = b.dataset.cap;
        range.value = 50; set(50);
        if (!reduce) { var v = 50, d = 1, n = 0; (function wig() { v += d * 2.4; if (v > 64 || v < 36) { d = -d; n++; } set(v); if (n < 3) requestAnimationFrame(wig); else set(50); })(); }
      });
    });
  }

  /* shop open / closed (Mon–Fri 7:30–16:30, Eastern time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      var open = wk && h >= 7.5 && h < 16.5;
      el.textContent = open ? "Open now · until 4:30 pm" : "Closed now · email us your photos anytime";
      el.classList.toggle("is-open", open);
    } catch (e) {}
  });

  /* estimate form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Item"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Estimate request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\n(Photos attached)\n\nSent from laubacherupholstery.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
