/* Veterinarska stanica Samobor – skripta stranice */
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

  /* zaglavlje se smanjuje + paralaksa (rAF, passive) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) img.style.transform = "translate3d(0," + (-(r.top + r.height / 2 - innerHeight / 2) * 0.08 - r.height * 0.08) + "px,0)";
    });
    ticking = false;
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    if (reduce) { el.textContent = to; return; }
    t0 = Date.now();
    (function step() { var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e); if (p < 1) setTimeout(step, 30); })();
  }

  /* redovi naslova u heroju: maska, jedan za drugim */
  var lines = $$('[data-anim="line"]');
  setTimeout(function () { lines.forEach(function (l) { l.classList.add("in"); }); }, 120);

  /* otkrivanje pri skrolanju */
  var targets = $$("[data-anim], [data-steps], [data-count]").filter(function (el) { return el.getAttribute("data-anim") !== "line"; });
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add("in");
        if (el.hasAttribute("data-count")) count(el);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  } else targets.forEach(function (el) { el.classList.add("in"); });

  /* nagib kartica */
  if (!reduce && matchMedia("(hover:hover)").matches) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 4) + "deg) rotateY(" + (x * 5) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    /* magnetni gumb */
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.18) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.25) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
  }

  /* harmonika: samo jedna otvorena */
  $$(".acc").forEach(function (acc) {
    $$("details", acc).forEach(function (d) {
      d.addEventListener("toggle", function () { if (d.open) $$("details", acc).forEach(function (o) { if (o !== d) o.open = false; }); });
    });
  });

  /* obrazac → pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["pet", "Ljubimac"], ["service", "Razlog dolaska"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za termin – " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice veterina-samobor.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
