/* Drellishak's Service Center – site script */
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

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (HTML already holds the final number) */
  var count = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10), start = end > 1000 ? end - 80 : 0, t0 = null, dur = 1600;
    if (reduce || isNaN(end)) return;
    t0 = Date.now();
    var timer = setInterval(function () {
      var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p >= 1) { clearInterval(timer); el.textContent = end; }
    }, 30);
  };

  /* reveal on scroll */
  var items = $$("[data-anim]");
  var show = function (el) {
    el.classList.add("in");
    $$("[data-count]", el).forEach(count);
  };
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target.__anim || e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el, i) {
      /* stagger siblings a little */
      var sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [];
      var idx = sib.indexOf(el);
      if (idx > 0 && el.getAttribute("data-anim") !== "draw" && !el.closest(".hero,.p-hero")) el.style.animationDelay = Math.min(idx * 90, 450) + "ms";
      /* masked lines are clipped by their wrapper, so watch the wrapper */
      var tgt = el.getAttribute("data-anim") === "rise" && el.parentElement ? el.parentElement : el;
      tgt.__anim = el;
      io.observe(tgt);
    });
    /* the hero plays on load with CSS keyframes (see style.css) */
  }

  /* parallax on the vintage postcard */
  var px = $("[data-parallax]");
  if (px && !reduce) {
    var ticking = false;
    var move = function () {
      var r = px.getBoundingClientRect(), off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.08;
      px.style.transform = "rotate(-2.5deg) translateY(" + off.toFixed(1) + "px)";
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* ticket tilt + magnetic button (pointer devices only) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open / closed (Mon–Fri 8:00–5:30, Eastern time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      el.textContent = wk && h >= 8 && h < 17.5 ? "Open now · until 5:30 pm" : "Closed now · Mon–Fri 8:00 am – 5:30 pm";
    } catch (e) {}
  });

  /* quote forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["vehicle", "Vehicle"], ["service", "Service needed"], ["message", "What's going on"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Quote request: " + (f.get("service") || "Repair") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from drellishakservice.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
