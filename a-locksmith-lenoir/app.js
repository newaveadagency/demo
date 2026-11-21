/* A Locksmith · Shane Ellison – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  /* combination-dial ticks (decorative SVG) */
  var dial = $("[data-dial]");
  if (dial) {
    var g = $(".ticks", dial), ns = "http://www.w3.org/2000/svg";
    if (g && !g.childNodes.length) {
      for (var k = 0; k < 100; k++) {
        var a = k / 100 * Math.PI * 2, r1 = k % 10 === 0 ? 150 : (k % 5 === 0 ? 162 : 170), r2 = 182;
        var l = document.createElementNS(ns, "line");
        l.setAttribute("x1", (200 + Math.sin(a) * r1).toFixed(1)); l.setAttribute("y1", (200 - Math.cos(a) * r1).toFixed(1));
        l.setAttribute("x2", (200 + Math.sin(a) * r2).toFixed(1)); l.setAttribute("y2", (200 - Math.cos(a) * r2).toFixed(1));
        if (k % 10) l.setAttribute("opacity", ".55");
        g.appendChild(l);
      }
    }
  }

  /* pinned horizontal gallery (wide screens only; otherwise native swipe) */
  var hs = $(".hscroll"), track = $("[data-hs]"), hsOn = false;
  function setupHS() {
    if (!hs || !track) return;
    var want = !reduce && innerWidth > 900;
    hs.classList.toggle("hs-on", want); hsOn = want;
    if (want) {
      var dist = track.scrollWidth - innerWidth + Math.max(20, (innerWidth - 1240) / 2);
      hs.style.height = (innerHeight + Math.max(dist, 0)) + "px";
      hs.dataset.dist = Math.max(dist, 0);
    } else { hs.style.height = ""; track.style.transform = ""; }
  }
  setupHS(); addEventListener("resize", function () { setupHS(); onScroll(); });

  /* scroll-driven: header, dial spin, horizontal gallery (rAF + passive) */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (dial && !reduce) dial.style.transform = "rotate(" + (y * 0.12).toFixed(2) + "deg)";
      if (hsOn) {
        var r = hs.getBoundingClientRect(), dist = +hs.dataset.dist || 0;
        var p = Math.min(Math.max(-r.top / Math.max(r.height - innerHeight, 1), 0), 1);
        track.style.transform = "translate3d(" + (-p * dist).toFixed(1) + "px,0,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – final value already in HTML */
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  $$("[data-count]").forEach(function (el) { el.textContent = fmt(+el.getAttribute("data-count")); });
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1700;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(Math.round(end * e)); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll with stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 170); });
  }

  var fine = !reduce && window.matchMedia && matchMedia("(hover: hover)").matches;
  /* magnetic buttons */
  if (fine) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    /* card tilt */
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, yv = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-yv * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* drag-to-scroll photo rails */
  $$("[data-rail]").forEach(function (rail) {
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener("mousedown", function (e) { down = true; moved = false; sx = e.pageX; sl = rail.scrollLeft; rail.classList.add("drag"); });
    addEventListener("mouseup", function () { down = false; rail.classList.remove("drag"); });
    rail.addEventListener("mousemove", function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - sx; if (Math.abs(dx) > 3) moved = true; rail.scrollLeft = sl - dx; });
  });

  /* quote form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["town", "Town / county"], ["service", "Service"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Quote request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from wecracksafes.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
