/* Puppy Love -N- Style – site script */
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

  /* header shrink + polaroid parallax (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* price counters (final value already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1200;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* paw-trail line length for the SVG draw */
  $$(".trail .draw").forEach(function (p) { try { p.parentNode.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });

  /* reveal on scroll with a stagger between siblings */
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
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 170); });
    $$(".hero-art [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 450 + i * 220); });
  }

  /* hover: magnetic buttons + card tilt */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transition = "transform .1s"; c.style.transform = "perspective(800px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transition = ""; c.style.transform = ""; });
    });
  }

  /* open now / closed (Eastern time). Mon–Fri 7:30–18:00, Sat 9–14 store only, grooming Mon/Tue/Thu/Fri */
  function nowET() {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h: (+g("hour") % 24) + g("minute") / 60 };
  }
  try {
    var n = nowET();
    $$("[data-open]").forEach(function (el) {
      var txt = $(".st-txt", el), open = false, msg;
      if (n.d >= 1 && n.d <= 5 && n.h >= 7.5 && n.h < 18) { open = true; msg = n.d === 3 ? "Open now · daycare & store (no grooming on Wednesdays)" : "Open now · grooming, daycare & store until 6:00 pm"; }
      else if (n.d === 6 && n.h >= 9 && n.h < 14) { open = true; msg = "Open now · boutique until 2:00 pm"; }
      else msg = "Closed right now · request an appointment below";
      if (txt) txt.textContent = msg;
      el.classList.toggle("shut", !open);
    });
    $$("[data-hours] tr").forEach(function (tr) { if (+tr.getAttribute("data-d") === n.d) tr.classList.add("today"); });
  } catch (e) {}

  /* appointment form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["client", "Client"], ["dog", "Dog's name"], ["breed", "Breed & weight"], ["service", "Service"], ["date", "Preferred date"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Appointment request: " + (f.get("service") || "") + " for " + (f.get("dog") || "") + " (" + f.get("name") + ")") + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from puppylovenstyle.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
