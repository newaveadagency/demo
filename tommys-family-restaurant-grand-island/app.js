/* Tommy's Family Restaurant – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      setNavH();
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o);
      burger.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + photo parallax (rAF, passive listener) */
  var plx = $$(".plx"), collage = $(".collage"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        plx.forEach(function (p) {
          var r = p.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight) p.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -0.12).toFixed(1) + "px,0)";
        });
        if (collage && y < innerHeight * 1.2) collage.style.transform = "translate3d(0," + (y * 0.08).toFixed(1) + "px,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1600;
    if (!end) return;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll with a small stagger between siblings */
  var items = $$("[data-anim]");
  var line = $(".tl-line");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    if (line) line.classList.add("in");
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        if (!el.closest(".hero")) el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 150); });
    if (line) {
      var lio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { line.classList.add("in"); lio.disconnect(); } }, { threshold: 0.4 });
      lio.observe(line);
    }
  }

  /* magnetic buttons */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* menu page: highlight the category chip in view */
  var chips = $$(".chips a");
  if (chips.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (c) { c.classList.toggle("on", c.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    $$(".mcat").forEach(function (s) { cio.observe(s); });
  }

  /* open / closed + today's special (Central time), daily 6:00–20:00 */
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var isOpen = h >= 6 && h < 20;
    $$("[data-open]").forEach(function (el) {
      el.classList.toggle("is-open", isOpen);
      el.textContent = isOpen ? "Open now · until 8 pm · breakfast served any hour"
        : h < 6 ? "Opens today at 6 am" : "Closed now · open tomorrow at 6 am";
    });
    $$("[data-day]").forEach(function (el) { if (+el.getAttribute("data-day") === d) el.classList.add("today"); });
    $$("[data-hours] tr").forEach(function (tr) { if (tr.getAttribute("data-d") === String(d)) tr.classList.add("now"); });
  } catch (e) {}
})();
