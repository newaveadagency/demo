/* Dan's Plumbing & Heating – site script */
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

  /* pipes that fill with scroll (SVG stroke-dashoffset) */
  var pipes = [];
  $$(".tl, .steps").forEach(function (box) {
    var paths = $$(".flow, .core", box);
    if (!paths.length || reduce) return;
    paths.forEach(function (p) { p.style.setProperty("--len", 1000); p.style.setProperty("--off", 1000); });
    pipes.push({ box: box, paths: paths, horiz: box.classList.contains("steps") });
  });

  /* header shrink + hero parallax + pipes (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 50);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) plx.style.transform = "translate3d(0," + (Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height))) * -r.height * 0.15).toFixed(1) + "px,0)";
      }
      pipes.forEach(function (o) {
        var b = o.box.getBoundingClientRect(), p;
        if (o.horiz) p = (vh * 0.9 - b.top) / (vh * 0.55);
        else p = (vh * 0.7 - b.top) / b.height;
        p = Math.min(1, Math.max(0, p));
        o.paths.forEach(function (el) { el.style.setProperty("--off", (1000 * (1 - p)).toFixed(0)); });
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1600;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered among siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 7) * 0.07 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: line-by-line mask reveal */
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) {
      io.unobserve(el); el.style.transitionDelay = "0s";
      setTimeout(function () { el.classList.add("in"); }, 120 + i * 130);
    });
  }

  if (!reduce && matchMedia("(hover: hover)").matches) {
    /* magnetic buttons */
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open / closed status (store Mon–Fri 9:00–16:00, Mountain time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Denver", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var h = (+g("hour") % 24) + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(g("weekday")) > -1;
      var open = wk && h >= 9 && h < 16;
      el.textContent = open ? "Store open now · until 4:00 pm" : "Store closed now · open Mon–Fri 9:00 am – 4:00 pm";
      var dot = el.parentNode.querySelector(".dot"); if (dot) dot.classList.toggle("off", !open);
    } catch (e) {}
  });

  /* service request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Type of work"], ["town", "Town"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Service request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Dan's Plumbing & Heating website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
