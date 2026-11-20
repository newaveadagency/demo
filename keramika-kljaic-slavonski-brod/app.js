/* Keramika Kljaić – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { if (!menu) return; menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open") ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje se smanjuje + paralaksa */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.getAttribute("data-parallax")) || 0.05;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.1)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.getAttribute("data-count")), dur = 1300, t0 = null;
    if (reduce) { el.textContent = String(to); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = String(to);
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju, ulazak heroja, crtanje mreže pločica */
  $$("[data-anim]").forEach(function (el) { var d = el.getAttribute("data-d"); if (d) el.style.transitionDelay = (d * 0.1) + "s"; });
  var heroEls = $$(".hero [data-anim], .page-hero [data-anim], .hero .grid-draw");
  requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }); });
  var targets = $$("[data-anim], .grid-draw").filter(function (el) { return heroEls.indexOf(el) < 0; });
  var counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* nagib kartica i magnetni gumbi (miš) */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".tile, .step").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(700px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 5).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".hero .btn, .dark .acts .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* filtar galerije */
  var figs = $$(".gal figure");
  $$(".filters button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-f");
      $$(".filters button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      figs.forEach(function (fg) {
        var show = f === "sve" || fg.getAttribute("data-cat") === f;
        fg.classList.toggle("hide", !show);
        if (show) fg.classList.add("in");
      });
    });
  });

  /* povećanje fotografija */
  var lb = $(".lb"), cur = 0;
  function visible() { return figs.filter(function (f) { return !f.classList.contains("hide"); }); }
  function show(i) {
    var v = visible(); if (!v.length) return;
    cur = (i + v.length) % v.length;
    var im = $("img", v[cur]);
    $("img", lb).src = im.getAttribute("src"); $("img", lb).alt = im.alt; $("p", lb).textContent = im.alt;
  }
  if (lb && figs.length) {
    figs.forEach(function (f) {
      var b = $("button", f);
      if (b) b.addEventListener("click", function () { show(visible().indexOf(f)); lb.classList.add("on"); $(".x", lb).focus(); });
    });
    $(".x", lb).addEventListener("click", function () { lb.classList.remove("on"); });
    $(".pv", lb).addEventListener("click", function () { show(cur - 1); });
    $(".nx", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("on"); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") lb.classList.remove("on");
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* obrazac – složi e-poruku (mailto) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["radovi", "Radovi"], ["mjesto", "Mjesto"], ["kvadratura", "Kvadratura"], ["opis", "Opis"], ["ime", "Ime"], ["telefon", "Telefon"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var subject = "Upit: " + f.get("radovi") + " – " + f.get("ime");
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent("Upit za ponudu (web)\n\n" + body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
