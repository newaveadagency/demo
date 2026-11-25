/* LMR AZ Realtors – website concept script (no dependencies) */
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
    burger.addEventListener("click", function () {
      if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px");
      var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o);
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrink + photo parallax (rAF, passive scroll) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -0.1 - r.height * 0.08).toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* SVG path lengths for line drawing */
  $$("[data-anim=draw] path").forEach(function (p) {
    try { var l = Math.ceil(p.getTotalLength ? p.getTotalLength() : 2000); p.style.setProperty("--len", (l || 2000) + "px"); } catch (e) {}
  });

  /* counters – the final value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1800;
    function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(end * e); if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end); }
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
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: line by line through a mask */
    $$("h1 [data-anim=line]").forEach(function (el, i) { io.unobserve(el); el.style.transitionDelay = (0.15 + i * 0.14) + "s"; requestAnimationFrame(function () { el.classList.add("in"); }); });
  }

  /* cursor spotlight on sections + glow inside glass cards */
  if (!reduce && hover) {
    $$(".spot").forEach(function (s) {
      s.addEventListener("pointermove", function (e) { var r = s.getBoundingClientRect(); s.style.setProperty("--mx", (e.clientX - r.left) + "px"); s.style.setProperty("--my", (e.clientY - r.top) + "px"); });
    });
    $$(".glass").forEach(function (g) {
      g.addEventListener("pointermove", function (e) { var r = g.getBoundingClientRect(); g.style.setProperty("--cx", (e.clientX - r.left) + "px"); g.style.setProperty("--cy", (e.clientY - r.top) + "px"); });
    });
    /* 3D tilt on service cards */
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)"; });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    /* magnetic buttons */
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* FAQ accordion (one open at a time) */
  $$(".qa button").forEach(function (b) {
    b.addEventListener("click", function () {
      var qa = b.parentNode, open = !qa.classList.contains("open");
      $$(".qa", qa.parentNode).forEach(function (q) { q.classList.remove("open"); $("button", q).setAttribute("aria-expanded", "false"); });
      if (open) { qa.classList.add("open"); b.setAttribute("aria-expanded", "true"); }
    });
  });

  /* lead form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = fm.elements.name;
      if (!name.value.trim()) { name.focus(); name.reportValidity && name.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["goal", "I want to"], ["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["area", "City / area"], ["lang", "Language"], ["when", "Timeline"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("goal") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the LMR AZ Realtors website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
