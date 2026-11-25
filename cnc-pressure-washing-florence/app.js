/* CnC Pressure Washing & Cleaning Services – site script (concept) */
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

  /* open now (Mon–Sat 6:00–17:30, Eastern) + today's row in the hours table */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var get = function (t) { return (parts.filter(function (p) { return p.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    var mins = (+get("hour") % 24) * 60 + +get("minute");
    var open = day >= 1 && day <= 6 && mins >= 360 && mins < 1050;
    $$("[data-open]").forEach(function (c) {
      var t = $(".open-txt", c);
      c.classList.toggle("closed", !open);
      if (t) t.textContent = open ? "Open now · until 5:30 PM" : "Closed now · Mon–Sat from 6 AM";
    });
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-d") === day); });
  } catch (e) {}

  /* horizontal gallery pinned to vertical scroll (wide screens, motion allowed) */
  var hg = $(".hgal"), hgTrack = hg && $(".track", hg), pinOn = false;
  function setupPin() {
    if (!hg || !hgTrack) return;
    var want = !reduce && innerWidth > 900;
    if (want !== pinOn) { pinOn = want; hg.classList.toggle("pin", want); if (!want) { hgTrack.style.transform = ""; hg.style.removeProperty("--pinh"); } }
    if (pinOn) {
      var extra = Math.max(0, hgTrack.scrollWidth - innerWidth + 40);
      hg.style.setProperty("--pinh", (innerHeight + extra) + "px");
      hg._extra = extra;
    }
  }
  setupPin(); addEventListener("resize", setupPin);

  /* one rAF per scroll: shrinking header, progress bar, gallery translate */
  var ticking = false;
  function frame() {
    var y = window.scrollY || 0, h = document.documentElement.scrollHeight - innerHeight;
    if (nav) { nav.classList.toggle("small", y > 40); nav.style.setProperty("--prog", (h > 0 ? y / h * 100 : 0).toFixed(1) + "%"); }
    if (pinOn && hg._extra) {
      var r = hg.getBoundingClientRect(), total = r.height - innerHeight;
      var p = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 0;
      hgTrack.style.transform = "translateX(" + (-p * hg._extra).toFixed(1) + "px)";
    }
    ticking = false;
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* counters (final value already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var q = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* before / after sliders; each one sweeps once when it first comes into view */
  function sweep(ba) {
    if (reduce || ba._swept) return; ba._swept = true;
    var r = $("input", ba), t0 = null, dur = 1700;
    function step(t) {
      if (ba._touched) return;
      if (!t0) t0 = t; var q = Math.min((t - t0) / dur, 1);
      var v = 50 + Math.sin(q * Math.PI * 2) * 32 * (1 - q);
      r.value = v; ba.style.setProperty("--x", v + "%");
      if (q < 1) requestAnimationFrame(step); else { r.value = 50; ba.style.setProperty("--x", "50%"); }
    }
    requestAnimationFrame(step);
  }
  var bas = $$(".ba");
  bas.forEach(function (ba) {
    var r = $("input", ba);
    if (!r) return;
    var set = function () { ba._touched = true; ba.style.setProperty("--x", r.value + "%"); };
    r.addEventListener("input", set);
  });

  /* reveal on scroll, staggered; hero headline lines one after another */
  var items = $$("[data-anim]");
  var steps = $(".steps");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    if (steps) steps.classList.add("drawn");
  } else {
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
    $$(".h1 .ln > [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 200); });
    var bo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var ba = e.target; setTimeout(function () { sweep(ba); }, 600); bo.unobserve(ba); } });
    }, { threshold: 0.55 });
    bas.forEach(function (ba) { bo.observe(ba); });
    if (steps) {
      var so = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { steps.classList.add("drawn"); so.disconnect(); } }, { threshold: 0.3 });
      so.observe(steps);
    }
  }

  /* magnetic call buttons + service card tilt (desktop pointer only) */
  if (!reduce && fine) {
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".svc").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) translateY(-6px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* FAQ: keep one open at a time */
  var dets = $$(".faq details");
  dets.forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) dets.forEach(function (o) { if (o !== d) o.open = false; }); }); });

  /* quote form: mailto if an address is set, otherwise show the request to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["city", "Address/area"], ["service", "Service"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Quote request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Questions: call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Call CnC at " + tel + " and read them this request:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
