/* Vinarija Andrović – skripta stranice (prijedlog) */
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
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o);
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* SVG crtanje: duljina linija */
  $$(".draw").forEach(function (p) {
    try { var L = Math.ceil(p.getTotalLength()) + 2; p.style.setProperty("--len", L); } catch (e) {}
  });

  /* skrol: zaglavlje, paralaksa slojeva, vremenska crta i čagalj */
  var nav = $(".nav"), layers = $$(".layer[data-depth]"), tl = $("[data-timeline]"), fill = $(".tl-fill"), run = $("[data-run]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset, h = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) {
      layers.forEach(function (l) { l.style.transform = "translate3d(0," + (y * parseFloat(l.dataset.depth) * -1).toFixed(1) + "px,0)"; });
      if (tl && fill) {
        var r = tl.getBoundingClientRect(), p = Math.min(Math.max((h * 0.7 - r.top) / r.height, 0), 1);
        fill.style.height = (p * (r.height - 12)) + "px";
      }
      if (run) {
        var box = run.parentNode.getBoundingClientRect(), q = Math.min(Math.max(1 - (box.top - h * 0.15) / (h * 0.8), 0), 1);
        run.style.transform = "translateX(" + ((box.width - 96) * q).toFixed(1) + "px)";
      }
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  if (reduce && fill) fill.style.height = "100%";

  /* brojači (s tisućicama, godine kreću od bliže vrijednosti) */
  function fmt(n) { return n >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : String(n); }
  function count(el) {
    var to = parseFloat(el.dataset.count), from = to > 1900 && to < 2100 ? to - 60 : 0, dur = 1500, t0 = null;
    if (reduce) { el.textContent = fmt(to); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
    }
    requestAnimationFrame(step);
  }
  $$("[data-count]").forEach(function (el) { el.textContent = fmt(parseFloat(el.dataset.count)); });

  /* otkrivanje pri skrolanju */
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  targets.forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.12) + "s"; });
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) {
      if (el.dataset.anim === "ln" && el.parentNode) {
        /* red naslova je skriven maskom (overflow), pa promatramo omotač */
        var lo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { el.classList.add("in"); lo.disconnect(); } }); });
        lo.observe(el.parentNode);
      } else io.observe(el);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* mikrointerakcije: magnetni gumb i nagib kartica */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".btn.acc").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* obrazac → pripremljeni e-mail */
  var FIELDS = [["name", "Ime i prezime"], ["phone", "Telefon"], ["what", "Zanima me"], ["people", "Broj osoba"], ["date", "Željeni datum"], ["message", "Poruka"]];
  $$("form.lead-form").forEach(function (fm) {
    var ok = $(".ok", fm);
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), out = [];
      FIELDS.forEach(function (k) { var v = f.get(k[0]); if (v) out.push(k[1] + ": " + v); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("what") || "Vinarija Andrović") + (f.get("date") ? " – " + f.get("date") : "")) + "&body=" + encodeURIComponent(out.join("\n") + "\n\nPoslano s web stranice Vinarije Andrović");
      if (ok) ok.style.display = "block";
    });
  });
})();
