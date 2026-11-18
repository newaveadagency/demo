/* Stewart's Lawn and Landscaping – site script */
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
    });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* reveal on scroll (fade-up, pop, masked lines, SVG path draw) */
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    anims.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { (e.target._anim || e.target).classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    anims.forEach(function (el) {
      /* masked lines sit outside their clipping parent, so watch the parent */
      var t = el.getAttribute("data-anim") === "line" && el.parentNode ? el.parentNode : el;
      if (t !== el) t._anim = el;
      io.observe(t);
    });
  }

  /* count-up numbers */
  var counters = $$("[data-count]");
  function runCount(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), t0 = Date.now(), dur = 1400;
    (function step() {
      var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e);
      if (p < 1) setTimeout(step, 30);
    })();
  }
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* start the looping animations (blob morph, stamp, marquee) once the page is live */
  var root = document.documentElement, goLive = function () { root.classList.add("live"); };
  ["scroll", "pointermove", "touchstart", "keydown"].forEach(function (ev) { window.addEventListener(ev, goLive, { once: true, passive: true }); });
  setTimeout(goLive, 4000);

  /* shrinking header + parallax leaves (one rAF per frame, passive scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var k = parseFloat(el.getAttribute("data-parallax")) || 0;
      el.style.translate = "0 " + (y * k).toFixed(1) + "px";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* before / after slider */
  $$(".ba").forEach(function (ba) {
    var r = $(".ba-range", ba);
    if (!r) return;
    var set = function () { ba.style.setProperty("--pos", r.value + "%"); };
    r.addEventListener("input", set);
    set();
  });

  /* playful tilt on service cards, magnetic hero button */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".svc").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateY(-6px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".magnet").forEach(function (m) {
      m.addEventListener("mousemove", function (e) {
        var b = m.getBoundingClientRect();
        m.style.translate = ((e.clientX - b.left - b.width / 2) * 0.25).toFixed(1) + "px " + ((e.clientY - b.top - b.height / 2) * 0.35).toFixed(1) + "px";
      });
      m.addEventListener("mouseleave", function () { m.style.translate = ""; });
    });
  }

  /* open now? (Mon–Fri 7:30–18:00, Sat 9–15, Eastern time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60;
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      var open = (wk && h >= 7.5 && h < 18) || (d === "Sat" && h >= 9 && h < 15);
      el.textContent = open ? "Open now, give us a call" : "Closed now, leave a message";
    } catch (e) {}
  });

  /* consultation forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["zip", "ZIP code"], ["service", "Service"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Free consultation: " + (f.get("service") || "landscaping") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from stewartslawnandlandscaping.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
