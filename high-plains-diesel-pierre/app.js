/* High Plains Diesel & Auto – concept site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* counters: final value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0), t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(from + (end - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = from; requestAnimationFrame(step);
    setTimeout(function () { el.textContent = end; }, dur + 400);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).concat(el.hasAttribute("data-count") ? [el] : []).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* headline lines rise one after another */
    $$(".hero-h [data-anim], .phero h1 [data-anim]").forEach(function (el, i) {
      io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 250 + i * 160);
    });
  }

  /* rotating vehicle name in the hero */
  $$("[data-rotate]").forEach(function (w) {
    if (reduce) return;
    var words = w.getAttribute("data-rotate").split(","), i = 0, b = $("b", w);
    if (!b || !b.animate) return;
    setInterval(function () {
      i = (i + 1) % words.length;
      b.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(-70%) skewX(-12deg)", opacity: 0 }], { duration: 240, easing: "ease-in" }).onfinish = function () {
        b.textContent = words[i];
        b.animate([{ transform: "translateY(70%) skewX(-12deg)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
      };
    }, 2300);
  });

  /* step line on the services page */
  var line = $(".steps svg.line path");
  if (line && !reduce) line.style.strokeDashoffset = "1";

  /* scroll loop: shrinking header, parallax door, slashes, step line (rAF, passive) */
  var plx = $$(".plx"), slashes = $$(".hero-bg .slash"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        if (y < vh * 1.2) {
          plx.forEach(function (f) { f.style.translate = "0 " + (y * 0.12).toFixed(1) + "px"; });
          slashes.forEach(function (s, k) { s.style.translate = "0 " + (-y * (0.15 + k * 0.1)).toFixed(1) + "px"; });
        }
        if (line) {
          var s = line.closest(".steps").getBoundingClientRect(), q = Math.min(1, Math.max(0, (vh * 0.85 - s.top) / (s.height * 0.8)));
          line.style.strokeDashoffset = (1 - q).toFixed(3);
        }
      }
      ticking = false;
    });
  }
  addEventListener("resize", onScroll);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* tilt cards + magnetic buttons */
  if (!reduce && hover) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, yy = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-yy * 6).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open now / closed: Mon–Fri 8:00–18:00, Central time (Pierre, SD) */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var open = day >= 1 && day <= 5 && h >= 8 && h < 18;
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-d") === day); });
    $$("[data-status]").forEach(function (el) { el.classList.toggle("open", open); el.textContent = open ? "Open now · until 6 PM" : "Closed now · opens 8 AM Mon–Fri"; });
  } catch (e) {}

  /* repair request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["vehicle", "Vehicle"], ["fuel", "Gas or diesel"], ["message", "What it is doing"], ["day", "Preferred day"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Repair request: " + f.get("vehicle") + " (" + f.get("name") + ")") + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
