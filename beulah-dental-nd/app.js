/* Beulah Dental – demo site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(pointer: fine)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrink */
  var nav = $(".nav");
  var onScrollNav = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  onScrollNav();

  /* reveal on scroll (hero lines staggered) */
  var anims = $$("[data-anim]");
  $$(".hero [data-anim]").forEach(function (el, i) { el.style.transitionDelay = (0.08 + i * 0.11) + "s"; });
  if (reduce || !("IntersectionObserver" in window)) anims.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    anims.forEach(function (el) { if (!el.closest(".hero")) io.observe(el); });
    setTimeout(function () { $$(".hero [data-anim]").forEach(function (el) { el.classList.add("in"); }); }, 60);
  }

  /* counters */
  var counters = $$("[data-count]");
  var runCount = function (el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 25 : 0, t0 = null, dur = 1400;
    var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); p = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * p); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if (!reduce && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* parallax + timeline line draw (one rAF loop, passive scroll) */
  var pars = $$("[data-par]"), bgs = $$("[data-bg]"), draw = $("[data-draw]"), tl = $(".timeline");
  if (draw) { draw.style.strokeDasharray = "100"; draw.style.strokeDashoffset = reduce ? "0" : "100"; draw.setAttribute("pathLength", "100"); }
  var ticking = false;
  var frame = function () {
    ticking = false; onScrollNav();
    if (reduce) return;
    var vh = window.innerHeight;
    pars.forEach(function (el) { var r = el.getBoundingClientRect(), k = +el.getAttribute("data-par") || 0.06; el.style.transform = "scale(1.08) translateY(" + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + "px)"; });
    bgs.forEach(function (el) { var r = el.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; el.style.transform = "translateY(" + ((r.top + r.height / 2 - vh / 2) * -0.18).toFixed(1) + "px)"; });
    if (draw && tl) { var b = tl.getBoundingClientRect(), p = Math.max(0, Math.min(1, (vh * 0.75 - b.top) / b.height)); draw.style.strokeDashoffset = (100 - p * 100).toFixed(2); }
  };
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener("resize", frame);
  frame();

  /* cursor spotlight: page glow + glass cards */
  if (fine && !reduce) {
    var root = document.documentElement, pend = null;
    window.addEventListener("pointermove", function (e) {
      pend = e; if (pend._q) return;
      requestAnimationFrame(function () { root.style.setProperty("--mx", pend.clientX + "px"); root.style.setProperty("--my", pend.clientY + "px"); });
    }, { passive: true });
    $$(".spot").forEach(function (el) {
      el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.setProperty("--x", (e.clientX - r.left) + "px"); el.style.setProperty("--y", (e.clientY - r.top) + "px"); });
    });
    /* tilt */
    $$(".tilt").forEach(function (el) {
      el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)"; });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
    /* magnetic buttons */
    $$(".mag").forEach(function (el) {
      el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* open / closed – Mon–Thu 8:00–17:00, Beulah ND (Central time) */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var di = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var open = di >= 1 && di <= 4 && h >= 8 && h < 17;
    var nextDay = function () { if (di >= 1 && di <= 3 && h >= 17) return "tomorrow"; if (di >= 1 && di <= 4 && h < 8) return "today"; return "Monday"; };
    $$("[data-open]").forEach(function (el) { el.textContent = open ? "Open now · until 5 pm" : "Closed · opens " + nextDay() + " at 8 am"; });
    $$("[data-dot]").forEach(function (el) { el.classList.toggle("open", open); });
    $$("[data-hours] li").forEach(function (li) { var d = +li.getAttribute("data-d"); if (d === di || (d === 5 && (di === 5 || di === 6 || di === 0))) li.classList.add("today"); });
  } catch (e) {}

  /* appointment request → prepared email (or call fallback when no address is set) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["patient", "Patient"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var to = fm.getAttribute("data-mail");
      if (to) location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Appointment request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Beulah Dental website");
      else if (window.matchMedia("(max-width: 820px)").matches) location.href = "tel:+17018732259";
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
