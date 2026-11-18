/* Brownlie Chiropractic – site script */
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

  /* header shrinks on scroll + photo parallax + timeline progress (one rAF loop) */
  var nav = $(".nav"), par = $$("[data-parallax]"), tl = $("[data-timeline]"), fill = tl && $(".fill", tl), ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = "scale(1.08) translateY(" + (p * -26).toFixed(1) + "px)";
    });
    if (fill) {
      var b = tl.getBoundingClientRect();
      var pr = Math.min(1, Math.max(0, (vh * 0.6 - b.top) / b.height));
      fill.style.setProperty("--p", reduce ? 1 : pr.toFixed(3));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  frame();

  /* spine path length for the line-drawing animation */
  $$('[data-anim="draw"] path').forEach(function (p) { try { p.parentNode.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });

  /* counters */
  function count(el) {
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0), t0 = null, dur = 1600;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* reveal on scroll */
  var items = $$("[data-anim]"), counters = $$("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    /* clipped elements (masked lines, clip-path photos) have no visible area yet, so watch their parent */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target._anim || [e.target]).forEach(function (el) { el.classList.add("in"); });
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) {
      var watch = el;
      if (el.getAttribute("data-anim") === "clip" || el.parentNode.classList.contains("ln")) watch = el.parentNode;
      if (watch !== el) { (watch._anim = watch._anim || []).push(el); }
      io.observe(watch);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  /* FAQ: smooth open/close */
  $$(".faq details").forEach(function (d) {
    var s = $("summary", d), a = $(".a", d);
    s.addEventListener("click", function (ev) {
      if (reduce || !a.animate) return;
      ev.preventDefault();
      if (d.open) {
        var h = a.offsetHeight;
        a.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 300, easing: "ease" }).onfinish = function () { d.open = false; };
      } else {
        d.open = true;
        var h2 = a.offsetHeight;
        a.animate([{ height: "0px", opacity: 0 }, { height: h2 + "px", opacity: 1 }], { duration: 350, easing: "ease" });
      }
    });
  });

  /* open / closed status and today's row (Arizona time, no DST) */
  var sched = { 1: [8, 17], 2: [9, 12], 3: [8, 17], 5: [8, 17] };
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday"));
    var h = (+g("hour") % 24) + (+g("minute")) / 60, today = sched[day];
    var open = !!(today && h >= today[0] && h < today[1]);
    $$("[data-open]").forEach(function (el) {
      var st = $(".st", el);
      el.classList.toggle("open", open);
      if (st) st.textContent = open ? "Open now · until " + (today[1] === 12 ? "noon" : (today[1] - 12) + " pm") : "Closed now · Mon, Wed, Fri 8–5 · Tue 9–noon";
    });
    $$("[data-hours] tr").forEach(function (tr) { if (+tr.getAttribute("data-d") === day) tr.classList.add("today"); });
  } catch (e) {}

  /* appointment request → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Reason for visit"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var days = f.getAll("days"); if (days.length) body.push("Preferred days: " + days.join(", "));
      if (f.get("message")) body.push("\n" + f.get("message"));
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Appointment request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from brownliechiropractic.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
