/* Master Sweep of the Hudson Valley – site script */
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
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + slow image parallax (rAF, passive listener) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) im.style.transform = "translate3d(0," + ((r.top - innerHeight / 2) * -0.08 - r.height * 0.06).toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* chimney line drawing: measure each stroke so it can be drawn in */
  $$(".draw path, .draw rect").forEach(function (p) {
    try { var l = Math.ceil(p.getTotalLength()) + 2; p.setAttribute("data-len", ""); p.style.setProperty("--len", l); } catch (e) {}
  });

  /* counters: the final value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = end > 50 ? 1900 : 1100;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    el.textContent = 0; requestAnimationFrame(step);
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
        if (el.hasAttribute("data-count")) count(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: lines rise one after another */
    $$(".hero-h [data-anim], .ph-h [data-anim]").forEach(function (el, i) { io.unobserve(el); el.style.transitionDelay = ""; setTimeout(function () { el.classList.add("in"); }, 150 + i * 170); });
  }

  /* open / closed (Mon–Fri 9–17, Sat 9–14, Eastern) + highlight today */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var close = d >= 1 && d <= 5 ? 17 : d === 6 ? 14 : 0, open = close && h >= 9 && h < close;
    $$("[data-open]").forEach(function (el) {
      el.classList.toggle("is-open", !!open);
      var t = $(".txt", el); if (t) t.textContent = open ? "Open now · until " + (close === 17 ? "5:00 pm" : "2:00 pm") : "Closed now · Mon–Fri 9–5, Sat 9–2";
    });
    $$("[data-hours] tr").forEach(function (tr) { if (+tr.getAttribute("data-d") === d) tr.classList.add("today"); });
  } catch (e) {}

  /* visit form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["town", "Town"], ["service", "Service"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Visit request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Master Sweep website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
