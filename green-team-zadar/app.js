/* Green Team Zadar – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje + paralaksa fotografija (rAF, passive) */
  var plx = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect(), k = +el.getAttribute("data-parallax") || 0.08;
        if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* brojači (konačna vrijednost je već u HTML-u) */
  function count(el) {
    var end = parseFloat(el.getAttribute("data-count")), dec = +(el.getAttribute("data-dec") || 0), t0 = null, dur = 1500;
    function fmt(v) { return v.toFixed(dec).replace(".", ","); }
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(end * e); if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end); }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  var items = $$("[data-anim]");
  var pipes = $$(".pipe");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    pipes.forEach(function (p) { p.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, d = +(el.getAttribute("data-d") || 0);
        el.style.transitionDelay = (d * 0.09) + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io2.unobserve(e.target); } }); }, { threshold: 0.4 });
    pipes.forEach(function (p) { io2.observe(p); });
    /* naslov u heroju odmah, red po red */
    $$(".ln>[data-anim]").forEach(function (el, i) { io.unobserve(el); el.style.transitionDelay = (0.12 + i * 0.14) + "s"; requestAnimationFrame(function () { el.classList.add("in"); }); });
  }

  /* magnetni gumbi i nagib kartica */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(800px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* prije / poslije */
  $$(".ba").forEach(function (ba) {
    var inp = $("input", ba);
    if (!inp) return;
    function set(v) { ba.style.setProperty("--x", v + "%"); }
    inp.addEventListener("input", function () { set(inp.value); });
    set(inp.value);
    if (!reduce && "IntersectionObserver" in window) {
      var hint = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; hint.disconnect();
        var t0 = null;
        (function anim(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1800, 1), v = 50 + Math.sin(p * Math.PI * 2) * 22; set(v); inp.value = v; if (p < 1) requestAnimationFrame(anim); else { set(50); inp.value = 50; } })(performance.now());
      }, { threshold: 0.6 });
      hint.observe(ba);
    }
  });

  /* obrazac: tvrtka nema javni e-mail, pa se upit složi kao poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      var usl = f.getAll("usluga").join(", ");
      [["ime", "Ime"], ["telefon", "Telefon"], ["mjesto", "Lokacija"], ["opseg", "Jednokratno ili redovito"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      if (usl) body.push("Usluga: " + usl);
      if (f.get("poruka")) body.push("Opis: " + f.get("poruka"));
      var txt = "Upit za Green Team Zadar\n" + body.join("\n");
      var mail = fm.getAttribute("data-mail");
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Upit: " + (usl || "uređenje okoliša") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(txt);
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).catch(function () {});
      }
      var ok = $(".ok", fm); if (ok) { ok.style.display = "block"; var pre = $(".ok-txt", ok); if (pre) pre.textContent = txt; }
    });
  });
})();
