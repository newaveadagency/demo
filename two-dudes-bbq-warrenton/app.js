/* Two Dudes BBQ – site script (concept) */
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

  /* open / closed in Missouri time (America/Chicago) – Tue–Sat 11–19 */
  var HOURS = { 0: null, 1: null, 2: [11, 19], 3: [11, 19], 4: [11, 19], 5: [11, 19], 6: [11, 19] };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function shopNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: (+o.hour % 24) + (+o.minute) / 60 };
    } catch (e) { var n = new Date(); return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  function fmt(x) { var h = Math.floor(x); return (h > 12 ? h - 12 : h) + (h >= 12 ? " PM" : " AM"); }
  var now = shopNow();
  var row = $('.hours tr[data-day="' + now.d + '"]'); if (row) row.classList.add("today");
  $$(".status").forEach(function (st) {
    var stt = $(".status-txt", st); if (!stt || now.d < 0) return;
    var h = HOURS[now.d];
    if (h && now.h >= h[0] && now.h < h[1]) { stt.textContent = "Open now · until " + fmt(h[1]); return; }
    st.classList.add("closed");
    var txt = "";
    if (h && now.h < h[0]) txt = "today at " + fmt(h[0]);
    else for (var i = 1; i < 8; i++) { var d = (now.d + i) % 7; if (HOURS[d]) { txt = (i === 1 ? "tomorrow" : DAYS[d]) + " at " + fmt(HOURS[d][0]); break; } }
    stt.textContent = "Closed · opens " + txt;
  });

  /* shrinking header */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { if (nav) nav.classList.toggle("small", (window.scrollY || 0) > 40); ticking = false; });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var q = Math.min((t - t0) / dur, 1); el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered; hero headline lines one after another */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) items.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.07 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero .h1 .ln > [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* gentle tilt on menu cards (desktop pointer only) */
  if (!reduce && fine) {
    $$(".card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 5).toFixed(2) + "deg) rotateX(" + (-y * 5).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* how-much-meat estimate: 3–4 servings per pound (published on the catering sheet) */
  var g = $("#guests"), meat = $("#meat"), out = $(".calc-out"), gv = $(".g-val");
  if (g && meat && out) {
    var upd = function () {
      var n = +g.value, p = +meat.value, lo = Math.ceil(n / 4), hi = Math.ceil(n / 3);
      if (gv) gv.textContent = n;
      out.innerHTML = "<strong>" + lo + "–" + hi + " lb</strong><span>about $" + (lo * p).toLocaleString("en-US") + "–$" + (hi * p).toLocaleString("en-US") + " in meat before sides</span>";
    };
    g.addEventListener("input", upd); meat.addEventListener("change", upd); upd();
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
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$(".msec[id]").forEach(function (s) { secIO.observe(s); });
  }

  /* order request form: mailto if an address is set, otherwise show the request to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["when", "Date"], ["guests", "Guests"], ["message", "Order"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Catering request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Questions: call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Call Two Dudes BBQ at " + tel + " and read them this request:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
