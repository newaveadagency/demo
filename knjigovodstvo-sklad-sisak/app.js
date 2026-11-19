/* Knjigovodstveni servis SKLAD – skripta stranice (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* zaglavlje se smanjuje pri skrolanju */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* mreža se iscrtava pri učitavanju */
  var grid = $(".gridlines");
  if (grid) requestAnimationFrame(function () { grid.classList.add("in"); });


  /* brojači */
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function count(el) {
    var end = parseInt(el.getAttribute("data-count"), 10); if (isNaN(end)) return;
    if (reduce) { el.textContent = fmt(end); return; }
    var t0 = Date.now(), dur = 1600;
    el.textContent = "0";
    (function step() {
      var k = Math.min(1, (Date.now() - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(Math.round(end * e));
      if (k < 1) setTimeout(step, 30);
    })();
  }

  /* otkrivanje pri skrolanju (s malim zakašnjenjem za grupe).
     Elementi koji su na početku odrezani (maska, clip-path, SVG crta, traka) promatraju se preko roditelja. */
  var targets = $$("[data-anim], [data-count], .person");
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
      var k = el.getAttribute("data-anim"), w = el;
      if (k === "rise" || k === "clip" || k === "bar") w = el.parentElement;
      if (k === "pop") w = el.closest("li") || el.parentElement;
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
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice knjigovodstvo-sklad.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });

  /* godina u podnožju */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
