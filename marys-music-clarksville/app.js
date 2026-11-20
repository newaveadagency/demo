/* Mary's Music – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* horizontal gallery: pinned + scroll-driven on wide screens */
  var hs = $(".hs"), track = hs && $(".hs-track", hs), bar = hs && $(".hs-bar", hs);
  function setupHS() {
    if (!hs || !track) return;
    var wide = innerWidth > 900 && innerHeight < 1300 && !reduce;
    hs.classList.toggle("pinned", wide);
    if (!wide) { hs.style.height = ""; track.style.transform = ""; return; }
    var dist = Math.max(0, track.scrollWidth - innerWidth + 56);
    hs.style.height = (innerHeight + dist) + "px";
    hs.dataset.dist = dist;
  }

  /* header + gallery + parallax on scroll (rAF, passive) */
  var ticking = false;
  function frame() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("small", y > 40);
    if (hs && hs.classList.contains("pinned")) {
      var r = hs.getBoundingClientRect(), dist = +hs.dataset.dist || 0, total = hs.offsetHeight - innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      track.style.transform = "translate3d(" + (-p * dist).toFixed(1) + "px,0,0)";
      if (bar) bar.style.setProperty("--p", p.toFixed(3));
    } else if (hs && bar && track) {
      var m = track.scrollWidth - track.clientWidth;
      bar.style.setProperty("--p", m > 0 ? (track.scrollLeft / m).toFixed(3) : 0);
    }
    ticking = false;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", onScroll, { passive: true });
  if (track) track.addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", function () { setupHS(); onScroll(); });
  addEventListener("load", function () { setupHS(); onScroll(); });
  setupHS(); frame();

  /* counters (final number is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
    setTimeout(function () { el.textContent = end; }, dur + 400);
  }

  /* reveal on scroll with stagger */
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
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 140); });
  }

  if (!reduce && hover) {
    /* magnetic buttons */
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    /* card tilt */
    $$(".card.tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(800px) rotateY(" + (x * 10).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    /* hero spotlight follows cursor + photo stack drifts */
    $$(".hero, .page-hero").forEach(function (h) {
      var stack = $(".stack", h);
      h.addEventListener("mousemove", function (e) {
        var r = h.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        h.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); h.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        if (stack) stack.style.transform = "perspective(1000px) rotateY(" + ((x - .5) * 8).toFixed(2) + "deg) rotateX(" + (-(y - .5) * 6).toFixed(2) + "deg)";
      });
      h.addEventListener("mouseleave", function () { if (stack) stack.style.transform = ""; });
    });
  }

  /* open / closed (Central time) */
  var H = { 1: [10.5, 20], 2: [10.5, 20], 3: [10.5, 20], 4: [10.5, 20], 5: [10.5, 18], 6: [9, 17], 0: null };
  function fmt(h) { var hr = Math.floor(h), m = Math.round((h - hr) * 60), ap = hr >= 12 ? "pm" : "am", h12 = hr % 12 || 12; return h12 + (m ? ":" + (m < 10 ? "0" : "") + m : "") + " " + ap; }
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), now = (+g("hour") % 24) + g("minute") / 60, today = H[d];
    var open = today && now >= today[0] && now < today[1];
    var msg = open ? "Open now · until " + fmt(today[1]) : "Closed now" + (function () { for (var k = 1; k < 8; k++) { var nd = (d + k) % 7, t = H[nd]; if (k === 1 && today && now < today[0]) return " · opens today " + fmt(today[0]); if (t) return " · opens " + ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][nd] + " " + fmt(t[0]); } return ""; })();
    $$("[data-open-pill]").forEach(function (el) { el.textContent = msg; el.classList.toggle("closed", !open); });
    $$("[data-open]").forEach(function (el) { el.textContent = (open ? "Open now · " : "") + "Clarksville · Fort Campbell · since 1992"; });
    $$("[data-hours] li").forEach(function (li) { li.classList.toggle("today", +li.getAttribute("data-d") === d); });
  } catch (e) {}

  /* inquiry form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["topic", "Asking about"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Mary's Music website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
