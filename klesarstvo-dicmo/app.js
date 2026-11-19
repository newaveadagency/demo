/* Klesarstvo Dicmo – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje se smanjuje + paralaksa (rAF, pasivni scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.08;
      if (r.bottom > 0 && r.top < innerHeight) {
        var t = (r.top + r.height / 2 - innerHeight / 2) * -k;
        el.style.transform = "translate3d(0," + t.toFixed(1) + "px,0)" + (el.tagName === "IMG" ? " scale(1.1)" : "");
      }
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1800, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (maske, crte, redovi naslova) */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.12) + "s"; });
  $$('[data-anim="line"][data-d]').forEach(function (el) { var s = el.firstElementChild; if (s) s.style.transitionDelay = (el.dataset.d * 0.14) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* indeks proizvoda: slika prati kursor */
  var peek = $(".peek");
  if (peek && fine && !reduce) {
    var px = 0, py = 0, tx = 0, ty = 0, raf = null;
    var loop = function () {
      px += (tx - px) * 0.16; py += (ty - py) * 0.16;
      peek.style.left = px.toFixed(1) + "px"; peek.style.top = py.toFixed(1) + "px";
      raf = Math.abs(tx - px) + Math.abs(ty - py) > 0.5 ? requestAnimationFrame(loop) : null;
    };
    $$(".index a[data-peek]").forEach(function (a) {
      a.addEventListener("mouseenter", function (e) {
        peek.style.backgroundImage = "url(" + a.dataset.peek + ")";
        if (!peek.classList.contains("show")) { px = tx = e.clientX + 180; py = ty = e.clientY; }
        peek.classList.add("show");
      });
      a.addEventListener("mouseleave", function () { peek.classList.remove("show"); });
      a.addEventListener("mousemove", function (e) { tx = e.clientX + 180; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    });
  }

  /* magnetni gumbi */
  if (fine && !reduce) $$(".hero .btn, .callout .btn").forEach(function (b) {
    b.addEventListener("mousemove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)";
    });
    b.addEventListener("mouseleave", function () { b.style.transform = ""; });
  });

  /* FAQ: jedan otvoren odgovor */
  $$(".faq details").forEach(function (d, _, all) {
    d.addEventListener("toggle", function () { if (d.open) $$(".faq details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* materijali: filtri i pretraga */
  var fbar = $(".filters");
  if (fbar) {
    var items = $$(".sw"), q = $("input", fbar), cat = "sve", empty = $(".empty");
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); };
    var apply = function () {
      var term = norm(q ? q.value : ""), any = false;
      items.forEach(function (it) {
        var ok = (cat === "sve" || it.dataset.cat === cat) && (!term || norm(it.textContent).indexOf(term) > -1);
        it.hidden = !ok; if (ok) any = true;
      });
      if (empty) empty.style.display = any ? "none" : "block";
    };
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        cat = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        apply();
      });
    });
    if (q) q.addEventListener("input", apply);
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["type", "Što me zanima"], ["model", "Oznaka modela"], ["material", "Materijal"], ["place", "Mjesto"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("type") || "Klesarstvo Dicmo") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Klesarstva Dicmo");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
