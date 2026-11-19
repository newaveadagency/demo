/* OPG Bembo – interakcije (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. zaglavlje: tamnije i manje pri skrolanju; na podstranicama sa svijetlim herojem odmah tamno */
  var nav = $(".nav");
  if (nav && !$(".hero") && !$(".phero.dark")) nav.classList.add("solid");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 40); }
  onScroll();

  /* 2. izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* 3. otkrivanje pri skrolanju (fade-up, maska redaka, clip-path slika) */
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    anims.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    anims.forEach(function (el) {
      /* retci u maski (.ln ima overflow:hidden) i clip-path slike nemaju vidljivu površinu – promatramo roditelja */
      var kind = el.getAttribute("data-anim");
      if ((kind === "line" || kind === "clip") && el.parentNode) {
        var lio = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { el.classList.add("in"); lio.disconnect(); } });
        }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
        lio.observe(el.parentNode);
      } else io.observe(el);
    });
  }

  /* 4. brojači */
  function count(el) {
    var to = parseInt(el.getAttribute("data-count"), 10), t0 = null, dur = 1800;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = v;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* 5. SVG crtanje grančice masline */
  $$(".draw").forEach(function (svg) {
    if (reduce || !("IntersectionObserver" in window)) { svg.classList.add("drawn"); return; }
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { svg.classList.add("drawn"); dio.disconnect(); } });
    }, { threshold: 0.4 });
    dio.observe(svg);
  });

  /* 6. paralaksa slika + crta vremenske linije (rAF, pasivni scroll) */
  var par = $$("[data-par]"), tl = $(".tl-line"), tlWrap = $(".tl-wrap"), ticking = false;
  if (tl && !reduce) { tl.style.transformOrigin = "top"; tl.style.transform = "scaleY(0)"; }
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    if (!reduce) {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var k = parseFloat(el.getAttribute("data-par")) || 0.1;
        el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + "px,0)";
      });
      if (tl && tlWrap) {
        var w = tlWrap.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (vh * 0.75 - w.top) / w.height));
        tl.style.transform = "scaleY(" + p.toFixed(3) + ")";
      }
    }
  }
  window.addEventListener("scroll", function () {
    onScroll();
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }, { passive: true });
  window.addEventListener("resize", frame);
  frame();

  /* 7. magnetni gumbi (samo miš) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* 8. galerija – lightbox */
  var lb = $(".lb");
  if (lb) {
    var lbImg = $("img", lb);
    var close = function () { lb.hidden = true; lbImg.removeAttribute("src"); };
    $$("[data-lb]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        lbImg.src = a.getAttribute("href");
        lbImg.alt = ($("img", a) || {}).alt || "";
        lb.hidden = false;
        $(".lb-x", lb).focus();
      });
    });
    lb.addEventListener("click", function (e) { if (e.target !== lbImg) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lb.hidden) close(); });
  }

  /* 9. obrasci: pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = fm.querySelector("[name=name]");
      if (!name.value.trim()) { name.focus(); name.setCustomValidity("Upišite ime i prezime."); fm.reportValidity(); name.setCustomValidity(""); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["topic", "Upit"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Upit") + " – " + f.get("name")) +
        "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s bembo.eu");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
