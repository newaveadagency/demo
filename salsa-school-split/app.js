/* Salsa School Split – interakcije i animacije (bez vanjskih skripti) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* 1. zaglavlje se smanjuje + mobilni izbornik */
  var nav = $(".nav");
  function onScrollNav() { if (nav) nav.classList.toggle("small", window.scrollY > 40); }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });
  var burger = $(".burger");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* 2. otkrivanje pri skrolanju (fade-up, clip-path, scale) + redoslijed u grupama */
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    anims.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [];
        var i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i * 90, 450) + "ms";
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    anims.forEach(function (el) {
      if (el.closest(".ln")) { setTimeout(function () { el.classList.add("in"); }, 150 + 140 * Array.prototype.indexOf.call(el.closest("h1").children, el.parentElement)); return; }
      io.observe(el);
    });
  }

  /* 3. kinetički naslov: riječi se izmjenjuju */
  var rot = $(".rot");
  if (rot && !reduce) {
    (rot.getAttribute("data-words") || "").split("|").forEach(function (w) { if (!w) return; var b = document.createElement("b"); b.className = "grad-t"; b.textContent = w; rot.appendChild(b); });
    var words = $$("b", rot), k = 0;
    setInterval(function () {
      var cur = words[k]; k = (k + 1) % words.length; var nxt = words[k];
      cur.classList.remove("on"); cur.classList.add("off");
      nxt.classList.remove("off"); nxt.classList.add("on");
      setTimeout(function () { cur.classList.remove("off"); }, 650);
    }, 2200);
  }

  /* 4. brojači */
  var counters = $$("[data-count]");
  function runCount(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), start = end > 1000 ? end - 60 : 0, t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduce && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* 5. SVG crta puta plesača se iscrtava */
  $$("[data-path]").forEach(function (box) {
    var p = $("svg.line path", box);
    if (p && p.getTotalLength) box.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 10);
    if (reduce || !("IntersectionObserver" in window)) { box.classList.add("in"); return; }
    var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { box.classList.add("in"); pio.disconnect(); } }); }, { threshold: 0.3 });
    pio.observe(box);
  });

  /* 6. paralaksa + vodoravna galerija vezana uz skrol */
  var heroImg = $("[data-parallax] img"), inner = $$("[data-parallax-in]");
  var hg = $("[data-hg]"), track = hg && $(".hg-track", hg), bar = hg && $(".hg-bar i", hg);
  var wide = window.matchMedia("(min-width: 821px)");
  function setupHg() {
    if (!hg || !track) return;
    var on = !reduce && wide.matches;
    hg.classList.toggle("pin", on);
    if (!on) { track.style.transform = ""; hg.style.removeProperty("--hgh"); return; }
    var dist = track.scrollWidth - window.innerWidth + 40;
    hg.style.setProperty("--hgh", (window.innerHeight + Math.max(0, dist)) + "px");
    hg._dist = Math.max(0, dist);
  }
  setupHg();
  window.addEventListener("resize", setupHg);
  window.addEventListener("load", setupHg);
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    if (heroImg && y < vh * 1.2) heroImg.style.transform = "translate3d(0," + (y * 0.25) + "px,0)";
    inner.forEach(function (im) {
      var r = im.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var c = (r.top + r.height / 2 - vh / 2) / vh;
      im.style.transform = "translate3d(0," + (c * -40) + "px,0)";
    });
    if (hg && hg.classList.contains("pin")) {
      var r2 = hg.getBoundingClientRect(), total = hg.offsetHeight - vh;
      var p = Math.min(1, Math.max(0, -r2.top / (total || 1)));
      track.style.transform = "translate3d(" + (-p * hg._dist) + "px,0,0)";
      if (bar) bar.parentElement.style.setProperty("--p", p.toFixed(3));
    }
  }
  if (!reduce) {
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* 7. reflektor koji prati kursor u heroju */
  if (!reduce && fine) {
    $$(".hero, .phero").forEach(function (h) {
      var gl = $(".glow", h); if (!gl) return;
      h.addEventListener("pointermove", function (e) {
        var r = h.getBoundingClientRect();
        gl.style.setProperty("--mx", (e.clientX - r.left) + "px");
        gl.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    /* 8. magnetni gumbi */
    $$(".btn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });

    /* 9. nagib kartica */
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* 10. filtar grupa (raspored) */
  var fb = $$(".filters button");
  fb.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      fb.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".g").forEach(function (g) {
        var show = f === "sve" || g.getAttribute("data-cat") === f;
        g.classList.toggle("hide", !show);
        if (show) g.classList.add("in");
      });
    });
  });

  /* 11. obrazac otvara pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["program", "Program"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za upis: " + (f.get("program") || "tečaj") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano sa stranice Salsa School Split");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
