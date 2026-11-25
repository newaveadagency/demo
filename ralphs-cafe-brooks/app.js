/* Ralph's Cafe & Bakery – site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* reveal on scroll (+ counters, timeline) */
  var counted = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10), start = end > 100 ? end - 60 : 0, t0 = null, dur = 1400;
    if (reduce) { el.textContent = end; return; }
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        if (e.target.hasAttribute("data-count")) counted(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    targets.concat(counters).forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
  }

  /* SVG timeline line draws with scroll */
  var tl = $(".tl"), fg = $(".tl-line .fg");
  if (tl && fg) {
    fg.style.strokeDasharray = "1";
    var drawTl = function () {
      if (reduce) { fg.style.strokeDashoffset = "0"; return; }
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(Math.max((vh * 0.75 - r.top) / r.height, 0), 1);
      fg.style.strokeDashoffset = String(1 - p);
    };
    window.addEventListener("scroll", drawTl, { passive: true }); window.addEventListener("resize", drawTl); drawTl();
  }

  /* hero parallax (rAF) */
  var par = $("[data-parallax]");
  if (par && !reduce) {
    var ticking = false;
    var moveP = function () {
      var r = par.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) par.style.transform = "translate3d(0," + (-r.top * 0.12 - 30) + "px,0)";
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(moveP); } }, { passive: true });
    moveP();
  }

  /* card tilt + magnetic buttons (fine pointers only) */
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (ev) {
        var r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateY(" + x * 6 + "deg) rotateX(" + -y * 6 + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (ev) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + (ev.clientX - r.left - r.width / 2) * 0.18 + "px," + (ev.clientY - r.top - r.height / 2) * 0.3 + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open / closed now (Fri & Sat 8–15, Sun 8–14, Eastern time; season spring – week before Christmas) */
  var hrs = { 5: [8, 15], 6: [8, 15], 0: [8, 14] }, names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", month: "numeric", day: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = names.indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60, mon = +g("month"), dd = +g("day");
    $$(".hours tr[data-day]").forEach(function (tr) { if (+tr.getAttribute("data-day") === day) tr.classList.add("today"); });
    var offSeason = (mon === 12 && dd > 18) || mon <= 2;
    $$("[data-status]").forEach(function (el) {
      var s = $("span", el), o = hrs[day];
      if (offSeason) { s.textContent = "Closed for the season · see you in the spring"; return; }
      if (o && h >= o[0] && h < o[1]) { el.classList.add("open"); s.textContent = "Open now · until " + (o[1] - 12) + "pm today"; }
      else {
        var nd = day, i = 0;
        do { nd = (nd + 1) % 7; i++; } while (!hrs[nd] && i < 7);
        if (o && h < o[0]) nd = day;
        s.textContent = "Closed now · next open " + (nd === day ? "today" : names[nd]) + " at 8am";
      }
    });
  } catch (e) {}

  /* menu chips: highlight section in view */
  var chips = $$(".chips a");
  if (chips.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        chips.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    chips.forEach(function (a) { var t = document.getElementById(a.getAttribute("href").slice(1)); if (t) cio.observe(t); });
  }
})();
