/* Azil za knjige — app.js (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); });
    });
  }

  /* zaglavlje se smanjuje + knjiga u heroju lebdi (paralaksa) */
  var nav = $(".nav"), fl = $("[data-float]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset || 0;
    if (nav) nav.classList.toggle("small", y > 30);
    if (fl && !reduce) {
      var r = fl.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) fl.style.transform = "translate3d(0," + (r.top * 0.08).toFixed(1) + "px,0) rotate(" + (r.top * -0.012).toFixed(2) + "deg)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* otkrivanje pri skrolanju (fade-up, maska za redove, clip-path, crtanje SVG linije) */
  var targets = $$("[data-anim], [data-path]");
  if (!("IntersectionObserver" in window) || reduce) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) requestAnimationFrame(function () { el.classList.add("in"); });
      else io.observe(el);
    });
  }

  /* magnetni gumbi */
  if (fine && !reduce) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* radno vrijeme: pon–pet 11–18, sub 11–14, ned zatvoreno (Europe/Zagreb) */
  var HOURS = { 0: null, 1: [660, 1080], 2: [660, 1080], 3: [660, 1080], 4: [660, 1080], 5: [660, 1080], 6: [660, 840] };
  var DAYS = ["nedjelju", "ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu"];
  function zagrebNow() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), m: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function hhmm(m) { return Math.floor(m / 60) + ":" + ("0" + (m % 60)).slice(-2); }
  var now = zagrebNow();
  $$("[data-hours] tr").forEach(function (tr) {
    var ds = (tr.getAttribute("data-day") || "").split(" ");
    if (ds.indexOf(String(now.d)) > -1) tr.classList.add("today");
  });
  var h = HOURS[now.d], txt;
  if (h && now.m >= h[0] && now.m < h[1]) txt = "Otvoreno · danas do " + hhmm(h[1]);
  else {
    var nx = null, k = 0;
    if (h && now.m < h[0]) nx = { d: now.d, h: h, today: true };
    while (!nx && k < 7) { k++; var dd = (now.d + k) % 7; if (HOURS[dd]) nx = { d: dd, h: HOURS[dd], tomorrow: k === 1 }; }
    txt = "Zatvoreno · otvaramo " + (nx.today ? "danas" : nx.tomorrow ? "sutra" : "u " + DAYS[nx.d]) + " u " + hhmm(nx.h[0]);
  }
  $$("[data-open]").forEach(function (st) {
    if (h && now.m >= h[0] && now.m < h[1]) st.classList.add("open");
    var s = $(".st", st); if (s) s.textContent = txt;
  });

  /* obrazac upita → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime i prezime"], ["kontakt", "Telefon / e-pošta"], ["naslov", "Naslov"], ["autor", "Autor"], ["poruka", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Upit za knjigu: " + (f.get("naslov") || "")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
