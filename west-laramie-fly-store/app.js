/* West Laramie Fly Store – site script */
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

  /* header shrinks on scroll + photo parallax (rAF, passive listener) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (!reduce) plx.forEach(function (p) {
        var r = p.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) var v = Math.max(-60, Math.min(0, (r.top + r.height / 2 - innerHeight / 2) * 0.1 - 30)); p.style.transform = "translate3d(0," + v.toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = parseFloat(el.getAttribute("data-count")), dec = +(el.getAttribute("data-dec") || 0);
    var start = end > 1000 ? end - 50 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (start + (end - start) * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); else el.textContent = end.toFixed(dec); }
    el.textContent = start.toFixed(dec); requestAnimationFrame(step);
  }

  /* reveal on scroll with a small stagger between siblings */
  var items = $$("[data-anim]"), line = $(".flyline");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); if (line) line.classList.add("in"); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
        setTimeout(function () { el.style.transitionDelay = ""; }, 1600);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 160); });
    if (line) setTimeout(function () { line.classList.add("in"); }, 300);
  }

  /* playful tilt on cards */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(700px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open now / closed (Mountain time). Hours: Sun–Wed 5:30–21, Thu 5:30–22, Fri 5:30–23, Sat 5:30–22 */
  var close = { Sun: 21, Mon: 21, Tue: 21, Wed: 21, Thu: 22, Fri: 23, Sat: 22 };
  var label = { 21: "9 pm", 22: "10 pm", 23: "11 pm" };
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Denver", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, open = h >= 5.5 && h < close[d];
    $$("[data-open]").forEach(function (el) {
      el.textContent = open ? "Open now · until " + label[close[d]] : "Closed now · opens at 5:30 am";
      if (!open && el.parentNode) el.parentNode.classList.add("closed");
    });
    var rows = $$(".hours tr"), idx = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 1, Fri: 2, Sat: 3 }[d];
    if (rows[idx]) rows[idx].classList.add("today");
  } catch (e) {}

  /* waters filter */
  var chips = $$(".chip[data-filter]");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-filter");
      chips.forEach(function (x) { x.classList.toggle("on", x === c); });
      $$(".area[data-area]").forEach(function (a) {
        var show = f === "all" || a.getAttribute("data-area") === f;
        a.classList.toggle("hide", !show);
        if (show) $$("[data-anim]", a).forEach(function (el) { el.classList.add("in"); });
      });
    });
  });

  /* message form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["topic", "Subject"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from flystore.net");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
