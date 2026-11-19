/* Autoškola Kalelarga – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik (mobitel) */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { if (!menu) return; menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje se smanjuje, traka napretka, paralaksa */
  var nav = $(".nav"), prog = $(".progress"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset, h = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle("small", y > 60);
    if (prog) prog.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0).toFixed(4) + ")";
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + (r.top * -0.08).toFixed(1) + "px,0) scale(1.1)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseInt(el.dataset.count, 10), dur = 1400, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }

  /* otkrivanja pri skrolanju (stagger preko data-d) */
  $$("[data-anim]").forEach(function (el) {
    if (!el.dataset.d) return;
    var d = (el.dataset.d * 0.1) + "s";
    if (el.dataset.anim === "line") { var s = el.firstElementChild; if (s) s.style.transitionDelay = d; }
    else el.style.transitionDelay = d;
  });
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
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains("in")) t.style.transitionDelay = "";
  });

  /* FAQ: otvoren samo jedan odgovor */
  var qas = $$(".qa");
  qas.forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) qas.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* otvoreno / zatvoreno – pon–pet 8–20, sub 8–13 (Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = +g("hour") + g("minute") / 60;
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1, sat = d === "Sat";
      var open = (wk && h >= 8 && h < 20) || (sat && h >= 8 && h < 13);
      el.classList.toggle("open", open);
      el.textContent = open ? ("Sada otvoreno · do " + (sat ? "13" : "20") + " h") : "Sada zatvoreno · pon–pet 8–20, sub 8–13";
    } catch (e) {}
  });

  /* obrazac → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["category", "Kategorija"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za upis – " + (f.get("category") || "autoškola") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
