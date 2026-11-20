/* Kristoš – OPG Preložnjak – skripta stranice (demo) */
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
      var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.05;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači (decimale s hrvatskim zarezom; godine broje od data-from) */
  function fmt(v, dec) { return dec ? v.toFixed(dec).replace(".", ",") : String(Math.round(v)); }
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), from = to > 1900 && to < 2100 ? to - 30 : 0, dur = 1500, t0 = null;
    if (reduce) { el.textContent = fmt(to, dec); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e, dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to, dec);
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju, crtanje SVG linija */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  var heroEls = $$(".hero [data-anim], .page-hero [data-anim]");
  requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }); });
  var targets = $$("[data-anim], .tl, .chili-draw").filter(function (el) { return heroEls.indexOf(el) < 0; }), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = fmt(parseFloat(el.dataset.count), parseInt(el.dataset.dec || "0", 10)); });
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

  /* nagib kartica (miš) */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".card, .rev").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* radno vrijeme uživo: pon–pet 13–17, sub 9–13 (Europe/Zagreb) */
  try {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = +g("hour") + g("minute") / 60;
    var win = day >= 1 && day <= 5 ? [13, 17] : day === 6 ? [9, 13] : null;
    var open = !!win && h >= win[0] && h < win[1];
    var txt = open ? "Sada smo otvoreni · do " + win[1] + " h" : (win && h < win[0] ? "Danas otvaramo u " + win[0] + " h" : "Pon – pet 13 – 17 · sub 9 – 13 h");
    $$("[data-open]").forEach(function (el) { el.classList.toggle("open", open); el.textContent = txt; });
    $$("[data-open-text]").forEach(function (el) { el.textContent = open ? "Sada smo otvoreni" : "Radno vrijeme"; });
    $$("[data-hours] tr").forEach(function (tr) { if (+tr.dataset.day === day) tr.classList.add("today"); });
  } catch (e) {}

  /* ljutomjer (logaritamska ljestvica 10^2 – 10^6,4) */
  var bar = $("#shu-bar"), read = $("#shu"), nm = $("#shu-name"), note = $("#shu-note"), shown = 100;
  function nf(v) { return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function setHeat(btn) {
    var v = +btn.dataset.shu, w = Math.max(4, Math.min(100, (Math.log10(v) - 2) / 4.4 * 100));
    $$(".picks button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
    bar.style.setProperty("--w", w.toFixed(1) + "%");
    nm.textContent = btn.dataset.name; note.textContent = btn.dataset.note;
    var a = shown, t0 = null;
    if (reduce) { read.textContent = nf(v); shown = v; return; }
    (function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / 1100, 1), e = 1 - Math.pow(1 - k, 3);
      read.textContent = nf(Math.pow(10, Math.log10(a) + (Math.log10(v) - Math.log10(a)) * e));
      if (k < 1) requestAnimationFrame(step); else { read.textContent = nf(v); shown = v; }
    })(performance.now());
  }
  if (bar) {
    $$(".picks button").forEach(function (b) { b.addEventListener("click", function () { setHeat(b); }); });
    bar.style.setProperty("--w", "4%");
  }

  /* galerija – povećanje */
  var lb = $(".lb"), figs = $$(".gal figure"), cur = 0;
  function show(i) {
    cur = (i + figs.length) % figs.length;
    var im = $("img", figs[cur]);
    $("img", lb).src = im.getAttribute("src"); $("img", lb).alt = im.alt; $("p", lb).textContent = im.alt;
  }
  if (lb && figs.length) {
    figs.forEach(function (f, i) { $("button", f).addEventListener("click", function () { show(i); lb.classList.add("on"); $(".x", lb).focus(); }); });
    $(".x", lb).addEventListener("click", function () { lb.classList.remove("on"); });
    $(".pv", lb).addEventListener("click", function () { show(cur - 1); });
    $(".nx", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("on"); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") lb.classList.remove("on");
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* obrazac – složi SMS (OPG nema javni e-mail); ako se upiše data-mail, šalje e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["sto", "Zanima me"], ["poruka", "Poruka"], ["ime", "Ime"], ["telefon", "Tel"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = "Upit s web stranice\n" + body.join("\n");
      if (fm.dataset.mail) location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + f.get("sto") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(text);
      else location.href = "sms:" + fm.dataset.sms + "?&body=" + encodeURIComponent(text);
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
