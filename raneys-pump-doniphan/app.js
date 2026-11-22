/* Raney's Well & Pump Service – site script (no libraries) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o ? "true" : "false"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* 1. header shrinks on scroll  2. hero photo parallax  3. timeline "well" line draws (stroke-dashoffset) as you scroll */
  var plx = $(".plx"), tl = $(".timeline"), tlPath = tl && $(".tl-line path", tl), tlDrop = tl && $(".tl-drop", tl), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (r.top * -0.08).toFixed(1) + "px,0)";
      }
      if (tlPath) {
        var b = tl.getBoundingClientRect(), p = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.7 - b.top) / b.height));
        tlPath.style.strokeDashoffset = (1 - p).toFixed(3);
        if (tlDrop) tlDrop.style.top = (p * (b.height - 18)).toFixed(1) + "px";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* 4. counters (final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* 5. reveals: fade-up, line masks, arch clip-path — staggered */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        if (!reduce) $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 170); });
  }

  /* 6. card tilt  7. button ripple */
  if (!reduce && hover) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }
  if (!reduce) {
    $$(".btn").forEach(function (b) {
      b.addEventListener("pointerdown", function (e) {
        var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), d = document.createElement("span");
        d.className = "rip"; d.style.width = d.style.height = s + "px"; d.style.left = (e.clientX - r.left - s / 2) + "px"; d.style.top = (e.clientY - r.top - s / 2) + "px";
        b.appendChild(d); setTimeout(function () { d.remove(); }, 750);
      });
    });
  }

  /* open / closed: Mon–Sat 7:00–19:00, Central time */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(d) > -1;
      var open = wk && h >= 7 && h < 19;
      el.textContent = open ? "Open now · until 7 pm" : (d === "Sun" ? "Sundays by appointment" : "Closed now · opens 7 am");
      el.classList.toggle("open", open);
    } catch (e) {}
  });

  /* service request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["town", "Town"], ["type", "Home or business"], ["service", "Service needed"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Service request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
