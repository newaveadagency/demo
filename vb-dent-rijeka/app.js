/* VB dent – demo. Bez vanjskih biblioteka. */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* 1. Zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  function onNav() { if (nav) nav.classList.toggle("small", window.scrollY > 30); }
  onNav(); window.addEventListener("scroll", onNav, { passive: true });

  /* Izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* 2. Otkrivanje pri skrolanju (fade-up, maska retka, clip-path, scale, SVG crtanje) */
  var items = $$("[data-anim]");
  items.forEach(function (el) { var d = +el.getAttribute("data-d") || 0; el.style.transitionDelay = (d * 0.09) + "s"; });
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target._animEl || e.target;
        t.classList.add("in"); io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) {
      /* maska: element je izvan roditelja s overflow:hidden, pa promatramo roditelja */
      if (el.getAttribute("data-anim") === "mask" && el.parentNode) { el.parentNode._animEl = el; io.observe(el.parentNode); }
      else io.observe(el);
    });
  }

  /* 3. Brojači */
  function count(el) {
    var to = +el.getAttribute("data-count"), from = to > 1000 ? to - 40 : 0, t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cs = $$("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    cs.forEach(function (el) { co.observe(el); });
  }

  /* 4. Reflektor koji prati kursor (hero) i sjaj na staklenim karticama */
  if (fine && !reduce) {
    $$(".hero, .phero").forEach(function (h) {
      var spot = $(".spot", h);
      if (!spot) return;
      h.addEventListener("pointermove", function (e) {
        var r = h.getBoundingClientRect();
        spot.style.setProperty("--mx", (e.clientX - r.left) + "px");
        spot.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
    $$(".card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--cx", (e.clientX - r.left) + "px");
        c.style.setProperty("--cy", (e.clientY - r.top) + "px");
      });
    });

    /* 5. Nagib (tilt) kartica i hero fotografije */
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateY(" + (x * 6) + "deg) rotateX(" + (-y * 6) + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });

    /* 6. Magnetni gumbi */
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--x", ((e.clientX - r.left - r.width / 2) * 0.18) + "px");
        b.style.setProperty("--y", ((e.clientY - r.top - r.height / 2) * 0.25) + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--x", "0px"); b.style.setProperty("--y", "0px"); });
    });
  }

  /* 7. Paralaksa slika (rAF, pasivni scroll) + 8. crta vremenske linije koja se iscrtava */
  var px = $$("[data-parallax]"), line = $("[data-line]"), tlBox = $(".timeline"), ticking = false;
  if (line && !reduce) { line.style.transformOrigin = "top"; line.style.transformBox = "fill-box"; }
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    px.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var k = +img.getAttribute("data-parallax") || 0.06, off = (r.top + r.height / 2 - vh / 2) * -k;
      img.style.transform = "translate3d(0," + (off - r.height * 0.07) + "px,0)";
    });
    if (line && tlBox) {
      var b = tlBox.getBoundingClientRect(), p = Math.max(0, Math.min(1, (vh * 0.75 - b.top) / b.height));
      line.style.transform = "scaleY(" + p.toFixed(3) + ")";
    }
  }
  if (!reduce && (px.length || line)) {
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* Aktivna stavka u popisu usluga */
  var toc = $$(".toc a");
  if (toc.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) toc.forEach(function (a) { a.classList.toggle("act", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$(".svc").forEach(function (s) { so.observe(s); });
  }

  /* Obrazac: priprema e-poruke */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["date", "Željeni termin"], ["service", "Razlog dolaska"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Upit za termin – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice VB dent");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
