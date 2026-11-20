/* The Saucy Pig – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  setNavH(); addEventListener("resize", setNavH);

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* open / closed in Arkansas time (America/Chicago); hours in decimal 24h */
  var HOURS = { 0: [11, 17], 1: null, 2: null, 3: [11, 19], 4: [11, 19], 5: [11, 19], 6: [11, 19] };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function shopNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: (+o.hour % 24) + (+o.minute) / 60 };
    } catch (e) { var n = new Date(); return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  function fmt(x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h > 12 ? h - 12 : h) + (m ? ":" + (m < 10 ? "0" : "") + m : "") + (h >= 12 ? " PM" : " AM"); }
  var now = shopNow();
  var row = $('.hours tr[data-day="' + now.d + '"]'); if (row) row.classList.add("today");
  var st = $(".status"), stt = $(".status-txt");
  if (st && stt && now.d >= 0) {
    var h = HOURS[now.d];
    if (h && now.h >= h[0] && now.h < h[1]) stt.textContent = "Open now · until " + fmt(h[1]);
    else {
      st.classList.add("closed");
      var txt = "";
      if (h && now.h < h[0]) txt = "today at " + fmt(h[0]);
      else for (var i = 1; i < 8; i++) { var d = (now.d + i) % 7; if (HOURS[d]) { txt = (i === 1 ? "tomorrow" : DAYS[d]) + " at " + fmt(HOURS[d][0]); break; } }
      stt.textContent = "Closed · opens " + txt;
    }
  }

  /* scroll: shrinking header + hero photo parallax */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + ((r.top - innerHeight / 3) * -0.09).toFixed(1) + "px,0) scale(1.12)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    function step(t) { if (!t0) t0 = t; var q = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings; hero lines go one after another */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) items.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".h1 .ln > [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 170); });
  }

  /* magnetic buttons in the hero (desktop pointer only) */
  if (!reduce && fine) {
    $$(".hero .hero-ctas .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* catering estimate: guests x $12 (published per-person price) */
  var g = $("#guests"), out = $(".calc-out");
  if (g && out) {
    var upd = function () { var n = +g.value; out.textContent = n + " guests · $" + (n * 12).toLocaleString("en-US"); };
    g.addEventListener("input", upd);
  }

  /* menu page: section chips follow the scroll */
  var chips = $$(".chips a");
  if (chips.length && "IntersectionObserver" in window) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (c) {
          var on = c.getAttribute("href") === "#" + e.target.id; c.classList.toggle("on", on);
          if (on && c.parentNode.scrollTo) c.parentNode.scrollTo({ left: c.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$(".msec[id]").forEach(function (s) { secIO.observe(s); });
  }

  /* catering form: mailto if an address is set, otherwise show the request to read out or text */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["when", "Date"], ["guests", "Guests"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Catering request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Questions: call or text " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Call or text The Saucy Pig at " + tel + " with this request:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
