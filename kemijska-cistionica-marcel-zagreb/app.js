/* Eko kemijska čistionica „Marcel” – skripta stranice (demo) */
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

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav"), ticking = false;
  function onScroll() { if (nav) nav.classList.toggle("small", window.pageYOffset > 40); ticking = false; }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači (decimale s hrvatskim zarezom) */
  function fmt(v, dec) { return dec ? v.toFixed(dec).replace(".", ",") : String(Math.round(v)); }
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), dur = 1500, t0 = null;
    var from = to > 1000 ? to - 30 : to < 10 ? to - 0.9 : Math.round(to * 0.75);
    if (reduce) { el.textContent = fmt(to, dec); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e, dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to, dec);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = fmt(to, dec); }, dur + 300);
  }

  /* duljine SVG putanja za crtanje */
  $$(".hanger .draw").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.09) + "s"; });
  var heroEls = $$(".hero [data-anim], .page-hero [data-anim], .gridlines");
  requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }); });
  var targets = $$("[data-anim]").filter(function (el) { return heroEls.indexOf(el) < 0; }), counters = $$("[data-count]");
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

  /* radi li čistionica sada: pon–pet 8–14 i 17–19, sub 10–13 (Europe/Zagreb) */
  try {
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = +g("hour") + g("minute") / 60;
    var slots = day >= 1 && day <= 5 ? [[8, 14], [17, 19]] : day === 6 ? [[10, 13]] : [];
    var now = slots.filter(function (s) { return h >= s[0] && h < s[1]; })[0];
    var next = slots.filter(function (s) { return h < s[0]; })[0];
    $$("[data-open]").forEach(function (el) {
      el.classList.toggle("open", !!now);
      el.textContent = now ? "Sada radimo · do " + now[1] + " h" : next ? "Zatvoreno · otvaramo u " + next[0] + " h" : "Trenutno zatvoreno";
    });
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.dataset.day === day); });
  } catch (e) {}

  /* obrazac: ako postoji data-mail, otvara e-mail; inače prikaže pripremljeni tekst upita */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["komad", "Donosim"], ["rok", "Trebam do"], ["opis", "Opis"], ["ime", "Ime"], ["telefon", "Tel"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = "Upit za čistionicu Marcel\n" + body.join("\n");
      if (fm.dataset.mail) { location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + f.get("komad")) + "&body=" + encodeURIComponent(text); return; }
      var ok = $(".ok", fm);
      if (!ok) return;
      ok.innerHTML = "";
      var p1 = document.createElement("strong"); p1.textContent = "Vaš upit je spreman:";
      var pre = document.createElement("pre"); pre.textContent = text;
      var a = document.createElement("a"); a.className = "btn"; a.href = "tel:+385" + fm.dataset.tel.replace(/^0/, ""); a.textContent = "Nazovite 01 4651 009";
      ok.appendChild(p1); ok.appendChild(pre); ok.appendChild(a);
      ok.style.display = "block";
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    });
  });
})();
