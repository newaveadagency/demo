/* Graditeljstvo FI-MAN – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { if (!menu) return; menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* zaglavlje se smanjuje + paralaksa slika */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 50);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.1)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* SVG crtež: duljina svake crte za stroke-dashoffset */
  $$("[data-draw] .draw").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
  });

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.12) + "s"; });
  var targets = $$("[data-anim], [data-draw]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* reference: filtri */
  var fbar = $(".filters"), gal = $$(".gal [data-cat]");
  if (fbar) {
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        gal.forEach(function (a) { a.hidden = !(f === "sve" || a.dataset.cat === f); });
      });
    });
  }

  /* reference: povećani prikaz */
  var lb = $(".lb");
  if (lb) {
    var img = $("img", lb), cap = $("p", lb), cur = 0, last = null;
    var vis = function () { return gal.filter(function (a) { return !a.hidden; }); };
    function show(i) {
      var list = vis(); if (!list.length) return;
      cur = (i + list.length) % list.length;
      var a = list[cur], im = $("img", a);
      img.src = a.getAttribute("href"); img.alt = im ? im.alt : "";
      cap.textContent = (im ? im.alt : "") + " · " + (cur + 1) + " / " + list.length;
    }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; if (last) last.focus(); }
    gal.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault(); last = a;
        show(vis().indexOf(a)); lb.classList.add("open"); document.body.style.overflow = "hidden"; $(".x", lb).focus();
      });
    });
    $(".x", lb).addEventListener("click", close);
    $(".pv", lb).addEventListener("click", function () { show(cur - 1); });
    $(".nx", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["type", "Vrsta objekta"], ["location", "Lokacija gradnje"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("type") || "gradnja") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice FI-MAN");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
