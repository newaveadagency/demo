/* Smith's Flowers & Gifts – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onNav = function () { if (nav) nav.classList.toggle("small", window.scrollY > 30); };
  window.addEventListener("scroll", onNav, { passive: true }); onNav();

  /* staggered reveals */
  $$(".hero [data-anim], .phero [data-anim]").forEach(function (el, i) { el.style.transitionDelay = (0.08 + i * 0.11) + "s"; });
  $$(".stats [data-anim], .occ [data-anim], .dgrid [data-anim], .gifts [data-anim], .facts [data-anim], .ticks [data-anim], .steps [data-anim], .care [data-anim], .mason [data-anim]").forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 0.09) + "s"; });
  var anims = $$("[data-anim]");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target._a.forEach(function (a) { a.classList.add("in"); }); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    anims.forEach(function (el) {
      var t = el.getAttribute("data-anim") === "line" ? el.parentNode : el; /* masked lines: watch the mask */
      if (!t._a) { t._a = []; io.observe(t); }
      t._a.push(el);
    });
  } else anims.forEach(function (el) { el.classList.add("in"); });

  /* counters (final value is already in the HTML) */
  var runCount = function (el) {
    var end = +el.getAttribute("data-count"), t0 = null;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1500, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (el) { co.observe(el); });
  }

  /* kinetic rotating word */
  var rot = $(".rot");
  if (rot && !reduce) {
    var words = (rot.getAttribute("data-words") || "").split("|"), wi = 0;
    if (words.length > 1) setInterval(function () {
      rot.classList.add("out");
      setTimeout(function () { wi = (wi + 1) % words.length; rot.textContent = words[wi]; rot.classList.remove("out"); }, 350);
    }, 2400);
  }

  /* parallax (rAF + passive scroll) */
  var par = $$("[data-par]");
  if (!reduce && par.length) {
    var tick = false;
    var upd = function () {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect(), mid = r.top + r.height / 2 - innerHeight / 2;
        el.style.translate = "0 " + (mid * -(+el.getAttribute("data-par"))).toFixed(1) + "px";
      });
      tick = false;
    };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* horizontal gallery: pinned on wide screens, native swipe on phones */
  var bench = $(".bench"), track = $(".bench-track");
  if (bench && track && !reduce) {
    var mq = matchMedia("(min-width: 901px)"), dist = 0;
    var layout = function () {
      if (mq.matches) {
        root.classList.add("hz");
        track.style.transform = "";
        dist = Math.max(0, track.scrollWidth - track.clientWidth);
        bench.style.height = (innerHeight + dist) + "px";
        move();
      } else {
        root.classList.remove("hz");
        bench.style.height = ""; track.style.transform = "";
      }
    };
    var move = function () {
      if (!root.classList.contains("hz")) return;
      var top = bench.getBoundingClientRect().top, p = Math.min(Math.max(-top / Math.max(dist, 1), 0), 1);
      track.style.transform = "translate3d(" + (-p * dist).toFixed(1) + "px,0,0)";
    };
    window.addEventListener("scroll", move, { passive: true });
    window.addEventListener("resize", layout);
    window.addEventListener("load", layout);
    layout();
  }

  /* magnetic button */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    /* spotlight that follows the cursor on occasion tiles */
    $$(".tile").forEach(function (t) {
      t.addEventListener("mousemove", function (e) {
        var r = t.getBoundingClientRect();
        t.style.setProperty("--x", (e.clientX - r.left) + "px");
        t.style.setProperty("--y", (e.clientY - r.top) + "px");
      });
    });
  }

  /* open / closed badge (shop time = America/Detroit) */
  var badge = $(".open-now");
  if (badge) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Detroit", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
      var d = get("weekday"), m = (+get("hour") % 24) * 60 + +get("minute");
      var open = d === "Sun" ? false : d === "Sat" ? (m >= 540 && m < 900) : (m >= 480 && m < 1050);
      badge.textContent = open ? "Open now" : "Closed now";
      badge.classList.toggle("no", !open);
      badge.hidden = false;
    } catch (e) { /* leave hidden */ }
  }

  /* forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var data = {}, order = [];
      new FormData(fm).forEach(function (v, k) {
        v = String(v).trim(); if (!v) return;
        if (!(k in data)) { data[k] = []; order.push(k); }
        data[k].push(v);
      });
      var body = order.map(function (k) { return k + ": " + data[k].join(", "); }).join("\n");
      var subj = (fm.getAttribute("data-subject") || (data.Occasion ? data.Occasion[0] : "Flower question")) + " – " + (data.Name ? data.Name[0] : "");
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body + "\n\nSent from smithsflowers.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
