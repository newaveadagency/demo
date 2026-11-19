/* The Studio of Piano Fine Arts – concept site script */
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

  /* header shrinks on scroll (rAF + passive listener) */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { if (nav) nav.classList.toggle("small", (window.scrollY || 0) > 40); ticking = false; });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  /* piano: keys press in a short phrase when the card appears; hover presses keys */
  function playPhrase() {
    var w = $$(".keys .w"); if (!w.length || reduce) return;
    [0, 2, 4, 7, 9, 7, 4, 2, 0].forEach(function (k, i) {
      setTimeout(function () { var el = w[k]; if (!el) return; el.classList.add("press"); setTimeout(function () { el.classList.remove("press"); }, 260); }, 500 + i * 220);
    });
  }

  /* reveal on scroll with a small stagger between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    $$("[data-count]").forEach(function (el) { el.dataset.done = 1; });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; });
        var i = Math.max(0, sib.indexOf(el));
        if (el.getAttribute("data-anim") === "note") el.style.transitionDelay = (0.7 + i * 0.14) + "s";
        else el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
        if (el.classList.contains("stage")) playPhrase();
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) {
      io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 160);
    });
  }

  /* gentle tilt on instrument cards (pointer devices only) */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".grid-ins .card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "translateY(-6px) perspective(700px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 5).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* FAQ accordion */
  $$(".qa button").forEach(function (b) {
    b.addEventListener("click", function () {
      var qa = b.parentNode, open = !qa.classList.contains("open");
      $$(".qa.open").forEach(function (o) { o.classList.remove("open"); $("button", o).setAttribute("aria-expanded", "false"); });
      if (open) { qa.classList.add("open"); b.setAttribute("aria-expanded", "true"); }
    });
  });

  /* lesson inquiry form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["student", "Lessons are for"], ["instrument", "Instrument"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Lesson inquiry: " + (f.get("instrument") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the studio website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
