/* Weimer Electronics – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o ? "true" : "false"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header + parallax on the TV frame (rAF, passive scroll) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + (y * 0.08).toFixed(1) + "px,0) rotate(" + (-1.5 + Math.min(y, 400) / 400 * 1.5).toFixed(2) + "deg)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – the final value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    if (!end || end < 2 || reduce) return;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  /* reveals */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.hasAttribute("data-anim"); }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { if (el.getAttribute("data-anim") !== "word") io.observe(el); });
    /* hero words pop in one after another */
    $$('[data-anim="word"]').forEach(function (el, i) { setTimeout(function () { el.classList.add("in"); }, 150 + i * 110); });
  }

  /* magnetic buttons + playful card tilt (mouse only) */
  if (!reduce && fine) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transition = "transform .1s"; c.style.transform = "perspective(800px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transition = ""; c.style.transform = ""; });
    });
  }

  /* open / closed status – Mon–Fri 9–17, Sat 9–12 (Eastern) */
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60;
    var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
    var open = (wk && h >= 9 && h < 17) || (d === "Sat" && h >= 9 && h < 12);
    $$("[data-open]").forEach(function (el) { el.textContent = open ? "Store open now" : "Closed now · Mon–Fri 9–5, Sat 9–12"; });
    $$("[data-open-dot]").forEach(function (el) { el.classList.toggle("off", !open); });
    $$("[data-open-badge]").forEach(function (el) { el.textContent = open ? "Open now · until " + (d === "Sat" ? "12:00 PM" : "5:00 PM") : "Closed now"; el.classList.toggle("closed", !open); });
  } catch (e) {}

  /* contact form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["topic", "Interested in"], ["message", "Question / comment"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from weimerelectronics.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
