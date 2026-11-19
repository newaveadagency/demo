/* EZ Clean Carpet Cleaning – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* SVG line drawing: measure each path so the dash covers it */
  $$(".draw .dr").forEach(function (p) {
    try { var l = Math.ceil(p.getTotalLength()) + 2; p.style.setProperty("--len", l); p.style.strokeDasharray = l; } catch (e) {}
  });

  /* shrinking header + hero image parallax (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (-(1 - r.bottom / (innerHeight + r.height)) * 14).toFixed(2) + "%,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1200;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = String(Math.round(end * e)).padStart(String(end).length, "0"); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    requestAnimationFrame(step);
  }

  /* reveal on scroll (fade-up, clip-path, line drawing), staggered between siblings */
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
    /* hero headline: line-by-line mask, plus the grid drawing in */
    var grid = $(".grid-bg"); if (grid) { io.unobserve(grid); setTimeout(function () { grid.classList.add("in"); }, 60); }
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 180 + i * 150); });
  }

  /* FAQ: keep one answer open at a time */
  $$(".q-list details").forEach(function (d, _, all) {
    d.addEventListener("toggle", function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* booking form: e-mail if an address is set, otherwise a text message (SMS) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Cleaning"], ["town", "City"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), sms = fm.getAttribute("data-sms"), tel = fm.getAttribute("data-phone") || "";
      var text = "Cleaning request\n" + body.join("\n");
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Cleaning request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Or call / text " + tel + "."; ok.style.display = "block"; }
      } else {
        var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (sms && mobile) location.href = "sms:" + sms + (/iPhone|iPad|iPod/i.test(navigator.userAgent) ? "&" : "?") + "body=" + encodeURIComponent(text);
        if (ok) { ok.textContent = (mobile ? "Your messages app should open with this filled in:\n" : "Thanks, " + f.get("name") + ". Call or text " + tel + " with these details:\n") + body.join("\n"); ok.style.display = "block"; }
      }
    });
  });
})();
