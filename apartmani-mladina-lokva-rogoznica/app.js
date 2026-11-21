/* Apartmani Mladina, Lokva Rogoznica – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  var onNav = function () { if (nav) nav.classList.toggle("small", window.scrollY > 30); };
  onNav(); window.addEventListener("scroll", onNav, { passive: true });

  /* duljina SVG linija za iscrtavanje */
  $$(".draw-in .draw, .draw-in .wv").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
  });

  /* brojači */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    if (reduce || !end) { el.textContent = end; return; }
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  var items = $$("[data-anim]"), counters = $$("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  /* blaga paralaksa fotografije u heroju (rAF + passive scroll) */
  var px = $$("[data-parallax]");
  if (px.length && !reduce) {
    var ticking = false;
    var run = function () {
      ticking = false;
      px.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect(), vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        el.style.transform = "translate3d(0," + (p * 10 - 6).toFixed(2) + "%,0)";
      });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* FAQ: otvoren je samo jedan odgovor */
  var dets = $$(".faq details");
  dets.forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) dets.forEach(function (o) { if (o !== d) o.open = false; }); }); });

  /* datum odlaska ne može biti prije dolaska */
  $$("form.lead-form").forEach(function (fm) {
    var from = fm.querySelector('[name="from"]'), to = fm.querySelector('[name="to"]');
    if (from && to) {
      var today = new Date().toISOString().slice(0, 10);
      from.min = today; to.min = today;
      from.addEventListener("change", function () { to.min = from.value || today; if (to.value && to.value < from.value) to.value = ""; });
    }
    /* upit → pripremljena e-poruka */
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["email", "E-mail"], ["phone", "Telefon"], ["from", "Dolazak"], ["to", "Odlazak"], ["guests", "Broj osoba"], ["apt", "Apartman"], ["message", "Poruka"]].forEach(function (k) { var v = f.get(k[0]); if (v) body.push(k[1] + ": " + v); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za boravak " + (f.get("from") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Apartmani Mladina");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
