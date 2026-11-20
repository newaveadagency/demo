/* Caffe bar 032, Vukovar – skripta stranice (demo) */
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

  /* zaglavlje se smanjuje + paralaksa (rAF, passive scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = "translate3d(0," + (-8 + p * -10).toFixed(2) + "%,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači (decimalni zarez, točka za tisućice) */
  function fmt(v, dec, sep) {
    if (dec) return v.toFixed(dec).replace(".", ",");
    var s = String(Math.round(v));
    return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : s;
  }
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), sep = !!el.dataset.sep, dur = 1500, t0 = null;
    var from = to < 10 ? to - 1.6 : Math.round(to * 0.4);
    if (reduce) { el.textContent = fmt(to, dec, sep); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e, dec, sep);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to, dec, sep);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = fmt(to, dec, sep); }, dur + 300);
  }

  /* duljine SVG putanja za crtanje (neonski okvir, linija dana) */
  $$(".tl-line path").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {}
  });

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  var heroEls = $$(".hero [data-anim], .page-hero [data-anim]");
  requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }); });
  var targets = $$("[data-anim]").filter(function (el) { return heroEls.indexOf(el) < 0; }), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.concat(heroEls).forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = fmt(parseFloat(el.dataset.count), parseInt(el.dataset.dec || "0", 10), !!el.dataset.sep); });
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

  /* mikrointerakcije samo za miš: magnetni gumbi i nagib kartica */
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    $$(".hero .btn, .band .btn, .cta-band .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".rev").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* radi li lokal sada (Europe/Zagreb): pon–čet 6–24, pet–sub 6–2, ned 7–24 */
  try {
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var opens = day === 0 ? 7 : 6, closes = day === 5 || day === 6 ? 26 : 24;
    var lateNight = (day === 6 || day === 0) && h < 2; /* petak/subota navečer traje do 2 */
    var open = lateNight || h >= opens;
    var closeTxt = lateNight ? "2" : closes === 26 ? "2" : "24";
    $$("[data-open]").forEach(function (el) {
      el.classList.toggle("open", open);
      el.textContent = open ? "Sada radimo · do " + closeTxt + " h" : "Otvaramo danas u " + opens + " h";
    });
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.dataset.day === day); });
  } catch (e) {}

  /* obrazac: slaže e-poruku (mailto) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["datum", "Datum"], ["vrijeme", "Vrijeme"], ["osobe", "Broj osoba"], ["mjesto", "Mjesto"], ["povod", "Povod"], ["ime", "Ime"], ["telefon", "Telefon"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = "Pozdrav, molim stol u Caffe baru 032.\n\n" + body.join("\n");
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za stol: " + f.get("datum") + " u " + f.get("vrijeme")) + "&body=" + encodeURIComponent(text);
    });
  });
})();
