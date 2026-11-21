/* Kinchley's Tavern – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrink + arch photo parallax (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (-6 + (r.top / innerHeight) * -40).toFixed(1) + "px,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – final value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? 1900 : 0, t0 = null, dur = 1700;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* SVG timeline line draws itself */
  var line = $(".tl-line .draw");
  if (line && !reduce) { line.style.strokeDasharray = "1"; line.style.strokeDashoffset = "1"; }

  /* reveal on scroll with sibling stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).concat(el.hasAttribute("data-count") ? [el] : []).forEach(count);
        if (line && el.classList.contains("tl-item")) { line.style.transition = "stroke-dashoffset 2.4s cubic-bezier(.6,0,.2,1)"; line.style.strokeDashoffset = "0"; }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* magnetic buttons + tilt cards (hover devices only) */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(800px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* FAQ: keep one open */
  $$(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".faq details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* open now (Eastern time): Mon–Thu 11–22, Fri–Sat 11–23, Sun 12–22; closed Dec 25 */
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var xmas = g("month") === "12" && g("day") === "25";
    var hrs = [[12, 22], [11, 22], [11, 22], [11, 22], [11, 22], [11, 23], [11, 23]][d];
    var fmt = function (x) { return x === 12 ? "12 pm" : (x > 12 ? (x - 12) + " pm" : x + " am"); };
    var open = !xmas && h >= hrs[0] && h < hrs[1];
    $$("[data-open]").forEach(function (el) {
      var t = $(".status-t", el); if (!t) return;
      el.classList.toggle("open", open);
      t.textContent = xmas ? "Closed today – Merry Christmas" : open ? "Open now · until " + fmt(hrs[1]) : (h < hrs[0] ? "Opens today at " + fmt(hrs[0]) : "Closed now · open tomorrow from " + fmt([[12], [11], [11], [11], [11], [11], [11]][(d + 1) % 7][0]));
    });
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-d") === d); });
  } catch (e) {}

  /* menu page: highlight current section chip */
  var chips = $$(".mnav a");
  if (chips.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (c) { var on = c.getAttribute("href") === "#" + e.target.id; c.classList.toggle("on", on); var m = c.parentNode.parentNode; if (on && m.scrollWidth > m.clientWidth) m.scrollLeft = c.offsetLeft - 20; });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$(".msec[id]").forEach(function (s) { so.observe(s); });
  }
})();
