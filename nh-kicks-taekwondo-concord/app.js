/* NH Kicks Taekwondo Family Fitness – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
  var nav = $(".nav"), bar = $(".progress");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* horizontal gallery: vertical scroll drives the track on wide screens, swipe on phones */
  var hg = $(".hgal"), pin = hg && $(".hgal-pin", hg), track = hg && $(".hgal-track", hg), word = hg && $(".hgal-word", hg);
  var wide = window.matchMedia ? matchMedia("(min-width: 900px)") : { matches: false };
  function setupGal() {
    if (!hg) return;
    var on = wide.matches && !reduce;
    hg.classList.toggle("pin", on);
    if (!on) { hg.style.height = ""; track.style.transform = ""; if (word) word.style.transform = ""; return; }
    hg.style.height = ($(".hgal-head", hg).offsetHeight + innerHeight + Math.max(0, track.scrollWidth - innerWidth)) + "px";
  }

  /* parallax on hero photo */
  var par = $("[data-parallax]");

  /* scroll loop: header shrink, progress bar, gallery, parallax */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, h = document.documentElement.scrollHeight - innerHeight;
      if (nav) nav.classList.toggle("small", y > 40);
      if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0).toFixed(4) + ")";
      if (hg && hg.classList.contains("pin")) {
        var top = hg.getBoundingClientRect().top + $(".hgal-head", hg).offsetHeight;
        var dist = Math.max(0, track.scrollWidth - innerWidth), p = Math.min(1, Math.max(0, -top / (dist || 1)));
        track.style.transform = "translate3d(" + (-p * dist).toFixed(1) + "px,0,0)";
        if (word) word.style.transform = "translate3d(" + (-p * dist * 0.4).toFixed(1) + "px,0,0)";
      }
      if (par && !reduce && y < innerHeight * 1.2) par.style.transform = "scale(1.08) translate3d(0," + (y * 0.08).toFixed(1) + "px,0)";
      ticking = false;
    });
  }
  setupGal();
  addEventListener("resize", function () { setupGal(); onScroll(); });
  addEventListener("load", function () { setupGal(); onScroll(); });
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* cursor-following glow */
  if (!reduce && hover) {
    $$(".hero-glow").forEach(function (glow) {
      var host = glow.parentNode;
      host.addEventListener("mousemove", function (e) {
        var r = host.getBoundingClientRect();
        glow.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        glow.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    });
  }

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
    setTimeout(function () { el.textContent = String(end); }, dur + 300);
  }

  /* reveal on scroll with stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 7) * 0.07 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* kinetic headline: words rise one after another */
    $$('[data-anim="word"]').forEach(function (el, i) { io.unobserve(el); el.style.transitionDelay = "0s"; setTimeout(function () { el.classList.add("in"); }, 120 + i * 120); });
  }

  /* magnetic buttons + card tilt */
  if (!reduce && hover) {
    $$(".btn-grad").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* highlight today (Concord, NH time) in the week cards and schedule table */
  try {
    var wd = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" }).format(new Date());
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
    $$('[data-week] .day[data-d="' + d + '"], [data-sched] th[data-d="' + d + '"]').forEach(function (el) { el.classList.add("today"); });
  } catch (e) {}

  /* lesson request form → prepared e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), lines = [];
      f.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ": " + v); });
      var body = "Hello NH Kicks, I'd like to try a lesson.\n\n" + lines.join("\n");
      var to = fm.getAttribute("data-mail") || "", msg = $(".form-msg", fm);
      if (to) {
        location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Lesson request – " + (f.get("Program") || "Taekwondo")) + "&body=" + encodeURIComponent(body);
        if (msg) msg.textContent = "Your e-mail app should open with the message ready to send.";
      } else if (msg) {
        msg.innerHTML = 'Please call <a href="tel:+16037145472">603-714-5472</a>.';
      }
    });
  });
})();
