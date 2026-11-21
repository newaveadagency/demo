/* Nuttall's Towing – site script (concept) */
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

  /* office status in Arizona time (America/Phoenix, no DST). Towing itself is 24/7. */
  var HOURS = { 0: null, 1: [7.5, 18], 2: [7.5, 18], 3: [7.5, 18], 4: [7.5, 18], 5: [7.5, 18], 6: [8, 12] };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function azNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: (+o.hour % 24) + (+o.minute) / 60 };
    } catch (e) { var n = new Date(); return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  function fmt(x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h > 12 ? h - 12 : h) + (m ? ":" + (m < 10 ? "0" : "") + m : "") + (h >= 12 ? " PM" : " AM"); }
  var now = azNow();
  var row = $('.hours tr[data-day="' + now.d + '"]') || (now.d >= 1 && now.d <= 5 ? $(".hours tr.wk") : null); if (row) row.classList.add("today");
  $$(".status").forEach(function (st) {
    var t = $(".status-txt", st); if (!t || now.d < 0) return;
    var h = HOURS[now.d];
    if (h && now.h >= h[0] && now.h < h[1]) { t.textContent = "Towing 24/7 · Office open until " + fmt(h[1]); return; }
    st.classList.add("office-closed");
    var nxt = "";
    if (h && now.h < h[0]) nxt = "today " + fmt(h[0]);
    else for (var i = 1; i < 8; i++) { var d = (now.d + i) % 7; if (HOURS[d]) { nxt = (i === 1 ? "tomorrow " : DAYS[d] + " ") + fmt(HOURS[d][0]); break; } }
    t.textContent = "Towing 24/7 · Office opens " + nxt;
  });

  /* shrinking header + photo parallax + truck along the road (one rAF per scroll) */
  var par = $(".parallax"), road = $(".road"), truck = $(".truck"), ticking = false;
  function frame() {
    var y = window.scrollY || 0, vh = innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce && par) {
      var r = par.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) par.style.transform = "translateY(" + (((r.top + r.height / 2) - vh / 2) * -0.08 - r.height * 0.06).toFixed(1) + "px)";
    }
    if (road && truck) {
      var rr = road.getBoundingClientRect(), q = reduce ? 1 : Math.min(1, Math.max(0, (vh - rr.top) / (vh * 0.75)));
      truck.style.setProperty("--tx", ((rr.width - truck.getBoundingClientRect().width) * q).toFixed(0) + "px");
    }
    ticking = false;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); frame();

  /* counters (final value already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 60 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var q = Math.min((t - t0) / dur, 1); el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered; hero lines one after another */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) items.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".h1 .ln > [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 170); });
  }

  /* card tilt + magnetic call button (desktop pointer only) */
  if (!reduce && fine) {
    $$(".card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translate(-3px,-3px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* only one FAQ open at a time */
  var dets = $$(".faq details");
  dets.forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) dets.forEach(function (o) { if (o !== d) o.open = false; }); }); });

  /* estimate form: mailto if an address is set, otherwise show the request to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["vehicle", "Vehicle"], ["from", "From"], ["to", "To"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Tow estimate request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. In a hurry? Call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Call Nuttall's Towing at " + tel + " and read them this:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
