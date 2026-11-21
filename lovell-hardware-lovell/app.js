/* Lovell Hardware – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header + hero parallax (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (-8 + (r.top / innerHeight) * -60).toFixed(1) + "px,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – the final number is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* SVG line drawing: measure path lengths */
  $$(".store-svg [data-draw]").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {} });

  /* reveal on scroll, staggered between siblings */
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
    /* headline: lines rise one after another */
    $$(".hero h1 [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* magnetic buttons + card tilt (mouse only) */
  if (!reduce && fine) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(800px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* horizontal gallery: drag to scroll with the mouse */
  $$(".strip").forEach(function (s) {
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener("mousedown", function (e) { down = true; x0 = e.pageX; l0 = s.scrollLeft; s.classList.add("drag"); });
    addEventListener("mouseup", function () { down = false; s.classList.remove("drag"); });
    s.addEventListener("mousemove", function (e) { if (!down) return; e.preventDefault(); s.scrollLeft = l0 - (e.pageX - x0); });
  });

  /* open now / closed (Eastern time) + highlight today's row */
  var HOURS = { 0: [9, 16], 1: [6, 17], 2: [6, 17], 3: [6, 17], 4: [6, 17], 5: [6, 17], 6: [8, 17] };
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = DAYS.indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60, today = HOURS[day];
    var fmt = function (n) { return n === 12 ? "12 PM" : n > 12 ? (n - 12) + " PM" : n + " AM"; };
    $$("[data-open]").forEach(function (el) {
      var t = $(".st-txt", el), open = h >= today[0] && h < today[1];
      el.classList.toggle("closed", !open);
      if (t) t.textContent = open ? "Open now · until " + fmt(today[1]) : (h < today[0] ? "Closed now · opens today at " + fmt(today[0]) : "Closed now · opens tomorrow at " + fmt(HOURS[(day + 1) % 7][0]));
    });
    $$(".htable tr[data-day]").forEach(function (tr) { if (tr.getAttribute("data-day").split(",").indexOf(String(day)) > -1) tr.classList.add("today"); });
  } catch (e) {}

  /* concrete calculator */
  $$("[data-calc]").forEach(function (f) {
    var ins = $$("input", f);
    function calc() {
      var l = parseFloat(ins[0].value) || 0, w = parseFloat(ins[1].value) || 0, d = parseFloat(ins[2].value) || 0, cf = l * w * (d / 12);
      $("[data-out=yd]", f).textContent = (cf / 27).toFixed(2);
      $("[data-out=b80]", f).textContent = Math.ceil(cf / 0.6);
      $("[data-out=b60]", f).textContent = Math.ceil(cf / 0.45);
    }
    ins.forEach(function (i) { i.addEventListener("input", calc); }); calc();
  });

  /* request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["topic", "Topic"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from lovellhardware.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
