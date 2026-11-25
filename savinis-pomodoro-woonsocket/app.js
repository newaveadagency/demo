/* Savini's Pomodoro – site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onScrollNav = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* reveal on scroll (fade-up, mask, clip-path, scale, awning) with stagger */
  var els = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sibs = el.parentNode ? $$(":scope > [data-anim]", el.parentNode) : [];
        var i = Math.max(0, sibs.indexOf(el));
        el.style.transitionDelay = Math.min(i * 90, 450) + "ms";
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
    /* hero lines on load */
    $$(".hero [data-anim], .page-hero [data-anim]").forEach(function (el, i) {
      setTimeout(function () { el.classList.add("in"); }, 120 + i * 130);
    });
  }

  /* counters */
  var counters = $$("[data-count]");
  var runCount = function (el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 60 : 0, t0 = null, dur = 1600;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), v = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
      el.textContent = v;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* parallax hero image (rAF, passive scroll) */
  var par = $$(".parallax");
  if (par.length && !reduce) {
    var ticking = false;
    var upd = function () {
      var y = window.scrollY;
      par.forEach(function (img) { if (y < window.innerHeight * 1.2) img.style.transform = "translate3d(0," + (y * 0.25) + "px,0)"; });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  }

  /* magnetic buttons + card tilt (pointer devices only) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 7) + "deg) rotateX(" + (-y * 7) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open / closed status + today's row (America/New_York)
     Kitchen: Mon closed · Tue–Thu 16–21 · Fri–Sat 12–22 · Sun 12–20 */
  var HOURS = { 0: [12, 20], 1: null, 2: [16, 21], 3: [16, 21], 4: [16, 21], 5: [12, 22], 6: [12, 22] };
  var fmt = function (h) { var s = h > 12 ? h - 12 : h; return s + (h >= 12 ? " pm" : " am"); };
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday"));
    var now = (+g("hour") % 24) + (+g("minute")) / 60;
    var row = $('.hours tr[data-day="' + day + '"]'); if (row) row.classList.add("today");
    $$("[data-open]").forEach(function (el) {
      var h = HOURS[day], txt, open = false;
      if (h && now >= h[0] && now < h[1]) { open = true; txt = "Kitchen open now · until " + fmt(h[1]); }
      else if (h && now < h[0]) txt = "Closed now · opens today at " + fmt(h[0]);
      else {
        for (var i = 1; i < 8; i++) { var d = (day + i) % 7; if (HOURS[d]) { txt = "Closed now · opens " + (i === 1 ? "tomorrow" : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d]) + " at " + fmt(HOURS[d][0]); break; } }
      }
      el.textContent = txt; el.classList.toggle("open", open);
    });
  } catch (e) {}

  /* menu page: scrollspy for the category chips */
  var chips = $$(".chips a");
  if (chips.length && "IntersectionObserver" in window) {
    var map = {};
    chips.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (a) { a.classList.remove("act"); });
        var a = map[e.target.id];
        if (a) { a.classList.add("act"); var box = a.parentNode; box.scrollTo({ left: a.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" }); }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$(".msec").forEach(function (s) { so.observe(s); });
  }
})();
