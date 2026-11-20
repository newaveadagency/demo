/* Metalac Inox – demo: animacije, izbornik, galerija, obrazac upita */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. otkrivanje pri skrolanju (fade-up, maska redaka, diagonalni wipe, crtanje SVG-a) */
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    anims.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    anims.forEach(function (el) { io.observe(el); });
    // sigurnosna mreža: sve vidljivo nakon 4 s
    setTimeout(function () { anims.forEach(function (el) { el.classList.add("in"); }); }, 4000);
  }

  /* 2. zaglavlje se smanjuje + 3. paralaksa + 4. linija vremenske crte */
  var nav = $(".nav"), par = $$("[data-parallax]"), line = $("[data-line]"), ticking = false;
  function onScroll() {
    var y = window.scrollY || 0, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) {
      par.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var k = parseFloat(img.dataset.parallax) || 0.1;
        img.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + "px,0)";
      });
    }
    if (line) {
      var lr = line.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.75 - lr.top) / lr.height));
      line.style.setProperty("--p", reduce ? 1 : p.toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* izbornik na mobitelu */
  var burger = $(".burger");
  if (burger) burger.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { if (nav) nav.classList.remove("open"); }); });

  /* 5. brojači */
  var counters = $$("[data-count]");
  function runCount(el) {
    var to = parseInt(el.dataset.count, 10), from = to > 1000 ? to - 60 : 0, t0 = null, dur = 1600;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* 6. magnetni gumb + 7. nagib kartice */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* galerija: filtri i povećanje */
  var grid = $(".grid");
  if (grid) {
    var figs = $$("figure", grid);
    $$(".filters button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".filters button").forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var f = b.dataset.f;
        figs.forEach(function (fg) { fg.classList.toggle("hide", f !== "sve" && fg.dataset.cat !== f); });
      });
    });
    var lb = $(".lb"), lbImg = lb && $("img", lb), lbCap = lb && $("p", lb), cur = 0;
    function visible() { return figs.filter(function (f) { return !f.classList.contains("hide"); }); }
    function show(i) {
      var v = visible(); if (!v.length) return;
      cur = (i + v.length) % v.length;
      var im = $("img", v[cur]);
      lbImg.src = im.getAttribute("src"); lbImg.alt = im.alt;
      lbCap.textContent = ($("figcaption", v[cur]) || {}).textContent || "";
    }
    function open(fg) { show(visible().indexOf(fg)); lb.classList.add("open"); document.body.style.overflow = "hidden"; $(".x", lb).focus(); }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    figs.forEach(function (fg) {
      fg.tabIndex = 0;
      fg.addEventListener("click", function () { open(fg); });
      fg.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(fg); } });
    });
    if (lb) {
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
  }

  /* obrazac upita: pripremljena e-pošta */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["service", "Vrsta radova"], ["place", "Mjesto"], ["message", "Opis"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + (f.get("service") || "inox") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Metalac Inox");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
