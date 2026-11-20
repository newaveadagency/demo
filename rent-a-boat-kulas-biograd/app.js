/* Kulaš Rent a Boat – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { if (menu) menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje se smanjuje + paralaksa slike u luku */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.08;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1500, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (kašnjenje preko data-d), crtanje rute */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  /* redovi naslova su skriveni u roditelju s overflow:hidden, pa se pokreću odmah */
  $$('[data-anim="line"]').forEach(function (el) { setTimeout(function () { el.classList.add("in"); }, 120); });
  var targets = $$('[data-anim]:not([data-anim="line"]), .stops'), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* galerija broda: sličice mijenjaju glavnu fotografiju */
  $$(".fb").forEach(function (fb) {
    var main = $(".main img", fb);
    $$(".th", fb).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!main) return;
        $$(".th", fb).forEach(function (x) { x.classList.toggle("on", x === b); });
        main.style.opacity = 0;
        setTimeout(function () { main.src = b.dataset.src; main.style.opacity = 1; }, reduce ? 0 : 200);
      });
    });
  });

  /* flota: filtri */
  var fbar = $(".filters");
  if (fbar) {
    var boats = $$(".fb"), empty = $(".empty");
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.dataset.f, any = false;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        boats.forEach(function (el) {
          var pax = +el.dataset.pax, k = el.dataset.kind;
          var ok = f === "sve" || f === k || (f === "malo" && pax <= 8) || (f === "vise" && pax >= 9);
          el.hidden = !ok; if (ok) { any = true; el.querySelectorAll("[data-anim]").forEach(function (a) { a.classList.add("in"); }); }
        });
        if (empty) empty.style.display = any ? "none" : "block";
      });
    });
  }

  /* cjenik: odabir razdoblja (na mobitelu prikazuje samo odabrani stupac) */
  var sbar = $(".seasons"), table = $(".ptable");
  if (sbar && table) {
    $$("button", sbar).forEach(function (b) {
      b.addEventListener("click", function () {
        table.setAttribute("data-s", b.dataset.s);
        $$("button", sbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      });
    });
  }

  /* upit: ?brod=… unaprijed odabere brod */
  var fm0 = $("form.lead-form");
  if (fm0) {
    var m = /[?&]brod=([^&#]+)/.exec(location.search), sel = $('select[name="boat"]', fm0);
    if (m && sel) {
      var id = decodeURIComponent(m[1]).replace(/-/g, " ").toLowerCase();
      $$("option", sel).forEach(function (o) {
        var t = o.textContent.toLowerCase().replace(/\./g, "").replace(/[^a-z0-9 ]/g, " ");
        if (id.split(" ").every(function (w) { return t.indexOf(w) > -1; })) sel.value = o.value || o.textContent;
      });
    }
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["boat", "Brod"], ["date", "Datum"], ["people", "Broj osoba"], ["term", "Najam"], ["place", "Preuzimanje"], ["message", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za najam broda – " + (f.get("boat") || "Kulaš Rent a Boat") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
