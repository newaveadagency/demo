/* Broč · OPG Pero Šantić – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik (mobitel) */
  var nav = $(".nav"), burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      nav.classList.toggle("open-m", o);
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); nav.classList.remove("open-m"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje: prozirno preko hero fotografije, smanjuje se pri skrolanju */
  var hasHero = document.body.classList.contains("has-hero");
  function onHead() {
    if (!nav) return;
    var y = window.pageYOffset;
    nav.classList.toggle("small", y > 60);
    nav.classList.toggle("over", hasHero && y <= 60);
  }
  onHead();
  window.addEventListener("scroll", onHead, { passive: true });
  window.addEventListener("load", onHead);

  /* SVG crtanje: duljina poteza */
  $$('[data-anim="draw"] path, [data-anim="draw"] ellipse').forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
  });

  /* otkrivanje pri skrolanju */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    items.forEach(function (el) {
      if (el.hasAttribute("data-now")) {
        var d = +el.getAttribute("data-now") || 0;
        setTimeout(function () { el.classList.add("in"); }, 120 + d * 140);
      } else io.observe(el);
    });
  }

  /* brojači */
  function fmt(n, sep) { var s = String(n); return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : s; }
  $$("[data-count]").forEach(function (el) {
    if (reduce || !("IntersectionObserver" in window)) return;
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0), sep = el.hasAttribute("data-sep"), suf = el.getAttribute("data-suf") || "";
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      var t0 = performance.now(), dur = 1800;
      (function tick(t) {
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(Math.round(from + (to - from) * e), sep) + suf;
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.4 });
    o.observe(el);
  });

  /* paralaksa */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var run = function () {
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var k = +(el.getAttribute("data-parallax") || 0.15);
        el.style.transform = "translate3d(0," + ((r.top) * -k).toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* nagib kartica proizvoda */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime i prezime"], ["telefon", "Telefon"], ["email", "E-mail"], ["tema", "Upit za"], ["datum", "Željeni termin"], ["osoba", "Broj osoba"], ["poruka", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent((f.get("tema") || "Upit") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice broc.com.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
