/* Kennedy Insurance Agency Inc. – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
  $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { if (menu) menu.classList.remove("open"); }); });

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onNav = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onNav, { passive: true }); onNav();

  /* years since 1901 (computed, never hard-coded) */
  var yrs = new Date().getFullYear() - 1901;
  $$("[data-years]").forEach(function (el) { el.textContent = yrs; });

  /* counters */
  function count(el) {
    var to = parseInt(el.getAttribute("data-count"), 10); if (isNaN(to)) return;
    if (reduce) { el.textContent = to; return; }
    var from = to > 1000 ? to - 60 : 0, t0 = null, dur = 1400;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* reveal on scroll */
  var hero = $$(".hero [data-anim], .phero [data-anim]");
  var rest = $$("[data-anim]").filter(function (el) { return hero.indexOf(el) < 0; });
  var show = function (el) {
    el.classList.add("in");
    if (el.hasAttribute("data-count")) count(el);
    $$("[data-count]", el).forEach(count);
  };
  if (reduce || !("IntersectionObserver" in window)) {
    $$("[data-anim]").forEach(function (el) { el.classList.add("in"); });
  } else {
    /* hero: lines rise one after another */
    hero.forEach(function (el, i) { setTimeout(function () { show(el); }, 120 + i * 130); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rest.forEach(function (el) { io.observe(el); });
  }

  /* timeline rail draws with scroll */
  var tl = $(".tl"), fg = tl && $(".rail .fg", tl);
  if (tl && fg) {
    var len = 0, ticking = false;
    var measure = function () { len = tl.offsetHeight; fg.style.strokeDasharray = len + " " + len; };
    var draw = function () {
      ticking = false;
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / r.height));
      fg.style.strokeDashoffset = len * (1 - p);
    };
    measure(); draw();
    window.addEventListener("resize", function () { measure(); draw(); });
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
  }

  /* office open / closed (Mon–Fri 8–12, 1–4, Central time) */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var wk = day >= 1 && day <= 5, open = wk && ((h >= 8 && h < 12) || (h >= 13 && h < 16));
    var msg = open ? "Office open now · until " + (h < 12 ? "12 PM (lunch 12–1)" : "4 PM")
      : wk && h >= 12 && h < 13 ? "Closed for lunch · back at 1 PM"
      : "Office closed now · Mon–Fri, 8 AM – 4 PM";
    $$("[data-open]").forEach(function (el) { el.classList.add(open ? "open" : "closed"); var s = $("span", el); if (s) s.textContent = msg; });
    $$("[data-hours] tr[data-d]").forEach(function (tr) { if (+tr.getAttribute("data-d") === day) tr.classList.add("today"); });
  } catch (e) {}

  /* quote / contact forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Coverage"], ["time", "Best time to reach me"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Quote appointment – " + (f.get("service") || "insurance") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Kennedy Insurance Agency website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
