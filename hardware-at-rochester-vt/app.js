/* The Hardware at Rochester – site script */
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

  /* open / closed status (store time, America/New_York) */
  var HOURS = { 0: [9, 13], 1: [7, 18], 2: [7, 18], 3: [7, 18], 4: [7, 18], 5: [7, 18], 6: [8, 16] };
  function storeNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: (+o.hour % 24) + (+o.minute) / 60 };
    } catch (e) { var n = new Date(); return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  var now = storeNow();
  var row = $('.hours tr[data-day="' + now.d + '"]'); if (row) row.classList.add("today");
  var st = $(".status"), stt = $(".status-txt");
  if (st && stt && now.d >= 0) {
    var h = HOURS[now.d], fmt = function (x) { return (x > 12 ? x - 12 : x) + (x >= 12 ? " PM" : " AM"); };
    if (now.h >= h[0] && now.h < h[1]) stt.textContent = "Open now · until " + fmt(h[1]);
    else {
      st.classList.add("closed");
      stt.textContent = "Closed · opens " + (now.h < h[0] ? "today at " + fmt(h[0]) : "tomorrow at " + fmt(HOURS[(now.d + 1) % 7][0]));
    }
  }

  /* scroll: shrinking header, hero parallax, timeline line draw */
  var plx = $(".plx"), tl = $(".timeline"), path = $(".timeline .line path"), ticking = false;
  if (path && !reduce) { path.setAttribute("pathLength", "100"); path.style.strokeDasharray = "100"; path.style.strokeDashoffset = "100"; }
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        if (plx) { var r = plx.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (y * 0.06).toFixed(1) + "px,0) scale(1.1)"; }
        if (tl && path) {
          var b = tl.getBoundingClientRect(), p = (innerHeight * 0.75 - b.top) / b.height;
          p = Math.max(0, Math.min(1, p)); path.style.strokeDashoffset = (100 * (1 - p)).toFixed(1);
        }
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 130 : 0, t0 = null, dur = 1600;
    function step(t) { if (!t0) t0 = t; var q = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - q, 3); el.textContent = Math.round(start + (end - start) * e); if (q < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.07 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: words pop in one after another */
    $$(".h1 .w[data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 100 + i * 90); });
  }

  /* playful tilt on cards + magnetic hero buttons (desktop pointer only) */
  if (!reduce && fine) {
    $$(".dept, .aisle article").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(800px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg) translateY(-5px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".hero-ctas .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* special order form: opens a prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["message", "Looking for"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Special order request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      if (ok) { ok.textContent = "Your email app should open with the request filled in. If it doesn't, call us at " + tel + "."; ok.style.display = "block"; }
    });
  });
})();
