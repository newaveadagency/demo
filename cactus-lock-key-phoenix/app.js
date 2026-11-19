/* Cactus Lock & Key – site script */
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

  /* header shrink + hero image parallax (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (-(1 - r.bottom / (innerHeight + r.height)) * r.height * 0.15).toFixed(1) + "px,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll (fade-up, clip-path, wipe, SVG draw, grid lines) */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.07 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: lines rise one after another */
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 140); });
    $$(".grid-bg [data-anim]").forEach(function (el, i) { io.unobserve(el); el.style.transitionDelay = i * 0.05 + "s"; setTimeout(function () { el.classList.add("in"); }, 30); });
  }

  /* live Phoenix clock (Arizona does not use daylight saving time) */
  $$("[data-clock]").forEach(function (el) {
    function tick() {
      try {
        var t = new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", hour: "numeric", minute: "2-digit" }).format(new Date());
        el.textContent = "Phoenix " + t + " · we're available 24/7";
      } catch (e) {}
    }
    tick(); setInterval(tick, 30000);
  });

  /* service request form → prepared email, or call prompt if no email is set */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [], clean = function (v) { return String(v || "").replace(/[<>&"]/g, ""); };
      [["name", "Name"], ["phone", "Phone"], ["service", "Service"], ["city", "City"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail");
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Service request: " + f.get("service") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Cactus Lock & Key website");
        if (ok) { ok.textContent = "Your email app is open with the request ready to send. Thank you!"; ok.style.display = "block"; }
      } else if (ok) {
        ok.innerHTML = "Thanks, " + clean(f.get("name")) + ". To book, call <a href=\"tel:+16029782262\">(602) 978-2262</a> and mention: " + clean(f.get("service")) + ".";
        ok.style.display = "block";
      }
    });
  });
})();
