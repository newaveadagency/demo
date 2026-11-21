/* Pizza Place Destino – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik na mobitelu */
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

  /* zaglavlje se smanjuje + paralaksa slika (rAF, pasivni scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.getAttribute("data-parallax")) || 0.06;
      if (r.bottom > -100 && r.top < innerHeight + 100) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.14)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.getAttribute("data-count")), dur = 1400, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), k = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * k);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  targets.forEach(function (el) { var d = el.getAttribute("data-d"); if (d) el.style.transitionDelay = (d * 0.09) + "s"; });
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains("in")) {
      t.style.transitionDelay = "";
      /* luk peći: nakon slaganja segmenti tinjaju jedan za drugim */
      if (t.classList.contains("seg") && !reduce) { t.style.animationDelay = (t.getAttribute("data-d") * 0.35) + "s"; t.classList.add("glow"); }
    }
  });

  /* magnetni gumb */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* otvoreno / zatvoreno: pon–pet 7–23:30, sub 8–23:30, ned zatvoreno (Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60;
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1, sat = d === "Sat";
      var open = (wk && h >= 7 && h < 23.5) || (sat && h >= 8 && h < 23.5);
      el.classList.add(open ? "open" : "closed");
      el.setAttribute("title", open ? "Sada otvoreno, do 23:30" : "Sada zatvoreno");
    } catch (e) {}
  });

  /* jelovnik: veličina, kategorije, pretraga */
  var mw = $(".menu-wrap"), fbar = $(".filters");
  if (mw && fbar) {
    $$(".sizes button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        mw.setAttribute("data-size", b.getAttribute("data-size"));
        $$(".sizes button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      });
    });
    var groups = $$(".pgroup", mw), q = $("input", fbar), cat = "sve", empty = $(".empty", mw);
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); };
    var apply = function () {
      var term = norm(q ? q.value.trim() : ""), anyAll = false;
      groups.forEach(function (gr) {
        var catOk = cat === "sve" || gr.getAttribute("data-cat") === cat, any = false;
        $$(".pitem", gr).forEach(function (it) {
          var ok = catOk && (!term || norm(it.textContent).indexOf(term) > -1);
          it.hidden = !ok; if (ok) any = true;
        });
        gr.hidden = !any; if (any) anyAll = true;
      });
      if (empty) empty.style.display = anyAll ? "none" : "block";
    };
    $$(".cats button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        cat = b.getAttribute("data-f");
        $$(".cats button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        apply();
      });
    });
    if (q) q.addEventListener("input", apply);
  }

  /* obrazac → pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["type", "Vrsta upita"], ["date", "Datum i vrijeme"], ["people", "Broj osoba"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent((f.get("type") || "Upit") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano sa stranice Pizza Place Destino");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
