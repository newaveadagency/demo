/* Foto Lido – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    var close = function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* zaglavlje se smanjuje + paralaksa slika */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* sjaj i reflektor na karticama prate kursor */
  if (fine && !reduce) {
    var root = document.documentElement, raf = 0, mx = 0, my = 0;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () { root.style.setProperty("--mx", mx + "px"); root.style.setProperty("--my", my + "px"); raf = 0; });
    }, { passive: true });
    $$(".card, .spot").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--x", (e.clientX - r.left) + "px");
        c.style.setProperty("--y", (e.clientY - r.top) + "px");
      });
    });
    /* magnetni gumbi */
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
        b.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); });
    });
  }

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = to > 100 ? to - 60 : 0, dur = 1400, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju + crtanje linije */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.09) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]"), steps = $$(".steps");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    steps.forEach(function (el) { el.classList.add("drawn"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) {
      /* elementi u maski (.ln) su izrezani, pa se promatra roditelj */
      if (el.parentNode.classList && el.parentNode.classList.contains("ln")) {
        var po = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { el.classList.add("in"); po.disconnect(); } });
        po.observe(el.parentNode);
      } else io.observe(el);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("drawn"); so.unobserve(e.target); } });
    }, { threshold: 0.3 });
    steps.forEach(function (el) { so.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* blenda se okreće brže dok se skrola */
  var blades = $(".aperture .blades");
  if (blades && !reduce) {
    var last = window.pageYOffset;
    window.addEventListener("scroll", function () {
      var y = window.pageYOffset, v = Math.min(Math.abs(y - last), 60); last = y;
      blades.style.animationDuration = Math.max(6, 40 - v * 0.6) + "s";
    }, { passive: true });
  }

  /* otvoreno / zatvoreno – pon–pet 9–13 i 18–20, sub 9–13 (Europe/Zagreb) */
  try {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = g("weekday"), h = +g("hour") + g("minute") / 60;
    var di = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(d);
    var wk = di >= 1 && di <= 5, sat = di === 6;
    var open = ((wk || sat) && h >= 9 && h < 13) || (wk && h >= 18 && h < 20);
    var msg;
    if (open) msg = "Sada otvoreno · do " + (h < 13 ? "13" : "20") + " h";
    else if (wk && h >= 13 && h < 18) msg = "Pauza · otvaramo u 18 h";
    else msg = "Sada zatvoreno · Varoška 4, Zadar";
    $$("[data-open]").forEach(function (el) { el.classList.add(open ? "open" : "closed"); el.textContent = msg; });
    $$(".hours tr[data-day]").forEach(function (tr) { tr.classList.toggle("today", +tr.dataset.day === di); });
  } catch (e) {}

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["service", "Usluga"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("service") || "Foto Lido") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
