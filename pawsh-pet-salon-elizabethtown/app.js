/* Pawsh Pet Salon & Spa – site script (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* SVG line lengths for draw animations */
  $$('[data-anim="draw"]').forEach(function (svg) {
    var p = $("path", svg);
    try { if (p && p.getTotalLength) svg.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
  });

  /* stagger: hero words stamp in one after another, groups reveal in sequence */
  $$(".hero-h [data-anim]").forEach(function (el, i) { el.style.transitionDelay = (0.12 + i * 0.11) + "s"; });
  $$(".ticks, .tags, .pk-grid, .gal-grid, .rev-grid, .weights, .ct-list, .stack").forEach(function (g) {
    $$("[data-anim]", g).forEach(function (el, i) { if (!el.closest(".hero-h")) el.style.transitionDelay = (i % 8) * 0.08 + "s"; });
  });

  /* reveal on scroll */
  var items = $$("[data-anim]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target; el.classList.add("in"); io.unobserve(el);
          setTimeout(function () { el.style.transitionDelay = ""; }, 1800);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add("in"); });

  /* open / closed now + today's hours (Eastern time) */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday"));
    var h = (+g("hour") % 24) + (+g("minute")) / 60;
    var open = (day >= 1 && day <= 5 && h >= 7 && h < 16) || (day === 6 && h >= 8 && h < 15);
    $$("[data-open]").forEach(function (el) {
      el.textContent = open ? "Open now · until " + (day === 6 ? "3" : "4") + " p.m." : "Closed now · Mon–Fri 7–4, Sat 8–3";
      el.classList.toggle("is-open", open);
    });
    $$("[data-hours] tr").forEach(function (tr) { if (+tr.getAttribute("data-d") === day) tr.classList.add("today"); });
  } catch (e) {}

  /* gentle tilt on package cards */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* parallax on the hero photo stack */
  var stack = $(".stack");
  if (stack && !reduce) {
    var pols = $$(".pol", stack), ticking = false;
    var px = function () {
      ticking = false;
      var y = window.scrollY; if (y > 900) return;
      pols.forEach(function (p, i) { p.style.translate = "0 " + (y * (0.04 + i * 0.035)).toFixed(1) + "px"; });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(px); } }, { passive: true });
  }

  /* price list: highlight the section in view */
  var tabs = $$(".tabs a");
  if (tabs.length && "IntersectionObserver" in window) {
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) tabs.forEach(function (a) { a.classList.toggle("cur", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$(".menu-sec").forEach(function (s) { tio.observe(s); });
  }

  /* appointment request: prepared e-mail when an address is set, otherwise a call-ready summary */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["pet", "Pet"], ["weight", "Weight"], ["service", "Service"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-tel") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Appointment request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your e-mail app is opening with the request filled in. Just press send."; ok.style.display = "block"; }
      } else if (ok) {
        ok.innerHTML = "";
        var p = document.createElement("p"); p.textContent = "Thanks, " + f.get("name") + "! Your request is ready. To lock in a time, give us a quick call:";
        var a = document.createElement("a"); a.href = "tel:" + tel; a.textContent = "Call 270-737-2974";
        ok.appendChild(p); ok.appendChild(a); ok.style.display = "block";
      }
    });
  });
})();
