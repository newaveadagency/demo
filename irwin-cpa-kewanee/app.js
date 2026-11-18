/* Douglas W. Irwin & Co., Ltd. – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("small", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  /* counters */
  function count(el) {
    var to = +el.getAttribute("data-count"), t0 = null, d = 1400;
    if (reduce || !to) { el.textContent = to; return; }
    el.textContent = "0";
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / d, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = to; }, d + 300); /* safety if frames are throttled */
  }

  /* reveal on scroll (data-anim) */
  var els = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
  } else {
    /* clip-path hides the element from IntersectionObserver, so clipped items are watched through their parent */
    var clipped = /^(clip|wipe|rule)$/;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var list = e.target.__anim || [e.target];
        list.forEach(function (el) { el.classList.add("in"); $$("[data-count]", el).forEach(count); setTimeout(function () { el.classList.add("done"); }, 2600); });
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    var watch = function (el) {
      if (!clipped.test(el.getAttribute("data-anim"))) return io.observe(el);
      var p = el.parentNode; (p.__anim = p.__anim || []).push(el); io.observe(p);
    };
    els.forEach(function (el) {
      if (el.getAttribute("data-anim") === "up") {
        var sib = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.getAttribute("data-anim") === "up"; });
        var i = sib.indexOf(el);
        if (i > 0) el.style.transitionDelay = Math.min(i * 0.08, 0.4) + "s";
      }
      watch(el);
    });
  }

  /* only one FAQ open at a time */
  $$(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".faq details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* magnetic buttons (desktop pointer only) */
  if (!reduce && window.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    $$(".hero .btn, .cta-band .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = "translate(" + (x * 0.15).toFixed(1) + "px," + (y * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* message form -> prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Topic"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + (fm.getAttribute("data-mail") || "") + "?subject=" + encodeURIComponent((f.get("service") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
