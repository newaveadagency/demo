/* Abuelita's Mexican Restaurant – site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrink + rotating plate (rAF, passive scroll) */
  var plate = $(".spin-plate"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (plate && !reduce && y < innerHeight * 1.5) plate.style.setProperty("--rot", (y * 0.12).toFixed(1) + "deg");
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – final value already in HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll with stagger between siblings */
  var items = $$("[data-anim]"), tl = $(".tl");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    if (tl) tl.classList.add("drawn");
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: lines slide up one after another */
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 170); });
    /* timeline line draws itself */
    if (tl) { var tio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { tl.classList.add("drawn"); tio.disconnect(); } }, { threshold: 0.2 }); tio.observe(tl); }
  }

  /* magnetic buttons + card tilt (hover devices only) */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { if (!c.classList.contains("in")) return; var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transition = "transform .1s"; c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transition = ""; c.style.transform = ""; });
    });
  }

  /* open now / closed – Central time */
  var HOURS = { shawnee: [[11, 20], [11, 20], [11, 20], [11, 20], [11, 20], [11, 21], [11, 21]], sulphur: [[11, 21], [11, 21], [11, 21], [11, 21], [11, 21], [11, 22], [11, 22]] };
  function nowCT() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h: (+g("hour") % 24) + g("minute") / 60 };
    } catch (e) { return null; }
  }
  var n = nowCT();
  function fmt(h) { return (h > 12 ? h - 12 : h) + (h >= 12 ? " pm" : " am"); }
  if (n && n.d > -1) {
    $$("[data-open]").forEach(function (el) {
      var hr = HOURS[el.getAttribute("data-open")]; if (!hr) return;
      var t = hr[n.d], open = n.h >= t[0] && n.h < t[1];
      el.classList.toggle("open", open);
      el.textContent = open ? "Open now · until " + fmt(t[1]) : (n.h < t[0] ? "Closed · opens today at " + fmt(t[0]) : "Closed · opens tomorrow at " + fmt(hr[(n.d + 1) % 7][0]));
    });
    $$("[data-hours] tr").forEach(function (tr) { if ((tr.getAttribute("data-days") || "").split(",").indexOf(String(n.d)) > -1) tr.classList.add("today"); });
  }

  /* menu page: highlight the section in view */
  var chips = $$(".chips a"), secs = $$("[data-spy]");
  if (chips.length && secs.length && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + e.target.id; a.classList.toggle("on", on);
          if (on && a.scrollIntoView && a.parentNode.scrollWidth > a.parentNode.clientWidth) a.parentNode.scrollTo({ left: a.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" });
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { sio.observe(s); });
  }
})();
