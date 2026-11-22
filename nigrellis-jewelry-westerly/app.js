/* Nigrelli's Jewelry – site script */
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

  /* timeline line drawing setup */
  var tlPath = $(".tl-svg path"), tlLen = 0;
  if (tlPath && tlPath.getTotalLength) { tlLen = tlPath.getTotalLength(); tlPath.style.setProperty("--len", tlLen); }

  /* shrinking header, hero parallax, timeline drawing (one rAF on passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 60);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) plx.style.transform = "translate3d(0," + ((r.top - vh / 2) * -0.12).toFixed(1) + "px,0)";
      }
      if (tlPath && tlLen && !reduce) {
        var b = tlPath.parentNode.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh * 0.8 - b.top) / (b.height || 1)));
        tlPath.style.strokeDashoffset = (tlLen * (1 - p)).toFixed(1);
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* counters (final value already in HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll with stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
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
    $$(".hero h1 [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* card tilt on hover */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open now / closed (Tue–Fri 10–16, Sat 10–15, Eastern) + highlight today's hours */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var close = d >= 2 && d <= 5 ? 16 : d === 6 ? 15 : 0, open = close && h >= 10 && h < close;
    $$("[data-open]").forEach(function (el) { el.textContent = open ? "Open now · until " + (close - 12) + ":00 pm" : "Closed now · Tue – Fri 10–4, Sat 10–3"; });
    $$(".hours tr[data-day]").forEach(function (tr) { if (tr.getAttribute("data-day").split(",").indexOf(String(d)) > -1) tr.classList.add("today"); });
  } catch (e) {}

  /* contact form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["topic", "Interested in"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from nigrellisjewelry.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
