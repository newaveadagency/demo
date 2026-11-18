/* G.G. Exteriors – site script */
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
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav"), ticking = false;
  var parallax = reduce ? [] : $$("[data-parallax]");
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("slim", y > 40);
    parallax.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      img.style.transform = "translate3d(0," + (-r.top * 0.18 - r.height * 0.08).toFixed(1) + "px,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* counters */
  function count(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), start = end > 1000 ? end - 60 : 0, t0 = null, dur = 1600;
    if (reduce) { el.textContent = end; return; }
    t0 = Date.now();
    (function step() {
      var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) setTimeout(step, 16);
    })();
  }

  /* reveal on scroll */
  var items = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) {
      /* masked lines sit inside overflow:hidden, so watch their wrapper */
      if (el.getAttribute("data-anim") === "line") {
        var lo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { el.classList.add("in"); lo.disconnect(); } });
        lo.observe(el.parentNode);
      } else io.observe(el);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* only one FAQ open at a time */
  $$(".acc details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".acc details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* estimate forms -> prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["address", "Address"], ["service", "Work needed"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Free estimate: " + (f.get("service") || "Roofing") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the G.G. Exteriors website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
