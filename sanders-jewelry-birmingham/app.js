/* Sanders Jewelry – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header + image parallax (rAF, passive scroll) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      if (nav) nav.classList.toggle("small", (window.scrollY || 0) > 40);
      if (!reduce) plx.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) im.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -0.07).toFixed(1) + "px,0) scale(1.12)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* hero glow follows the cursor */
  if (!reduce && fine) {
    $$(".hero, .page-hero").forEach(function (h) {
      var g = $(".glow", h); if (!g) return;
      h.addEventListener("mousemove", function (e) { var r = h.getBoundingClientRect(); g.style.setProperty("--gx", (e.clientX - r.left) + "px"); g.style.setProperty("--gy", (e.clientY - r.top) + "px"); });
    });
    /* spotlight inside glass cards */
    $$(".card, .rev, .form").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
    });
    /* magnetic buttons */
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* counters (final value already in HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1600;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  function show(el) { el.classList.add("in"); $$("[data-count]", el).forEach(count); if (el.classList.contains("silver")) el.classList.add("in"); }
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        show(el); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero lines in sequence */
    $$(".hero [data-anim], .page-hero [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { show(el); }, 120 + i * 140); });
  }
  /* silver shimmer on the header wordmark */
  if (!reduce) $$(".brand .silver").forEach(function (b) { b.classList.add("in"); });

  /* today's hours highlighted */
  var d = new Date().getDay(), row = $('.hours tr[data-d="' + d + '"]');
  if (row) row.classList.add("today");

  /* request forms: email if an address is set, otherwise show a summary to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Request"], ["type", "Piece"], ["priority", "More important"], ["budget", "Price range"], ["when", "Needed by"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "", kind = fm.getAttribute("data-kind") || (f.get("service") || "Request");
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent(kind + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. You can also call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thank you, " + f.get("name") + ". Call us at " + tel + " (Mon–Fri, 10–5) with these details:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
