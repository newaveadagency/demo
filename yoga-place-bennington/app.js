/* The Yoga Place – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + hero water-lily parallax (rAF, passive) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (plx && !reduce && y < innerHeight * 1.2) plx.style.transform = "translate3d(0," + (y * 0.22).toFixed(1) + "px,0) scale(1.04)";
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
    setTimeout(function () { el.textContent = end; }, dur + 400); /* guarantee the final value */
  }

  /* reveal on scroll, staggered between siblings */
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
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: lines rise out of their masks one after another */
    $$("h1 [data-anim='line']").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 180); });
  }

  if (!reduce && hover) {
    /* soft page spotlight that follows the cursor */
    var spot = $(".spot"), sx = -999, sy = -999, raf = 0;
    addEventListener("pointermove", function (e) {
      sx = e.clientX; sy = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; if (spot) spot.style.transform = "translate3d(" + sx + "px," + sy + "px,0)"; });
    }, { passive: true });
    /* spotlight inside glass cards */
    $$(".glass").forEach(function (c) {
      c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
    });
    /* magnetic buttons */
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* accordion: keep one answer open at a time */
  $$(".acc details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".acc details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* registration form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Day phone"], ["email", "Email"], ["service", "Class or question"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Yoga Place: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Yoga Place website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
