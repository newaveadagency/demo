/* Family Chiropractic Clinic – concept site script */
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

  /* open / closed status in Great Falls time (America/Denver) + today's row in the hours chart */
  function mtNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Denver", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      return { wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: +o.hour % 24, m: +o.minute };
    } catch (e) { var n = new Date(); return { wd: n.getDay(), h: n.getHours(), m: n.getMinutes() }; }
  }
  // minutes from midnight: [open, close] per weekday (0 = Sunday)
  var HOURS = { 1: [510, 1080], 2: [510, 900], 4: [510, 1080], 5: [510, 900] };
  var LABEL = { 1080: "6 PM", 900: "3 PM" };
  var DAYN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var t = mtNow(), mins = t.h * 60 + t.m, today = HOURS[t.wd];
  function nextOpen() { for (var i = 1; i <= 7; i++) { var d = (t.wd + i) % 7; if (HOURS[d]) return (i === 1 ? "tomorrow" : DAYN[d]) + " at 8:30 AM"; } return ""; }
  $$("[data-status]").forEach(function (st) {
    var dot = st.parentNode.querySelector("[data-status-dot]");
    if (today && mins >= today[0] && mins < today[1]) { st.textContent = "Open now · until " + LABEL[today[1]]; if (dot) dot.classList.add("open"); }
    else if (today && mins < today[0]) st.textContent = "Closed now · opens today at 8:30 AM";
    else st.textContent = "Closed now · opens " + nextOpen();
  });
  $$(".days li").forEach(function (li) { if (+li.getAttribute("data-day") === t.wd) li.classList.add("today"); });

  /* shrinking header */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { if (nav) nav.classList.toggle("small", (window.scrollY || 0) > 40); ticking = false; });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 60 : 0, t0 = null, dur = 1400;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1); el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll (staggered), SVG line draw, hero sequence */
  var items = $$("[data-anim]"), line = $(".steps-line");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    if (line) line.classList.add("in");
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el === line) { el.classList.add("in"); io.unobserve(el); return; }
        var sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    if (line) io.observe(line);
    var heroSeq = $$(".hero-h [data-anim], .h1 [data-anim], .hero-art");
    heroSeq.forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.style.transitionDelay = "0s"; el.classList.add("in"); }, 120 + i * 150); });
  }

  /* cursor spotlight, magnetic buttons, card tilt (fine pointer only) */
  if (!reduce && fine) {
    $$(".spot").forEach(function (s) {
      s.addEventListener("mousemove", function (e) { var r = s.getBoundingClientRect(); s.style.setProperty("--mx", (e.clientX - r.left) + "px"); s.style.setProperty("--my", (e.clientY - r.top) + "px"); });
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* request form: email if an address is set, otherwise show a summary to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Reason"], ["when", "Best day"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Visit request: " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. You can also call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Please call the office at " + tel + " (Mon & Thu 8:30–6, Tue & Fri 8:30–3) with these details:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
