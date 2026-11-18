/* Sun-Ray Pizza – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll, route line draws, photo parallax */
  var nav = $(".nav"), route = $(".route-wrap"), par = $$(".par"), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 60);
    if (route) {
      var r = route.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
      route.style.setProperty("--draw", (1 - p).toFixed(3));
    }
    if (!reduce) par.forEach(function (img) {
      var b = img.parentNode.getBoundingClientRect();
      if (b.bottom < 0 || b.top > vh) return;
      var k = (b.top + b.height / 2 - vh / 2) / vh;
      img.style.transform = "translate3d(0," + (-8 + k * 14).toFixed(2) + "%,0)";
    });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* counters */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1100;
    if (reduce || !end) return;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }

  /* reveal on scroll */
  var targets = $$("[data-anim]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  } else targets.forEach(function (el) { el.classList.add("in"); });

  /* open now (Eastern time) + today's row */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var hours = { 0: [14.5, 20], 1: null, 2: [14.5, 20], 3: [14.5, 20], 4: [14.5, 20], 5: [11, 20.5], 6: [11, 20.5] };
    var fmt = function (x) { var hh = Math.floor(x), mm = Math.round((x - hh) * 60), ap = hh >= 12 ? "PM" : "AM"; hh = hh % 12 || 12; return hh + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + " " + ap; };
    var today = hours[day], msg;
    if (today && h >= today[0] && h < today[1]) msg = "Open now · until " + fmt(today[1]);
    else if (today && h < today[0]) msg = "Opens today at " + fmt(today[0]);
    else { var n = (day + 1) % 7; while (!hours[n]) n = (n + 1) % 7; msg = "Closed now · opens " + ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][n] + " " + fmt(hours[n][0]); }
    $$("[data-open]").forEach(function (el) {
      el.textContent = msg;
      var d = el.parentNode.querySelector(".dot");
      if (d && msg.indexOf("Open now") !== 0) d.classList.add("closed");
    });
    $$('.hours tr[data-day="' + day + '"]').forEach(function (tr) { tr.classList.add("today"); });
  } catch (e) {}

  /* magnetic call button */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    /* photo tilt */
    $$(".tilt").forEach(function (img) {
      img.addEventListener("mousemove", function (e) {
        var r = img.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = "perspective(900px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)";
      });
      img.addEventListener("mouseleave", function () { img.style.transform = ""; });
    });
  }

  /* party hero calculator */
  var pick = $("#hero-pick"), out = $("#hero-total"), note = $("#hero-note"), ft = 4;
  function calc() {
    if (!pick || !out) return;
    var per = +pick.value, tot = per * ft;
    out.textContent = "$" + tot.toFixed(2);
    note.textContent = ft + " ft × $" + per.toFixed(2) + " per foot." + (tot > 100 ? " With delivery, a 10% delivery fee is added on orders over $100." : "");
  }
  if (pick) {
    pick.addEventListener("change", calc);
    $$(".feet button").forEach(function (b) {
      b.addEventListener("click", function () {
        ft = +b.getAttribute("data-ft");
        $$(".feet button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        calc();
      });
    });
    calc();
  }

  /* menu page: highlight current section */
  var links = $$(".catnav a, .tabs a");
  if (links.length && "IntersectionObserver" in window) {
    var secs = $$(".msec");
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id, cat = ["catering", "platters", "trays"].indexOf(id) > -1;
        $$(".catnav a").forEach(function (a) { a.classList.toggle("cur", a.getAttribute("href") === "#" + id); });
        $$(".tabs a").forEach(function (a) { a.classList.toggle("cur", (a.getAttribute("href") === "#catering") === cat); });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    secs.forEach(function (s) { so.observe(s); });
  }
})();
