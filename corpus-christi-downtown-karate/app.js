/* Corpus Christi Downtown Karate – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav"), bar = $(".progress");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* horizontal gallery: vertical scroll drives the track (desktop only) */
  var hg = $(".hgal"), pin = hg && $(".hgal-pin", hg), track = hg && $(".hgal-track", hg), word = hg && $(".hgal-word", hg);
  var wide = matchMedia("(min-width: 900px)");
  function setupGal() {
    if (!hg) return;
    var on = wide.matches && !reduce;
    hg.classList.toggle("pin", on);
    if (!on) { pin.style.height = ""; track.style.transform = ""; return; }
    var dist = Math.max(0, track.scrollWidth - innerWidth);
    pin.parentNode.style.setProperty("--dist", dist + "px");
    hg.style.paddingBottom = dist + "px";
  }

  /* scroll: header shrink, progress bar, gallery translate */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, h = document.documentElement.scrollHeight - innerHeight;
      if (nav) nav.classList.toggle("small", y > 40);
      if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0).toFixed(4) + ")";
      if (hg && hg.classList.contains("pin")) {
        var r = pin.getBoundingClientRect(), top = hg.getBoundingClientRect().top + $(".hgal-head", hg).offsetHeight;
        var dist = Math.max(0, track.scrollWidth - innerWidth), p = Math.min(1, Math.max(0, -top / (dist || 1)));
        track.style.transform = "translate3d(" + (-p * dist).toFixed(1) + "px,0,0)";
        if (word) word.style.transform = "translate3d(" + (-p * dist * 0.35).toFixed(1) + "px,0,0)";
      }
      ticking = false;
    });
  }
  setupGal();
  addEventListener("resize", function () { setupGal(); onScroll(); });
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* cursor-following glow in the hero */
  var glow = $(".hero-glow");
  if (glow && !reduce && matchMedia("(hover: hover)").matches) {
    var host = glow.parentNode;
    host.addEventListener("mousemove", function (e) {
      var r = host.getBoundingClientRect();
      glow.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100 + 10).toFixed(1) + "%");
      glow.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100 + 10).toFixed(1) + "%");
    });
  }

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll with stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* kinetic headline: words rise one after another */
    $$('[data-anim="word"]').forEach(function (el, i) { io.unobserve(el); el.style.transitionDelay = "0s"; setTimeout(function () { el.classList.add("in"); }, 150 + i * 110); });
  }

  /* magnetic buttons */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".btn-grad").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* highlight today (Central time) in hours table and weekly schedule */
  try {
    var wd = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short" }).format(new Date());
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
    $$('[data-hours] tr[data-d="' + d + '"], [data-week] .day[data-d="' + d + '"]').forEach(function (el) { el.classList.add("today"); });
  } catch (e) {}

  /* first-class form → prepared message (e-mail if the dojo address is set) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), lines = [];
      f.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ": " + v); });
      var body = "Hello, I'd like to plan a first class at Corpus Christi Downtown Karate.\n\n" + lines.join("\n");
      var to = fm.getAttribute("data-mail") || "", msg = $(".form-msg", fm);
      if (to) {
        location.href = "mailto:" + to + "?subject=" + encodeURIComponent("First class – " + (f.get("Class") || "")) + "&body=" + encodeURIComponent(body);
        if (msg) msg.textContent = "Your e-mail app should open with the message ready to send.";
      } else {
        if (navigator.clipboard) navigator.clipboard.writeText(body).catch(function () {});
        if (msg) msg.innerHTML = 'Message ready. Call <a href="tel:+13615373004">361-537-3004</a> and we\'ll find a class that fits.';
      }
    });
  });
})();
