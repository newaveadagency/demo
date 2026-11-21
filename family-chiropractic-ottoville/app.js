/* Family Chiropractic Center (Ottoville, OH) – concept site script */
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
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o ? "true" : "false"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* open / closed right now, in Ottoville time (America/New_York) */
  function ohNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      return { wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: +o.hour % 24, m: +o.minute };
    } catch (e) { var n = new Date(); return { wd: n.getDay(), h: n.getHours(), m: n.getMinutes() }; }
  }
  // minutes from midnight; each day = list of [open, close] blocks (0 = Sunday)
  var FULL = [[480, 720], [810, 1020]];
  var HOURS = { 1: FULL, 2: FULL, 4: FULL, 5: FULL, 6: [[480, 720]] };
  var DAYN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function fmt(m) { var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "PM" : "AM", hh = h % 12 || 12; return hh + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + " " + ap; }
  var t = ohNow(), mins = t.h * 60 + t.m, today = HOURS[t.wd] || [];
  function status() {
    for (var i = 0; i < today.length; i++) {
      var b = today[i];
      if (mins >= b[0] && mins < b[1]) return { open: true, txt: "Open now · until " + fmt(b[1]) };
      if (mins < b[0]) return { open: false, txt: "Closed now · opens " + (i ? "again " : "today ") + "at " + fmt(b[0]) };
    }
    for (var d = 1; d <= 7; d++) { var w = (t.wd + d) % 7; if (HOURS[w]) return { open: false, txt: "Closed now · opens " + (d === 1 ? "tomorrow" : DAYN[w]) + " at " + fmt(HOURS[w][0][0]) }; }
    return { open: false, txt: "" };
  }
  var st = status();
  $$("[data-status]").forEach(function (el) {
    el.textContent = st.txt;
    var dot = el.parentNode.querySelector("[data-status-dot]");
    if (dot) dot.classList.toggle("open", st.open);
  });
  $$(".days li").forEach(function (li) { if (+li.getAttribute("data-day") === t.wd) li.classList.add("today"); });

  /* shrinking header + hero photo parallax (one rAF per scroll) */
  var par = $("[data-parallax]"), ticking = false;
  function frame() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("small", y > 40);
    if (par && !reduce && y < innerHeight * 1.2) par.style.transform = "translate3d(0," + (-y * 0.08).toFixed(1) + "px,0)";
    ticking = false;
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* counters (final value is already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll (staggered), SVG line, hero sequence */
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
        el.style.transitionDelay = Math.min(i, 7) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    if (line) io.observe(line);
    var heroSeq = $$(".hero-copy [data-anim], .page-hero [data-anim], .sun-disc, .sun-rays, .arch, .badge");
    heroSeq.forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.style.transitionDelay = "0s"; el.classList.add("in"); }, 100 + i * 130); });
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

  /* request form: opens a prepared email if an address is set, otherwise shows a summary to read out on the phone */
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
        ok.textContent = "Thanks, " + f.get("name") + ". Please call the office at " + tel + " (Mon, Tue, Thu, Fri 8–12 & 1:30–5, Sat 8–12) with these details:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
