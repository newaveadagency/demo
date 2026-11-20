/* UFO BIANCO – Selca, Brač · skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* otkrivanje pri skrolanju (fade, maska redaka, clip-path, crta, SVG crtanje) */
  var els = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          $$("[data-anim='draw']", e.target).forEach(function (d) { d.classList.add("in"); });
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* zaglavlje se smanjuje + paralaksa */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset || 0;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var k = parseFloat(el.getAttribute("data-parallax")) || 0;
      el.setAttribute("transform", "translate(0 " + (y * k * -1).toFixed(1) + ")");
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* magnetni gumbi */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* obrazac → pripremljena SMS poruka (tvrtka na stranici ne navodi e-mail) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = ["Upit s web stranice"];
      [["name", "Ime"], ["phone", "Tel"], ["service", "Posao"], ["place", "Mjesto"], ["message", "Opis"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = encodeURIComponent(body.join("\n"));
      if (fm.dataset.mail) location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + f.get("name")) + "&body=" + text;
      else location.href = "sms:" + fm.dataset.sms + "?&body=" + text;
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
