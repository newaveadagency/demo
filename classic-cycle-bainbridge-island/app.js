/* Classic Cycle Bainbridge Island – site script */
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

  /* shrinking header, arch parallax, timeline line drawing (one rAF, passive scroll) */
  var plx = $$(".plx"), line = $(".tl-line path"), tl = $(".timeline"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 60);
      if (!reduce) {
        plx.forEach(function (im) {
          var r = im.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < vh) im.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -0.08).toFixed(1) + "px,0)";
        });
        if (line && tl) {
          var t = tl.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh * 0.75 - t.top) / t.height));
          line.style.setProperty("--off", (1000 * (1 - p)).toFixed(0));
        }
      }
      ticking = false;
    });
  }
  if (line && !reduce) line.style.setProperty("--off", "1000");
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* counters (the final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
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
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 180); });
  }

  /* magnetic buttons */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* museum rail: drag to scroll with the mouse */
  $$(".rail").forEach(function (rail) {
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener("mousedown", function (e) { down = true; moved = false; sx = e.pageX; sl = rail.scrollLeft; });
    addEventListener("mouseup", function () { down = false; rail.classList.remove("drag"); });
    rail.addEventListener("mousemove", function (e) { if (!down) return; var dx = e.pageX - sx; if (Math.abs(dx) > 4) { moved = true; rail.classList.add("drag"); } rail.scrollLeft = sl - dx; e.preventDefault(); });
    rail.addEventListener("click", function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* open / closed now (Tue–Sat 10–5, Sun 12–4, Pacific time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60;
      var hrs = { Tue: [10, 17], Wed: [10, 17], Thu: [10, 17], Fri: [10, 17], Sat: [10, 17], Sun: [12, 16] }[d];
      if (hrs && h >= hrs[0] && h < hrs[1]) el.textContent = "Open now · until " + (hrs[1] - 12) + " pm today";
      else el.textContent = "Closed right now · Tue–Sat 10–5 · Sun 12–4";
    } catch (e) {}
  });

  /* repair request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Service"], ["bike", "Bike"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Repair request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from classiccycleus.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
