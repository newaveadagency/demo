/* Therapy Coffee – site script */
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
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* open / closed in shop time (America/New_York); decimal 24h */
  var HOURS = { 0: [7.5, 14], 1: null, 2: [6, 14], 3: [6, 14], 4: [6, 14], 5: [6, 14], 6: [7.5, 14] };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function shopNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
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

  /* scroll: shrinking header, photo parallax, record spins with the scroll */
  var plx = $(".plx"), vinyl = $(".vinyl"), ticking = false, spin = 0, lastY = window.scrollY || 0;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        if (plx) {
          var r = plx.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + ((r.top - innerHeight / 3) * -0.07).toFixed(1) + "px,0) scale(1.1)";
        }
        spin += (y - lastY) * 0.35;
      }
      lastY = y; ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  /* slow idle rotation like a turntable (33 1/3 feel), plus scroll boost */
  if (vinyl && !reduce) {
    var t0 = null;
    (function turn(t) {
      if (!t0) t0 = t;
      var a = ((t - t0) / 1000) * 24 + spin;
      vinyl.style.transform = "rotate(" + (a % 360).toFixed(2) + "deg)";
      requestAnimationFrame(turn);
    })(performance.now());
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) items.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: lines rise out of a mask one after another */
    $$(".h1 .ln > [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 170); });
  }

  /* gentle tilt on cards (desktop pointer only) */
  if (!reduce && fine) {
    $$(".card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transition = "transform .1s, box-shadow .35s";
        c.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transition = ""; c.style.transform = ""; });
    });
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

  /* order form: mailto when an address is set, otherwise show the request to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["what", "Order"], ["when", "Pick-up date"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Order request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Questions: call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + "! Call Therapy Coffee at " + tel + " to confirm:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
