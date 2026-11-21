/* Dirty Dog Grooming – concept site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* counters (final value already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
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
    /* hero lines rise one after another */
    $$(".hero-h [data-anim], .phero h1 [data-anim], .stack [data-anim]").forEach(function (el, i) {
      io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 170);
    });
  }

  /* kinetic word in the hero */
  $$("[data-rotate]").forEach(function (w) {
    if (reduce) return;
    var words = w.getAttribute("data-rotate").split(","), i = 0, b = $("b", w);
    if (!b || !b.animate) return;
    setInterval(function () {
      i = (i + 1) % words.length;
      b.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(-60%)", opacity: 0 }], { duration: 260, easing: "ease-in" }).onfinish = function () {
        b.textContent = words[i];
        b.animate([{ transform: "translateY(60%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
      };
    }, 2200);
  });

  /* horizontal gallery driven by vertical scroll (desktop only) */
  var hg = $(".hgal"), track = hg && $(".hgal-track", hg), bar = hg && $(".hgal-bar i", hg), hgOn = false;
  function setupHG() {
    if (!hg || !track) return;
    var want = !reduce && innerWidth > 760;
    if (want) {
      hg.classList.add("pinned"); hgOn = true;
      var dist = Math.max(0, track.scrollWidth - innerWidth + 40);
      hg.style.height = (innerHeight + dist) + "px"; hg.dataset.dist = dist;
    } else {
      hg.classList.remove("pinned"); hgOn = false; hg.style.height = ""; track.style.transform = "";
    }
  }

  /* paw-trail line on the steps */
  var trail = $(".trail path");
  if (trail && !reduce) trail.style.strokeDashoffset = "1";

  /* scroll loop: header, parallax, gallery, trail (rAF, passive) */
  var plx = $$(".stack figure"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        plx.forEach(function (f, i) { var k = [0.06, 0.12, 0.18][i] || 0.1; f.style.translate = "0 " + (-y * k).toFixed(1) + "px"; });
        if (hgOn) {
          var r = hg.getBoundingClientRect(), dist = +hg.dataset.dist || 0, p = Math.min(1, Math.max(0, -r.top / (dist || 1)));
          track.style.transform = "translate3d(" + (-p * dist).toFixed(1) + "px,0,0)";
          if (bar) bar.style.setProperty("--p", p.toFixed(3));
        }
        if (trail) {
          var s = trail.closest(".steps").getBoundingClientRect(), q = Math.min(1, Math.max(0, (vh * 0.75 - s.top) / s.height));
          trail.style.strokeDashoffset = (1 - q).toFixed(3);
        }
      }
      ticking = false;
    });
  }
  setupHG();
  addEventListener("resize", function () { setupHG(); setNavH(); onScroll(); });
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* gallery fallback progress bar when it scrolls natively */
  if (track && bar) track.addEventListener("scroll", function () { var m = track.scrollWidth - track.clientWidth; bar.style.setProperty("--p", m ? (track.scrollLeft / m).toFixed(3) : 0); }, { passive: true });

  /* 3D tilt cards + magnetic buttons */
  if (!reduce && hover) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, yy = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-yy * 8).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open now / closed (Mon–Fri 8:00–17:00, Mountain time) + today's row */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Denver", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var open = day >= 1 && day <= 5 && h >= 8 && h < 17;
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-d") === day); });
    $$("[data-status]").forEach(function (el) { el.classList.toggle("open", open); el.textContent = open ? "Open now · until 5 PM" : "Closed now · call or email to book"; });
  } catch (e) {}

  /* booking form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["dog", "Dog's name"], ["breed", "Breed & age"], ["size", "Size"], ["service", "Service"], ["day", "Preferred day"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Grooming request: " + f.get("dog") + " (" + f.get("name") + ")") + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
