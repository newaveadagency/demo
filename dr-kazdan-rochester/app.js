/* Dr. Cary A. Kazdan & Associates – site script */
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

  /* header shrink + hero parallax + timeline line drawing (one rAF loop, passive scroll) */
  var plx = $(".plx"), tl = $(".tl"), tlPath = $(".tl-line path"), ticking = false;
  if (tlPath) tlPath.style.setProperty("--len", 1000);
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) { var was = nav.classList.contains("small"); nav.classList.toggle("small", y > 50); if (was !== nav.classList.contains("small")) setTimeout(setNavH, 380); }
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) plx.style.transform = "scale(1.08) translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -0.06).toFixed(1) + "px,0)";
      }
      if (tl && tlPath && !reduce) {
        var t = tl.getBoundingClientRect(), p = (vh * 0.75 - t.top) / t.height;
        p = Math.max(0, Math.min(1, p));
        tlPath.style.strokeDashoffset = (1000 * (1 - p)).toFixed(0);
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – the final value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
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
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* iris badge: the pupil follows the cursor */
  var pupil = $(".iris-badge .pupil"), badge = $(".iris-badge");
  if (pupil && badge && fine && !reduce) {
    addEventListener("mousemove", function (e) {
      var r = badge.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, m = Math.min(16, d / 18);
      pupil.style.transform = "translate(" + (dx / d * m).toFixed(1) + "px," + (dy / d * m).toFixed(1) + "px)";
    }, { passive: true });
  }

  /* magnetic buttons + card tilt */
  if (fine && !reduce) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(800px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open now / closed for each office (Eastern time, lunch 12:30–1:30) */
  var HOURS = {
    roc: { name: "Rochester", d: { Mon: [9, 19.5], Tue: [9, 17.5], Wed: [9, 17.5], Thu: [9, 17.5], Fri: [9, 16] } },
    spe: { name: "Spencerport", d: { Mon: [9.5, 17.5], Tue: [9.5, 17.5], Thu: [9.5, 20], Fri: [9.5, 17.5] } }
  };
  var now = null;
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    now = { day: g("weekday"), h: (+g("hour") % 24) + g("minute") / 60 };
  } catch (e) {}
  function fmt(h) { var hh = Math.floor(h), mm = Math.round((h - hh) * 60), ap = hh >= 12 ? "pm" : "am"; hh = hh % 12 || 12; return hh + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + " " + ap; }
  $$("[data-open]").forEach(function (el) {
    var o = HOURS[el.getAttribute("data-open")]; if (!o || !now) return;
    var t = o.d[now.day], txt;
    if (t && now.h >= t[0] && now.h < t[1]) {
      if (now.h >= 12.5 && now.h < 13.5) txt = o.name + ": lunch break until 1:30 pm";
      else { txt = o.name + ": open now until " + fmt(t[1]); el.classList.add("is-open"); }
    } else txt = o.name + ": closed now";
    el.textContent = txt;
  });
  if (now) $$("[data-hours]").forEach(function (tb) {
    var map = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }, row = $$("tr", tb)[map[now.day]];
    if (row) row.classList.add("today");
  });

  /* services sub-navigation: highlight the current section */
  var sub = $$(".subnav a");
  if (sub.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        sub.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + e.target.id;
          a.classList.toggle("cur", on);
          if (on && a.scrollIntoView && a.parentNode.scrollWidth > a.parentNode.clientWidth) a.parentNode.scrollTo({ left: a.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" });
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sub.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) so.observe(s); });
  }

  /* appointment form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      f.forEach(function (v, k) { if (String(v).trim()) body.push(k + ": " + v); });
      var subj = (fm.getAttribute("data-subject") || "Website request") + " – " + (f.get("Name") || "");
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n") + "\n\n(Sent from the website)");
    });
  });
})();
