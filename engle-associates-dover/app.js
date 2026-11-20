/* Richard L. Engle Jr. & Associates – site script */
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

  /* office status + deadline countdown, Dover (America/New_York) time */
  function nyNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", year: "numeric", month: "numeric", day: "numeric", hour12: false }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      return { wd: o.weekday, h: +o.hour % 24, m: +o.minute, y: +o.year, mo: +o.month, d: +o.day };
    } catch (e) { var n = new Date(); return { wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][n.getDay()], h: n.getHours(), m: n.getMinutes(), y: n.getFullYear(), mo: n.getMonth() + 1, d: n.getDate() }; }
  }
  var t = nyNow(), st = $("[data-status]"), dot = $("[data-status-dot]");
  if (st) {
    var weekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(t.wd) > -1, mins = t.h * 60 + t.m;
    if (weekday && mins >= 480 && mins < 990) { st.textContent = "Open now · until 4:30 PM"; if (dot) dot.classList.add("open"); }
    else if (weekday && mins < 480) st.textContent = "Opens today at 8:00 AM";
    else st.textContent = "Closed now · Mon–Fri 8:00 AM – 4:30 PM";
  }
  var dd = $("[data-days]");
  if (dd) {
    var today = Date.UTC(t.y, t.mo - 1, t.d), yr = t.y, dl = Date.UTC(yr, 3, 15);
    if (today > dl) { yr++; dl = Date.UTC(yr, 3, 15); }
    dd.textContent = Math.round((dl - today) / 864e5);
    var dts = $(".dl-date");
    if (dts) dts.textContent = new Date(dl).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  /* scroll: shrinking header + photo parallax (rAF, passive) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      if (nav) nav.classList.toggle("small", (window.scrollY || 0) > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -0.07).toFixed(1) + "px,0) scale(1.12)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1200;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll (staggered), SVG line draw */
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
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    if (line) io.observe(line);
    var heroSeq = $$(".hero-h [data-anim], .page-hero .h1 [data-anim], .mono [data-anim]");
    heroSeq.forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.style.transitionDelay = "0s"; el.classList.add("in"); }, 120 + i * 140); });
  }

  /* cursor spotlight on glass, magnetic buttons, card tilt (fine pointer only) */
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

  /* checklist progress ring */
  $$(".list").forEach(function (list) {
    var boxes = $$("input[type=checkbox]", list), sec = list.closest("section") || document;
    var fg = $(".ring-fg", sec), done = $("[data-done]", sec), tot = $("[data-total]", sec);
    if (tot) tot.textContent = boxes.length;
    function upd() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      if (done) done.textContent = n;
      if (fg) fg.style.strokeDashoffset = 100 - (boxes.length ? n / boxes.length * 100 : 0);
    }
    boxes.forEach(function (b) { b.addEventListener("change", upd); }); upd();
  });

  /* request form: email if an address is set, otherwise show a call summary */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Help with"], ["when", "Best time to call"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Appointment request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. You can also call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Have this handy and call the office at " + tel + " (Mon–Fri 8–4:30):\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
