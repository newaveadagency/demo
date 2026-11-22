/* SungPuma Roofing & Restoration – site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  setNavH(); addEventListener("resize", setNavH);

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      setNavH();
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o);
      burger.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* horizontal gallery: pinned + scroll-linked on wide screens */
  var hs = $(".hs"), track = hs && $(".hs-track", hs), bar = hs && $(".hs-bar", hs);
  var pinOn = false, hsDist = 0;
  function setupHs() {
    if (!hs || !track) return;
    var wide = innerWidth > 900 && !reduce;
    if (wide) {
      hs.classList.add("pin"); pinOn = true;
      track.style.transform = "";
      hsDist = Math.max(0, track.scrollWidth - innerWidth);
      hs.style.setProperty("--hsh", (innerHeight + hsDist) + "px");
    } else {
      hs.classList.remove("pin"); pinOn = false; track.style.transform = "";
    }
  }

  /* scroll: header shrink, hero parallax, gallery */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (-(r.top) * 0.08 - 20).toFixed(1) + "px,0)";
      }
      if (pinOn) {
        var hr = hs.getBoundingClientRect(), span = hs.offsetHeight - innerHeight;
        var p = span > 0 ? Math.min(1, Math.max(0, -hr.top / span)) : 0;
        track.style.transform = "translate3d(" + (-p * hsDist).toFixed(1) + "px,0,0)";
        if (bar) bar.style.setProperty("--p", p.toFixed(3));
      } else if (bar && track) {
        var m = track.scrollWidth - track.clientWidth;
        bar.style.setProperty("--p", m > 0 ? (track.scrollLeft / m).toFixed(3) : 0);
      }
      ticking = false;
    });
  }
  if (track) track.addEventListener("scroll", onScroll, { passive: true });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", function () { setupHs(); onScroll(); });
  addEventListener("load", function () { setupHs(); onScroll(); });
  setupHs(); onScroll();

  /* counters – final value is in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 18 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered among siblings */
  var items = $$("[data-anim]");
  var steps = $(".steps");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    if (steps) steps.classList.add("drawn");
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; });
        el.style.transitionDelay = Math.min(Math.max(0, sib.indexOf(el)), 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: line by line on load */
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
    if (steps) {
      var so = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { steps.classList.add("drawn"); so.disconnect(); } }, { threshold: .35 });
      so.observe(steps);
    }
  }

  /* rotating words in the hero */
  $$(".rot").forEach(function (rot) {
    var w = $$(":scope > span", rot);
    if (reduce || w.length < 2) return;
    rot.classList.add("go");
    var i = 0; w[0].classList.add("now");
    setInterval(function () {
      var cur = w[i]; i = (i + 1) % w.length;
      cur.classList.remove("now"); cur.classList.add("out");
      w[i].classList.remove("out"); w[i].classList.add("now");
      setTimeout(function () { cur.classList.remove("out"); }, 750);
    }, 2400);
  });

  /* magnetic buttons + card tilt (pointer devices only) */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open now (Mon–Sat 9–18, Arkansas time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", hour12: false }).formatToParts(new Date());
      var wd = "", h = 0;
      parts.forEach(function (p) { if (p.type === "weekday") wd = p.value; if (p.type === "hour") h = +p.value % 24; });
      var open = wd !== "Sun" && h >= 9 && h < 18;
      el.textContent = open ? "Open now" : "Closed now · Mon–Sat 9–6";
      el.classList.toggle("yes", open);
    } catch (e) {}
  });

  /* lead form -> prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = new FormData(fm), body = [];
      [["Name", "name"], ["Phone", "phone"], ["Email", "email"], ["Service", "service"], ["City", "city"], ["Message", "message"]].forEach(function (k) {
        var v = (f.get(k[1]) || "").toString().trim(); if (v) body.push(k[0] + ": " + v);
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Free quote request: " + (f.get("service") || "") + " – " + (f.get("name") || "")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the SungPuma website");
    });
  });
})();
