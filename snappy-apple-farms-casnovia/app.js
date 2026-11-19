/* Snappy Apple Farm Market – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* open / closed (market time, America/Detroit). Season: August to early November */
  var HOURS = { 0: [11, 17.5], 1: null, 2: null, 3: [9, 17.5], 4: [9, 17.5], 5: [9, 17.5], 6: [9, 17] };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function marketNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Detroit", weekday: "short", month: "numeric", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), m: +o.month, h: (+o.hour % 24) + (+o.minute) / 60 };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getMonth() + 1, h: n.getHours() + n.getMinutes() / 60 }; }
  }
  function fmt(x) { var hh = Math.floor(x), mm = Math.round((x - hh) * 60); return (hh > 12 ? hh - 12 : hh) + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + (hh >= 12 ? " PM" : " AM"); }
  var now = marketNow();
  var row = $('.hours tr[data-day="' + now.d + '"]'); if (row) row.classList.add("today");
  var st = $(".status"), stt = $(".status-txt");
  if (st && stt && now.d >= 0) {
    if (now.m < 8 || now.m > 11) { st.classList.add("closed"); stt.textContent = "Closed for the season · see you in August"; }
    else {
      var h = HOURS[now.d];
      if (h && now.h >= h[0] && now.h < h[1]) { st.classList.add("open"); stt.textContent = "Open now · until " + fmt(h[1]); }
      else {
        st.classList.add("closed");
        var txt = "";
        if (h && now.h < h[0]) txt = "today at " + fmt(h[0]);
        else for (var k = 1; k < 7; k++) { var dd = (now.d + k) % 7; if (HOURS[dd]) { txt = (k === 1 ? "tomorrow" : DAYS[dd]) + " at " + fmt(HOURS[dd][0]); break; } }
        stt.textContent = "Closed now · opens " + txt;
      }
    }
  }

  /* scroll: shrinking header, crate photo parallax, spinning logo badge, season line drawing */
  var plx = $(".plx"), spin = $(".badge .spin"), tl = $(".tl"), path = $(".tl-line path"), len = 0, ticking = false;
  if (path && !reduce) { len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len; }
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        if (plx) {
          var r = plx.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + ((r.top - innerHeight / 2) * -0.08).toFixed(1) + "px,0) scale(1.12)";
        }
        if (spin) spin.setAttribute("transform", "rotate(" + (y * 0.18).toFixed(1) + " 100 100)");
        if (tl && path && len) {
          var b = tl.getBoundingClientRect(), p = (innerHeight * 0.85 - b.top) / (b.height * 0.8);
          p = Math.max(0, Math.min(1, p)); path.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
        }
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* apple outline drawing on the market page */
  if (!reduce) $$(".phero-apple .draw").forEach(function (p, i) {
    var l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l;
    p.style.transition = "stroke-dashoffset 1.8s cubic-bezier(.4,.1,.2,1) " + (0.3 + i * 0.5) + "s";
    requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = 0; }); });
  });

  /* counters (final value already in HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0), t0 = null, dur = 1600;
    function step(t) { if (!t0) t0 = t; var q = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - q, 3); el.textContent = Math.round(from + (end - from) * e); if (q < 1) requestAnimationFrame(step); }
    el.textContent = from; requestAnimationFrame(step);
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
    $$(".hero-h [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 180); });
  }

  /* card tilt + magnetic hero buttons (desktop pointer only) */
  if (!reduce && fine) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".hero-ctas .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* question form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["topic", "About"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Question from the website – " + f.get("topic")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the message filled in. In a hurry? Call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Please call " + tel + " with your question."; ok.style.display = "block";
      }
    });
  });
})();
