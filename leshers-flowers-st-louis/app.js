/* Lesher's Flowers – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  $$(".hero [data-anim], .phero [data-anim]").forEach(function (el, i) { el.style.transitionDelay = (0.1 + i * 0.1) + "s"; });
  $$(".path [data-anim], .steps3 [data-anim], .occ [data-anim], .sym [data-anim], .wt [data-anim]").forEach(function (el, i) { el.style.transitionDelay = ((i % 5) * 0.08) + "s"; });
  var anims = $$("[data-anim]");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target._a.forEach(function (a) { a.classList.add("in"); }); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    anims.forEach(function (el) {
      /* masked lines sit outside their clipping parent, so watch the parent instead */
      var t = el.getAttribute("data-anim") === "line" ? el.parentNode : el;
      if (!t._a) { t._a = []; io.observe(t); }
      t._a.push(el);
    });
  } else anims.forEach(function (el) { el.classList.add("in"); });

  /* counters */
  var runCount = function (el) {
    var end = +el.getAttribute("data-count"), start = +(el.getAttribute("data-from") || 0), t0 = null;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1600, 1);
      el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var counters = $$("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* gentle parallax on hero photos */
  var par = $$("[data-par]");
  if (!reduce && par.length) {
    var ticking = false;
    var upd = function () {
      var y = Math.min(window.scrollY, 900);
      par.forEach(function (el) { el.style.translate = "0 " + (y * +el.getAttribute("data-par")).toFixed(1) + "px"; });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  }

  /* open / closed badge (shop time = America/Chicago) */
  var badge = $(".open-now");
  if (badge) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
      var d = get("weekday"), m = (+get("hour") % 24) * 60 + +get("minute");
      var close = d === "Sun" ? 0 : d === "Sat" ? 15 * 60 : 16 * 60 + 30;
      var open = close && m >= 8 * 60 && m < close;
      badge.textContent = open ? "Open now" : "Closed now";
      badge.classList.toggle("no", !open);
      badge.hidden = false;
    } catch (e) { /* leave hidden */ }
  }

  /* gallery filter */
  var filters = $$(".filters button");
  filters.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      filters.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$("#gal figure").forEach(function (fig) {
        var show = f === "all" || fig.getAttribute("data-cat") === f;
        fig.classList.toggle("hide", !show);
        if (show) fig.classList.add("in");
      });
    });
  });

  /* lightbox */
  var lb = $(".lb");
  if (lb) {
    var lbImg = $("img", lb), lbBtn = $("button", lb), last = null;
    var shut = function () { lb.classList.remove("open"); lbImg.removeAttribute("src"); if (last) last.focus(); };
    $$("[data-full]").forEach(function (b) {
      b.addEventListener("click", function () { last = b; lbImg.src = b.getAttribute("data-full"); lbImg.alt = $("img", b).alt; lb.classList.add("open"); lbBtn.focus(); });
    });
    lbBtn.addEventListener("click", shut);
    lb.addEventListener("click", function (e) { if (e.target === lb) shut(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) shut(); });
  }

  /* forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["occasion", "Occasion"], ["date", "Date"], ["venue", "Venue"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent((f.get("occasion") || "Flower question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from leshersflowers.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
