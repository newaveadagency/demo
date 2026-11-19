/* Apartmani Šerić, Vrboska – skripta stranice */
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
  var onNav = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  onNav(); window.addEventListener("scroll", onNav, { passive: true });

  /* brojači */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
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

  /* paralaksa (transform u requestAnimationFrame) */
  var px = $$("[data-parallax]");
  if (px.length && !reduce) {
    var ticking = false;
    var run = function () {
      ticking = false;
      px.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect(), vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        el.style.transform = "translate3d(0," + (p * -14).toFixed(2) + "%,0)";
      });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* nagib razglednica prema mišu */
  var cards = $(".cards");
  if (cards && !reduce && window.matchMedia("(hover:hover)").matches) {
    cards.style.transition = "transform .6s cubic-bezier(.2,.7,.2,1)";
    cards.addEventListener("mousemove", function (e) {
      var r = cards.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      cards.style.transform = "perspective(1200px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg)";
    });
    cards.addEventListener("mouseleave", function () { cards.style.transform = ""; });
  }

  /* upit → pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["email", "E-mail"], ["phone", "Telefon"], ["apt", "Apartman"], ["from", "Dolazak"], ["to", "Odlazak"], ["adults", "Odrasli"], ["kids", "Djeca"], ["message", "Poruka"]].forEach(function (k) { var v = f.get(k[0]); if (v) body.push(k[1] + ": " + v); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za boravak " + (f.get("from") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Apartmani Šerić");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
