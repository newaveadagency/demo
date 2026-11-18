/* TKM-design – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* otkrivanje pri skrolanju */
  var els = $$("[data-anim]");
  if (still || !("IntersectionObserver" in window)) els.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* brojači */
  var nums = $$("[data-count]");
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null;
    if (still || end < 2) { el.textContent = end; return; }
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } }); }, { threshold: 0.6 });
    nums.forEach(function (n) { co.observe(n); });
  }

  /* zaglavlje, paralaksa i vremenska crta */
  var nav = $(".nav"), par = $("[data-parallax]"), rails = $$("[data-rail]"), ticking = false;
  rails.forEach(function (r) { var fg = $(".fg", r); if (fg && !still) { fg.style.strokeDasharray = "1"; fg.setAttribute("pathLength", "1"); fg.style.strokeDashoffset = "1"; } });
  function frame() {
    ticking = false;
    var y = window.pageYOffset, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 30);
    if (par && !still) { var r = par.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) par.style.transform = "translate3d(0," + (-(r.top + r.height / 2 - vh / 2) * 0.12 - r.height * 0.07) + "px,0)"; }
    if (!still) rails.forEach(function (rail) {
      var b = rail.parentNode.getBoundingClientRect(), p = (vh * 0.72 - b.top) / b.height;
      p = Math.max(0, Math.min(1, p)); var fg = $(".fg", rail); if (fg) fg.style.strokeDashoffset = String(1 - p);
    });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener("resize", frame);
  frame();

  /* magnetni gumbi */
  if (!still && window.matchMedia("(hover: hover)").matches) $$(".btn").forEach(function (b) {
    b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.12 + "px," + (e.clientY - r.top - r.height / 2) * 0.2 + "px)"; });
    b.addEventListener("mouseleave", function () { b.style.transform = ""; });
  });

  /* upit → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime i prezime"], ["telefon", "Telefon"], ["email", "E-mail"], ["mjesto", "Mjesto"], ["vrsta", "Što trebam"], ["poruka", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + (f.get("vrsta") || "namještaj po mjeri") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s tkm-design.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });

  /* filtri galerije */
  var fbtn = $$(".filters button");
  fbtn.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      fbtn.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".pgroup").forEach(function (g) { g.hidden = !(f === "sve" || g.getAttribute("data-cat") === f); });
    });
  });

  /* povećanje fotografija */
  var lb = $(".lb");
  if (lb) {
    var shots = $$(".gal button"), li = $("img", lb), cap = $("p", lb), cur = 0, last = null;
    var vis = function () { return shots.filter(function (s) { return !s.closest(".pgroup").hidden; }); };
    var show = function (i) { var v = vis(); cur = (i + v.length) % v.length; var im = $("img", v[cur]); li.src = im.getAttribute("src"); li.alt = im.alt; cap.textContent = im.alt; };
    var close = function () { lb.classList.remove("open"); document.body.style.overflow = ""; if (last) last.focus(); };
    shots.forEach(function (s) { s.addEventListener("click", function () { last = s; show(vis().indexOf(s)); lb.classList.add("open"); document.body.style.overflow = "hidden"; $(".x", lb).focus(); }); });
    $(".x", lb).addEventListener("click", close);
    $(".pv", lb).addEventListener("click", function () { show(cur - 1); });
    $(".nx", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
    });
    if (location.hash) { var g = $(location.hash); if (g) setTimeout(function () { g.scrollIntoView(); }, 50); }
  }
})();
