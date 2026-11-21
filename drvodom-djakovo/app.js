/* Drvodom Đakovo – skripta stranice (demo) */
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

  /* zaglavlje se smanjuje + paralaksa (rAF, passive scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.05;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.1)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = to > 1000 ? to - 60 : 0, dur = 1500, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  targets.forEach(function (el) { if (el.dataset.d && el.dataset.anim !== "leaf") el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  } else {
    /* redovi naslova su maskirani (overflow:hidden), pa se prati njihov roditelj */
    var watch = function (el) { return el.dataset.anim === "up" ? el.parentNode : el; };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        targets.forEach(function (el) { if (watch(el) === e.target) el.classList.add("in"); });
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(watch(el)); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = el.dataset.count > 1000 ? el.dataset.count - 60 : 0; co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* magnetni gumb */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* galerija: filtri */
  var fbar = $(".filters"), figs = $$(".gal figure");
  if (fbar && figs.length) {
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        figs.forEach(function (fg) {
          var ok = f === "sve" || (" " + fg.dataset.cat + " ").indexOf(" " + f + " ") > -1;
          fg.hidden = !ok;
          if (ok) fg.classList.add("in");
        });
      });
    });
  }

  /* galerija: povećanje (lightbox) */
  var lb = $(".lb");
  if (lb && figs.length) {
    var lbImg = $("img", lb), lbCap = $("p", lb), cur = 0, last = null;
    var vis = function () { return figs.filter(function (f) { return !f.hidden; }); };
    function show(i) {
      var list = vis(); if (!list.length) return;
      cur = (i + list.length) % list.length;
      var im = $("img", list[cur]);
      lbImg.src = im.getAttribute("src"); lbImg.alt = im.alt; lbCap.textContent = im.alt;
    }
    function open(fg) { last = fg; show(vis().indexOf(fg)); lb.classList.add("open"); document.body.style.overflow = "hidden"; $(".x", lb).focus(); }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; if (last) last.focus(); }
    figs.forEach(function (fg) {
      fg.addEventListener("click", function () { open(fg); });
      fg.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(fg); } });
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
      [["name", "Ime i prezime"], ["phone", "Mobitel"], ["email", "E-mail"], ["place", "Mjesto ugradnje"], ["count", "Broj vrata"], ["decor", "Željeni dekor"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za vrata – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s drvodom.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
