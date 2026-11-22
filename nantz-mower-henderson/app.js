/* Nantz Mower & Small Engine – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o ? "true" : "false"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header, photo parallax, gear turning with scroll (rAF + passive scroll) */
  var plx = $$(".plx"), gears = $$(".spin-scroll"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (!reduce) {
        plx.forEach(function (im) {
          var r = im.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight) im.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -0.07).toFixed(1) + "px,0)";
        });
        gears.forEach(function (g) { g.style.transform = "rotate(" + (y * 0.08).toFixed(1) + "deg)"; });
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value already in HTML; years count up from 60 below) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1600, start = end > 1000 ? end - 60 : 0;
    if (!end) return;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* SVG line drawing */
  $$(".draw").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength() * 1.02)); } catch (e) {} });

  /* reveal on scroll with stagger */
  var items = $$("[data-anim]"), draws = $$(".draw");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    draws.forEach(function (d) { d.classList.add("drawn"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.classList.contains("draw")) { el.classList.add("drawn"); io.unobserve(el); return; }
        var sib = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.hasAttribute("data-anim"); }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.1 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).concat(el.hasAttribute("data-count") ? [el] : []).forEach(count);
        setTimeout(function () { el.style.transitionDelay = ""; }, 1800);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    draws.forEach(function (d) { io.observe(d); });
    /* hero lines rise one after another */
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* open now (Tue–Fri 9–16, Sat 9–12, Central Time) */
  var openEl = $("[data-open]");
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), h = (+get("hour") % 24) + (+get("minute")) / 60;
    var hrs = { 2: [9, 16], 3: [9, 16], 4: [9, 16], 5: [9, 16], 6: [9, 12] }, today = hrs[day];
    var isOpen = !!today && h >= today[0] && h < today[1];
    var row = $('.hours tr[data-day="' + day + '"]'); if (row) row.classList.add("today");
    if (openEl) {
      var wrap = openEl.parentNode;
      wrap.classList.add(isOpen ? "is-open" : "is-closed");
      openEl.textContent = isOpen ? "Open now · until " + (today[1] === 12 ? "noon" : "4 pm") + " today" : "Closed now · Tue–Fri 9 am – 4 pm, Sat 9 am – noon";
    }
  } catch (e) {}

  /* lead form: prepares an email when an address is set, otherwise points to the phone */
  $$(".lead-form").forEach(function (f) {
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(f), mail = f.getAttribute("data-mail") || "";
      if (!d.get("name") || !d.get("phone")) { var inp = f.querySelector(":invalid") || f.querySelector("input"); if (inp) inp.focus(); return; }
      var body = "Name: " + d.get("name") + "\nPhone: " + d.get("phone") + "\nRequest: " + d.get("type") + "\nEquipment / model / serial: " + (d.get("equipment") || "-") + "\n\n" + (d.get("message") || "");
      if (mail) location.href = "mailto:" + mail + "?subject=" + encodeURIComponent(d.get("type") + " – " + d.get("name")) + "&body=" + encodeURIComponent(body);
      f.classList.add("sent");
    });
  });
})();
