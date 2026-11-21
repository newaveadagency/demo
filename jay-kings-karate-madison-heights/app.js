/* Jay King's Okinawan Karate Dojo – site script (concept) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  setNavH(); addEventListener("resize", setNavH);

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* open / closed in Virginia time – Mon–Fri 3–9 PM */
  var HOURS = { 0: null, 1: [15, 21], 2: [15, 21], 3: [15, 21], 4: [15, 21], 5: [15, 21], 6: null };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function dojoNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: (+o.hour % 24) + (+o.minute) / 60 };
    } catch (e) { var n = new Date(); return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  function fmt(x) { var h = Math.floor(x); return (h > 12 ? h - 12 : h) + (h >= 12 ? " PM" : " AM"); }
  var now = dojoNow();
  var row = $('.hours tr[data-day="' + now.d + '"]'); if (row) row.classList.add("today");
  $$(".status").forEach(function (st) {
    var t = $(".status-txt", st); if (!t || now.d < 0) return;
    var h = HOURS[now.d];
    if (h && now.h >= h[0] && now.h < h[1]) { t.textContent = "Open now · until " + fmt(h[1]); return; }
    st.classList.add("closed");
    var txt = "";
    if (h && now.h < h[0]) txt = "today " + fmt(h[0]);
    else for (var i = 1; i < 8; i++) { var d = (now.d + i) % 7; if (HOURS[d]) { txt = (i === 1 ? "tomorrow" : DAYS[d]) + " " + fmt(HOURS[d][0]); break; } }
    t.textContent = "Closed · opens " + txt;
  });

  /* shrinking header + timeline line drawn with the scroll */
  var tl = $(".tl"), tlPath = tl && $(".time-line path", tl), tlLen = 0;
  function layoutLine() {
    if (!tlPath) return;
    var dots = $$(".yr", tl); if (dots.length < 2) return;
    var top = tl.getBoundingClientRect().top;
    var y0 = dots[0].getBoundingClientRect().top - top + 14, y1 = dots[dots.length - 1].getBoundingClientRect().top - top + 14;
    tlPath.setAttribute("d", "M7 " + y0.toFixed(1) + "V" + y1.toFixed(1));
    tlLen = Math.max(1, y1 - y0);
    tlPath.style.strokeDasharray = tlLen;
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      if (nav) nav.classList.toggle("small", (window.scrollY || 0) > 40);
      if (tlPath && tlLen) {
        var r = tl.getBoundingClientRect(), vh = innerHeight;
        var p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
        tlPath.style.strokeDashoffset = (tlLen * (1 - p)).toFixed(1);
      }
      ticking = false;
    });
  }
  layoutLine();
  addEventListener("resize", function () { layoutLine(); onScroll(); });
  addEventListener("load", function () { layoutLine(); onScroll(); });
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1200;
    function step(t) { if (!t0) t0 = t; var q = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered; hero headline lines one after another */
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

  /* hero badge follows the pointer a little (desktop) */
  var patch = $(".patch");
  if (patch && !reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var hero = $(".hero");
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      patch.style.transform = "translate(" + (x * 14).toFixed(1) + "px," + (y * 14).toFixed(1) + "px) rotate(" + (x * 6).toFixed(1) + "deg)";
    });
    hero.addEventListener("mouseleave", function () { patch.style.transform = ""; });
  }

  /* age picker → matching program */
  var age = $("#age"), agev = $("#agev"), out = $("#ageout"), progs = $$(".prog[data-min]");
  if (age && out) {
    var upd = function () {
      var a = +age.value, hit = null;
      if (agev) agev.textContent = a >= 60 ? "60+" : a;
      progs.forEach(function (p) { var on = a >= +p.getAttribute("data-min") && a <= +p.getAttribute("data-max"); p.classList.toggle("active", on); if (on) hit = p; });
      out.textContent = "→ " + (hit ? $(".tag", hit).textContent : "Call us");
    };
    age.addEventListener("input", upd); upd();
  }

  /* inquiry form: prepares an email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["program", "Program"], ["age", "Student's age"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Karate class inquiry – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the message filled in. Questions? Call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Please call " + tel + " and mention:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
