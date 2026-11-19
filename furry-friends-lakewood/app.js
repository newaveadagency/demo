/* Furry Friends Grooming – site script */
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

  /* shrinking header */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("scrolled", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters */
  var count = function (el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    if (reduce) { el.textContent = end; return; }
    var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    el.textContent = "0"; requestAnimationFrame(step);
  };

  /* reveal on scroll */
  var els = $$("[data-anim]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add("in"); });

  /* parallax */
  var par = $$(".parallax");
  if (par.length && !reduce) {
    var ticking = false;
    var upd = function () {
      ticking = false;
      par.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect(), vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = "translate3d(0," + (-8 + p * -10).toFixed(2) + "%,0)";
      });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* card tilt + magnetic buttons (fine pointers only) */
  if (!reduce && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* gallery arrows */
  var track = $(".gal-track");
  if (track) {
    var go = function (d) { track.scrollBy({ left: d * track.clientWidth * .7, behavior: reduce ? "auto" : "smooth" }); };
    var pv = $(".gal-nav .prev"), nx = $(".gal-nav .next");
    if (pv) pv.addEventListener("click", function () { go(-1); });
    if (nx) nx.addEventListener("click", function () { go(1); });
  }

  /* open / closed (Mon–Sat 8:00–16:00, Mountain time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Denver", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, day = d !== "Sun";
      el.textContent = day && h >= 8 && h < 16 ? "Open now · until 4 pm (or the last furry friend)" : "Closed now · open Mon – Sat from 8 am";
    } catch (e) {}
  });

  /* appointment request → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["pet", "Pet (name & breed)"], ["service", "Service"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Grooming appointment request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from furryfriendsco.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
