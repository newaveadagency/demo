/* Rick Neff Masonry, Inc. – site script */
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

  /* header shrinks + hero photo parallax (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (-r.top * 0.12 - 40).toFixed(1) + "px,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value stays in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    if (!end) return;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered among siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        if (el.getAttribute("data-anim") !== "lay") el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
        if (el.hasAttribute("data-count")) count(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* gentle tilt on commercial cards */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(900px) rotateY(" + (x * 5).toFixed(2) + "deg) rotateX(" + (-y * 5).toFixed(2) + "deg)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* office open / closed (Mon–Fri 9:00–17:00, Eastern time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Indiana/Indianapolis", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      el.textContent = wk && h >= 9 && h < 17 ? "Office open now · until 5:00 pm" : "Office closed now · Mon–Fri, 9:00 am – 5:00 pm";
    } catch (e) {}
  });

  /* gallery filter */
  var chips = $$(".chip"), figs = $$(".gal figure");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-f");
      chips.forEach(function (x) { x.classList.toggle("on", x === c); });
      figs.forEach(function (g) { g.classList.toggle("hide", f !== "all" && g.getAttribute("data-cat") !== f); });
    });
  });

  /* lightbox */
  var lb = $(".lb");
  if (lb && figs.length) {
    var li = $("img", lb), lp = $("p", lb), cur = 0;
    var vis = function () { return figs.filter(function (g) { return !g.classList.contains("hide"); }); };
    var show = function (g) { var im = $("img", g); li.src = im.src; li.alt = im.alt; li.removeAttribute("width"); li.removeAttribute("height"); lp.textContent = ($("figcaption", g) || {}).textContent || ""; };
    var open = function (g) { cur = vis().indexOf(g); show(g); lb.classList.add("open"); $(".x", lb).focus(); };
    var step = function (d) { var v = vis(); cur = (cur + d + v.length) % v.length; show(v[cur]); };
    figs.forEach(function (g) {
      g.addEventListener("click", function () { open(g); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter") open(g); });
    });
    $(".x", lb).addEventListener("click", function () { lb.classList.remove("open"); });
    $(".pv", lb).addEventListener("click", function () { step(-1); });
    $(".nx", lb).addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("open"); });
    addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") lb.classList.remove("open"); else if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1);
    });
  }

  /* project log search */
  var q = $("#q"), rows = $$(".log tbody tr"), n = $(".log-n");
  if (q && rows.length) {
    var upd = function () {
      var v = q.value.trim().toLowerCase(), c = 0;
      rows.forEach(function (r) { var m = !v || r.textContent.toLowerCase().indexOf(v) > -1; r.classList.toggle("hide", !m); if (m) c++; });
      if (n) n.textContent = c + " of " + rows.length + " shown";
    };
    q.addEventListener("input", upd);
  }

  /* estimate form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["town", "Project location"], ["service", "Type of work"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Estimate request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from neffmasonry.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
