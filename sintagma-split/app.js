/* Sintagma Split – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav"), ticking = false;
  function onScroll() { if (nav) nav.classList.toggle("small", window.pageYOffset > 30); ticking = false; }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1400, t0 = null;
    if (reduce) { el.textContent = to; return; }
    t0 = Date.now();
    (function step() {
      var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) setTimeout(step, 16); else el.textContent = to;
    })();
  }

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.08) + "s"; });
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
    targets.forEach(function (el) {
      if (el.dataset.anim === "line") { setTimeout(function () { el.classList.add("in"); }, 120); return; }
      io.observe(el);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* pozdrav na više jezika u heroju */
  var hb = $("[data-hello]");
  if (hb && !reduce) {
    var words = ["Hello!", "Bonjour!", "Hallo!", "Ciao!", "¡Hola!", "Bok!"], wi = 0;
    setInterval(function () {
      var cur = $("span", hb);
      if (!cur) return;
      cur.classList.add("out");
      setTimeout(function () {
        wi = (wi + 1) % words.length;
        cur.textContent = words[wi];
        cur.classList.remove("out"); cur.classList.add("pre");
        void cur.offsetWidth;
        cur.classList.remove("pre");
      }, 450);
    }, 2400);
  }

  /* blagi nagib kartica */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* otvoreno / zatvoreno – pon–pet 9–13 i 17–20, sub 9–13 (Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = +g("hour") + g("minute") / 60;
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1, sat = d === "Sat";
      var open = (wk && ((h >= 9 && h < 13) || (h >= 17 && h < 20))) || (sat && h >= 9 && h < 13);
      var msg;
      if (open) msg = "Sada radimo · do " + (h < 13 ? "13" : "20") + " h";
      else if (wk && h >= 13 && h < 17) msg = "Pauza · ponovno od 17 h";
      else msg = "Sada ne radimo · javite se e-mailom";
      el.classList.toggle("open", open);
      el.textContent = msg;
    } catch (e) {}
  });

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["service", "Zanima me"], ["language", "Jezik / razina"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("service") || "Sintagma") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
