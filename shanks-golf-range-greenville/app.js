/* Shank's Golf Range – site script */
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

  /* open / closed (range time, America/New_York). Monday closing time unconfirmed -> no "until". */
  var OPEN = 8, CLOSE = 18;
  function rangeNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: (+o.hour % 24) + (+o.minute) / 60 };
    } catch (e) { var n = new Date(); return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  var now = rangeNow();
  $$('.hours tr[data-day="' + now.d + '"]').forEach(function (r) { r.classList.add("today"); });
  var st = $(".status"), stt = $(".status-txt");
  if (st && stt && now.d >= 0) {
    if (now.d === 1 && now.h >= OPEN) {
      stt.textContent = "Monday · open from 8 AM, call for closing time";
    } else if (now.h >= OPEN && now.h < CLOSE) {
      stt.textContent = "Open now · until 6 PM";
    } else {
      st.classList.add("closed");
      stt.textContent = "Closed now · opens " + (now.h < OPEN ? "today" : "tomorrow") + " at 8 AM";
    }
  }

  /* scroll: shrinking header, postcard parallax, rotating stamp, ball flight */
  var plx = $(".plx"), stamp = $(".stamp-rot"), hero = $(".hero"), fpath = $(".flight path"), ball = $(".ball"), flen = 0, ticking = false, t0 = null;
  if (fpath && !reduce) { flen = fpath.getTotalLength(); fpath.style.strokeDasharray = flen; fpath.style.strokeDashoffset = flen; }
  function placeBall(q) {
    if (!ball || !fpath || !flen) return;
    var svg = fpath.ownerSVGElement, r = svg.getBoundingClientRect(), hr = hero.getBoundingClientRect();
    var pt = fpath.getPointAtLength(flen * q);
    ball.style.opacity = q > 0.01 && q < 0.995 ? 1 : 0;
    ball.style.transform = "translate(" + (r.left - hr.left + pt.x / 1440 * r.width).toFixed(1) + "px," + (r.top - hr.top + pt.y / 220 * r.height).toFixed(1) + "px)";
  }
  function flight(t) { // one shot across the hero after load
    if (!t0) t0 = t;
    var q = Math.min((t - t0) / 2600, 1), e = 1 - Math.pow(1 - q, 2);
    fpath.style.strokeDashoffset = (flen * (1 - e)).toFixed(1); placeBall(e);
    if (q < 1) requestAnimationFrame(flight);
  }
  if (flen) setTimeout(function () { requestAnimationFrame(flight); }, 700);

  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        if (plx) {
          var r = plx.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + ((r.top - innerHeight / 2) * -0.08).toFixed(1) + "px,0) scale(1.14)";
        }
        if (stamp) stamp.setAttribute("transform", "rotate(" + (y * 0.25).toFixed(1) + " 60 60)");
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* counters (final value already in HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), s0 = null, dur = 1300;
    function step(t) { if (!s0) s0 = t; var q = Math.min((t - s0) / dur, 1), e = 1 - Math.pow(1 - q, 3); el.textContent = Math.round(end * e); if (q < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 220); });
  }

  /* card tilt + magnetic hero buttons (desktop pointer only) */
  if (!reduce && fine) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(800px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg) translateY(-4px)"; c.style.boxShadow = (10 - x * 8).toFixed(0) + "px " + (10 - y * 8).toFixed(0) + "px 0 #b23a26"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; c.style.boxShadow = ""; });
    });
    $$(".hero-ctas .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* call-ahead note: email if an address is set, otherwise show the note to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["day", "Day"], ["group", "Golfers"], ["message", "Question"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Range question – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the note filled in. Or call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Call the range at " + tel + " and read out your note:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
