/* Studio M, Varaždin – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  var onNav = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  onNav();
  window.addEventListener("scroll", onNav, { passive: true });

  /* otkrivanje pri skrolanju (fade-up, maska, clip-path, SVG crtanje) */
  var all = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    all.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentNode ? $$(":scope > [data-anim]", el.parentNode) : [];
        var idx = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 90, 450) + "ms";
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    all.forEach(function (el) { io.observe(el); });
    /* hero: redovi naslova jedan za drugim */
    $$(".hero-h .ln > [data-anim]").forEach(function (el, i) {
      el.style.transitionDelay = (150 + i * 160) + "ms";
    });
  }

  /* brojači */
  var counters = $$("[data-count]");
  var runCount = function (el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v;
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = "0";
    requestAnimationFrame(step);
  };
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* paralaksa slike u heroju */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var upd = function () {
      var y = window.scrollY;
      par.forEach(function (img) { if (y < window.innerHeight * 1.4) img.style.transform = "translate3d(0," + (y * 0.25) + "px,0)"; });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  if (fine && !reduce) {
    /* reflektor koji prati kursor */
    var spot = $(".spot"), sx = -999, sy = -999, raf = 0;
    window.addEventListener("pointermove", function (e) {
      sx = e.clientX; sy = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () {
        if (spot) { spot.style.setProperty("--sx", sx + "px"); spot.style.setProperty("--sy", sy + "px"); }
        raf = 0;
      });
    }, { passive: true });

    /* rub staklenih kartica svijetli prema kursoru */
    $$(".glass").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    /* nagib kartica */
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 6) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });

    /* magnetni gumbi */
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* radno vrijeme: današnji dan i status (Europe/Zagreb) */
  var H = { 1: [13, 20], 2: [8, 15], 3: [13, 20], 4: [8, 15], 5: [11, 20], 6: [8, 13] };
  var DAYS = ["nedjelju", "ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu"];
  try {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    $$('.hours tr[data-day="' + d + '"]').forEach(function (tr) { tr.classList.add("today"); });
    var msg;
    if (H[d] && h >= H[d][0] && h < H[d][1]) msg = "Sada otvoreno · danas do " + H[d][1] + " h";
    else if (H[d] && h < H[d][0]) msg = "Danas otvaramo u " + H[d][0] + " h";
    else { var n = d; do { n = (n + 1) % 7; } while (!H[n]); msg = "Sada zatvoreno · otvaramo u " + DAYS[n] + " u " + H[n][0] + " h"; }
    $$("[data-open]").forEach(function (el) { el.textContent = msg; });
  } catch (e) {}

  /* obrazac za upit → pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["service", "Usluga"], ["when", "Željeni termin"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za termin – " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Studija M");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
