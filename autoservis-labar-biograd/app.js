/* Auto Servis Labar – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* otkrivanje pri skrolanju (fade, maska, clip-path, crtanje linije krova, linija postupka) */
  var els = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) els.forEach(function (el) { el.classList.add("in"); });
  else {
    /* element skriven clip-pathom nema vidljivu površinu, pa za njega promatramo roditelja */
    var wait = [];
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        wait.forEach(function (w) { if (w.t === e.target) w.el.classList.add("in"); });
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    els.forEach(function (el) {
      var t = /^(clip|wipe)$/.test(el.getAttribute("data-anim")) ? el.parentNode : el;
      wait.push({ el: el, t: t });
      io.observe(t);
    });
  }

  /* zaglavlje se smanjuje + paralaksa fotografija zgrade i čekaonice */
  var nav = $(".nav"), pars = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) pars.forEach(function (im) {
      var box = im.parentNode, r = box.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        var k = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
        im.style.transform = "translate3d(0," + (-k * (im.offsetHeight - r.height)).toFixed(1) + "px,0)";
      }
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* natpis OTVORENO / ZATVORENO (Pon–Pet 8–16, Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var h = +g("hour") + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(g("weekday")) > -1, open = wk && h >= 8 && h < 16;
      el.classList.add(open ? "open" : "shut");
      el.innerHTML = "<i></i>" + (open ? "Sada otvoreno · do 16 h" : "Sada zatvoreno · Pon–Pet 8–16 h");
    } catch (err) {}
  });

  /* obrazac → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["car", "Vozilo"], ["service", "Usluga"], ["message", "Opis i željeni termin"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za termin: " + (f.get("service") || "servis") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Auto Servisa Labar");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
