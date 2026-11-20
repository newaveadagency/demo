/* The Gentry of Hattiesburg – site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* horizontal gallery: the section gets a height so vertical scroll drives the track sideways */
  var hs = $(".hscroll"), track = hs && $(".track", hs), wide = window.matchMedia("(min-width: 641px)");
  function sizeHS() {
    if (!hs || !track) return;
    if (reduce || !wide.matches) { hs.style.height = ""; track.style.transform = ""; return; }
    var dist = Math.max(0, track.scrollWidth - innerWidth + 40);
    hs.style.height = (innerHeight + dist) + "px";
    hs.dataset.dist = dist;
  }

  /* scroll: shrinking header, hero parallax, horizontal gallery (rAF, passive) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (-(1 - r.bottom / (innerHeight + r.height)) * r.height * 0.13).toFixed(1) + "px,0)";
      }
      if (hs && track && hs.dataset.dist && !reduce && wide.matches) {
        var top = hs.getBoundingClientRect().top, d = +hs.dataset.dist;
        var p = Math.min(Math.max(-top / d, 0), 1);
        track.style.transform = "translate3d(" + (-p * d).toFixed(1) + "px,0,0)";
      }
      ticking = false;
    });
  }
  sizeHS();
  addEventListener("resize", function () { sizeHS(); onScroll(); });
  addEventListener("load", function () { sizeHS(); onScroll(); });
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters: the final value is already in the HTML */
  function count(el) {
    if (reduce || el.dataset.done) return;
    el.dataset.done = 1;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1200;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero: letters of GENTRY drop in one by one, page-hero lines slide up */
    $$(".mega .ch, .page-hero h1 [data-anim]").forEach(function (el, i) {
      io.unobserve(el);
      setTimeout(function () { el.classList.add("in"); }, 150 + i * 90);
    });
  }

  /* magnetic buttons, tilt cards, spotlight (desktop pointer only) */
  if (!reduce && fine) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".spot").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty("--mx", x + "px"); c.style.setProperty("--my", y + "px");
        if (c.classList.contains("tilt")) c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y / r.height) * 5).toFixed(2) + "deg) rotateY(" + ((x / r.width - 0.5) * 5).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { if (c.classList.contains("tilt")) c.style.transform = ""; });
    });
  }

  /* opening hours: mark today */
  var today = new Date().getDay();
  $$(".hours tr[data-day='" + today + "']").forEach(function (tr) { tr.classList.add("today"); });

  /* FAQ: one open at a time */
  $$(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".faq details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* message form -> prepared e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      ["Name", "Phone", "E-mail", "Message"].forEach(function (k) { if (f.get(k)) body.push(k + ": " + f.get(k)); });
      var to = fm.getAttribute("data-mail");
      fm.classList.add("sent");
      if (to) location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Message for The Gentry – " + f.get("Name")) + "&body=" + encodeURIComponent(body.join("\n"));
    });
  });
})();
