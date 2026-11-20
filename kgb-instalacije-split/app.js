/* K.G.B. instalacije – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    var close = function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* zaglavlje se smanjuje + paralaksa (rAF, pasivni scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.05;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači (s točkom za tisućice) */
  function fmt(n, sep) { var s = String(Math.round(n)); return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s; }
  function count(el) {
    var to = parseFloat(el.dataset.count), sep = el.dataset.sep || "", dur = 1500, t0 = null;
    if (reduce) { el.textContent = fmt(to, sep); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e, sep);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to, sep);
    }
    el.textContent = fmt(0, sep);
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  targets.forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.09) + "s"; });
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    /* redak naslova je maskiran (overflow:hidden), pa promatramo roditelja */
    var host = function (el) { var p = el.parentElement; return p && p.classList.contains("ln") ? p : el; };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        (t.classList.contains("ln") ? $$("[data-anim]", t) : [t]).forEach(function (x) { x.classList.add("in"); });
        io.unobserve(t);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(host(el)); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  /* nakon ulaska makni kašnjenje da hover bude trenutan */
  document.addEventListener("transitionend", function (e) { var t = e.target; if (t.classList && t.classList.contains("in") && t.dataset && t.dataset.d) t.style.transitionDelay = ""; });

  /* upit → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["service", "Usluga"], ["place", "Lokacija objekta"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("service") || "bazen") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice K.G.B. instalacije");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
