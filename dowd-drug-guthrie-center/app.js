/* Dowd Drug – site script */
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
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + gentle hero parallax (rAF, passive listener) */
  var plx = $(".hero-shot .ph img"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce && y < innerHeight) plx.style.translate = "0 " + (y * 0.06).toFixed(1) + "px";
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (the final value is already in the HTML) */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 60 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll, small stagger between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
        if (el.classList.contains("pack")) $$(".c i", el).forEach(function (p, k) { p.style.transitionDelay = (0.25 + k * 0.07) + "s"; });
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$("h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 160); });
  }

  /* open / closed right now (Mon–Fri 8:30–17:30, Sat 8–13, Central time) */
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var open = (day >= 1 && day <= 5 && h >= 8.5 && h < 17.5) || (day === 6 && h >= 8 && h < 13);
    var until = day === 6 ? "1:00 pm" : "5:30 pm";
    $$("[data-open]").forEach(function (el) {
      el.textContent = open ? "Open now · until " + until : "Closed now · Mon–Fri 8:30 am – 5:30 pm, Sat 8 am – 1 pm";
      if (!open && el.parentNode) el.parentNode.classList.add("closed");
    });
    $$("[data-hours] tr").forEach(function (tr) { if ((" " + tr.getAttribute("data-d") + " ").indexOf(" " + day + " ") > -1) tr.classList.add("today"); });
  } catch (e) {}

  /* request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Request"], ["rx", "Prescription number(s)"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("service") || "Request") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Dowd Drug website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
