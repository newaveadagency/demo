/* Bay Boatworks – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var site = $(".site");
  var onScrollHeader = function () { if (site) site.classList.toggle("small", window.scrollY > 60); };

  /* reveal on scroll (hero lines get a stagger) */
  var anims = $$("[data-anim]");
  $$(".hero [data-anim], .phero [data-anim]").forEach(function (el, i) { el.style.transitionDelay = (0.12 * i) + "s"; });
  $$(".tickets [data-anim], .gal [data-anim], .stats [data-anim]").forEach(function (el, i) { el.style.transitionDelay = (0.07 * (i % 4)) + "s"; });
  if (reduce || !("IntersectionObserver" in window)) {
    anims.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    anims.forEach(function (el) { io.observe(el); });
  }

  /* counters */
  var counters = $$("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, end = +el.getAttribute("data-count"), t0 = null;
        var step = function (t) {
          if (!t0) { t0 = t; el.textContent = "0"; }
          var p = Math.min((t - t0) / 1600, 1), v = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * v);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* timeline line draws with scroll + postcard parallax */
  var tl = $(".tl"), draw = $(".tl .draw"), px = $$(".px"), ticking = false;
  if (draw) { draw.style.strokeDasharray = "100"; draw.style.strokeDashoffset = reduce ? "0" : "100"; }
  var frame = function () {
    ticking = false;
    var vh = window.innerHeight;
    if (draw && tl && !reduce) {
      var r = tl.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / r.height));
      draw.style.strokeDashoffset = String(100 - p * 100);
    }
    if (!reduce) px.forEach(function (im) {
      var r = im.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var c = (r.top + r.height / 2 - vh / 2) / vh;
      im.style.transform = "translateY(" + (c * -18).toFixed(1) + "px) scale(1.04)";
    });
  };
  var onScroll = function () { onScrollHeader(); if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* open / closed (Eastern time). Summer = Memorial Day to Labor Day. */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "numeric", day: "numeric", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var y = +g("year"), m = +g("month"), d = +g("day"), wd = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60;
      var memorial = (function () { var x = new Date(Date.UTC(y, 4, 31)); while (x.getUTCDay() !== 1) x.setUTCDate(x.getUTCDate() - 1); return x.getUTCDate(); })();
      var labor = (function () { var x = new Date(Date.UTC(y, 8, 1)); while (x.getUTCDay() !== 1) x.setUTCDate(x.getUTCDate() + 1); return x.getUTCDate(); })();
      var summer = (m > 5 && m < 9) || (m === 5 && d >= memorial) || (m === 9 && d < labor);
      var open = { Mon: 8, Tue: 8, Wed: 8, Thu: 8, Fri: 8 }[wd];
      if (summer && wd === "Sat") open = 9;
      if (summer && wd === "Sun") open = 10;
      var isOpen = open !== undefined && h >= open && h < 16.5;
      el.textContent = isOpen ? "Office open now · until 4:30 PM" : "Office closed right now · see hours";
    } catch (e) {}
  });

  /* request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["boat", "Boat"], ["service", "Asking about"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent((f.get("service") || "Request") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Bay Boatworks website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
