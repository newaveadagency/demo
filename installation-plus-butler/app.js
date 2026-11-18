/* Installation Plus Garage Door – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + hero parallax (one rAF loop, passive listener) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) img.style.transform = "translate3d(0," + (-(r.top) * 0.12 - 30).toFixed(1) + "px,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* counters */
  function count(el) {
    var end = +el.dataset.count, sep = el.dataset.sep, t0 = null, dur = 1600;
    var fmt = function (n) { return sep ? n.toLocaleString("en-US") : String(n); };
    if (reduce) { el.textContent = fmt(end); return; }
    t0 = Date.now();
    (function step() {
      var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(end * e));
      if (p < 1) setTimeout(step, 16);
    })();
  }

  /* reveal on scroll */
  var items = $$("[data-anim]"), counters = $$("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target._anim || e.target).classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) {
      /* line masks sit inside overflow:hidden parents – watch the parent instead */
      /* (clip-path targets are not reported by IntersectionObserver either) */
      var t = el;
      if (el.getAttribute("data-anim") === "line") t = el.parentNode;
      while (t.parentNode && t.parentNode.nodeType === 1 && getComputedStyle(t).clipPath !== "none") t = t.parentNode;
      t._anim = el; io.observe(t);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  /* magnetic primary buttons (pointer devices only) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".hero .btn, .band .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* office open / closed (Mon–Fri 8:00–5:00, Central time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      var open = wk && h >= 8 && h < 17;
      el.textContent = open ? "Office open now" : "Office closed now – leave a request";
      el.classList.toggle("open", open);
    } catch (e) {}
  });

  /* service / estimate form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["service", "Type of request"], ["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["city", "City / ZIP"], ["message", "Comments"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("service") || "Service request") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Installation Plus website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
