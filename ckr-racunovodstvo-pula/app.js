/* C.K.R. d.o.o. Pula – skripta stranice (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik na mobitelu */
  var nav = $(".nav"), burger = $(".burger"), menu = $(".menu");
  function navH() { if (nav) document.documentElement.style.setProperty("--navh", nav.offsetHeight + "px"); }
  navH(); window.addEventListener("resize", navH);
  if (burger && menu) {
    burger.addEventListener("click", function () {
      navH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje + paralaksa pruga iz logotipa */
  var stripes = $(".hero-stripes"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (nav) nav.classList.toggle("small", y > 40);
      if (stripes && !reduce && y < 1400) stripes.style.transform = "translate3d(0," + (y * 0.25) + "px,0) rotate(" + (y * -0.01) + "deg)";
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* reflektor koji prati kursor na staklenim karticama + blagi nagib */
  if (fine && !reduce) {
    $$(".glass").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty("--mx", x + "px"); el.style.setProperty("--my", y + "px");
        if (el.classList.contains("tilt")) {
          var rx = ((y / r.height) - 0.5) * -6, ry = ((x / r.width) - 0.5) * 6;
          el.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
        }
      });
      el.addEventListener("pointerleave", function () { if (el.classList.contains("tilt")) el.style.transform = ""; });
    });
    /* magnetni gumb */
    $$(".magnet").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.25) + "px," + ((e.clientY - r.top - r.height / 2) * 0.35) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* brojači */
  function count(el) {
    var end = parseInt(el.getAttribute("data-count"), 10); if (isNaN(end)) return;
    var from = parseInt(el.getAttribute("data-from") || "0", 10);
    if (reduce) { el.textContent = end; return; }
    var t0 = Date.now(), dur = 1800;
    el.textContent = from;
    (function step() {
      var k = Math.min(1, (Date.now() - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(from + (end - from) * e);
      if (k < 1) setTimeout(step, 30);
    })();
  }

  /* otkrivanje pri skrolanju; elementi s maskom promatraju se preko roditelja */
  var targets = $$("[data-anim], [data-count]");
  function reveal(el) {
    var d = parseInt(el.getAttribute("data-delay") || "0", 10);
    setTimeout(function () {
      el.classList.add("in");
      if (el.hasAttribute("data-count")) count(el);
    }, d);
  }
  if (!("IntersectionObserver" in window) || reduce) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var map = new Map();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (map.get(e.target) || []).forEach(reveal);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0 });
    targets.forEach(function (el) {
      var w = el.getAttribute("data-anim") === "rise" ? el.parentElement : el;
      if (!map.has(w)) { map.set(w, []); io.observe(w); }
      map.get(w).push(el);
    });
  }

  /* obrasci → pripremljena e-pošta */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime i prezime"], ["telefon", "Telefon"], ["email", "E-mail"], ["oblik", "Oblik poslovanja"], ["usluga", "Usluga"], ["poruka", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      var subj = "Upit: " + (f.get("usluga") || "knjigovodstvo") + " – " + (f.get("ime") || "");
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice ckr.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
