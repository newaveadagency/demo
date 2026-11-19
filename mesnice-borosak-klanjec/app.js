/* Mesnice Borošak – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* zaglavlje se smanjuje + paralaksa hero fotografije */
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

  /* brojači (1932 kreće od 1900, ostali od 0) */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = to > 1000 ? to - 32 : 0, dur = 1500, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.09) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* nagib kartica prema mišu */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".prod, .card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(700px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* trenutno vrijeme u Hrvatskoj */
  function nowZg() {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    return { d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")) + 1, h: +g("hour") % 24 + g("minute") / 60 };
  }
  function parseHours(s) { var o = {}; (s || "").split(";").forEach(function (x) { var m = x.match(/(\d):(\d+)-(\d+)/); if (m) o[m[1]] = [+m[2], +m[3]]; }); return o; }
  var DAYS = ["", "ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu", "nedjelju"];
  function state(hrs, n) {
    var t = hrs[n.d];
    if (t && n.h >= t[0] && n.h < t[1]) return { open: true, txt: "Sada otvoreno · do " + t[1] + " h" };
    if (t && n.h < t[0]) return { open: false, txt: "Zatvoreno · otvara danas u " + t[0] + " h" };
    for (var i = 1; i <= 7; i++) { var d = (n.d - 1 + i) % 7 + 1; if (hrs[d]) return { open: false, txt: "Zatvoreno · otvara " + (i === 1 ? "sutra" : "u " + DAYS[d]) + " u " + hrs[d][0] + " h" }; }
    return { open: false, txt: "Zatvoreno" };
  }
  try {
    var n = nowZg();
    $$("[data-hours]").forEach(function (el) {
      var s = state(parseHours(el.dataset.hours), n);
      el.classList.add(s.open ? "open" : "closed"); el.textContent = s.txt;
    });
    $$("[data-open]").forEach(function (el) {
      var s = state(parseHours("1:8-17;2:8-17;3:8-17;4:8-17;5:8-17;6:8-14"), n);
      el.classList.add(s.open ? "open" : "closed");
      el.textContent = "Klanjec, Lijepe naše 33 · " + s.txt.toLowerCase();
    });
  } catch (e) {}

  /* filtar prodavaonica */
  var fbar = $(".filters");
  if (fbar) {
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        $$("[data-group]").forEach(function (g) { g.hidden = f !== "sve" && g.dataset.group !== f; });
        $$(".shop-h").forEach(function (h) { h.hidden = f !== "sve" && h.id !== f; });
      });
    });
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["product", "Što naručujem / zanima me"], ["shop", "Preuzimanje u prodavaonici"], ["date", "Datum preuzimanja"], ["people", "Broj osoba / količina"], ["message", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("product") || "Mesnice Borošak") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s mesnice-borosak.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
