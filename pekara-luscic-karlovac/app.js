/* Pekara Luščić – skripta stranice (prijedlog) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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

  /* radno vrijeme (Google profil): pon–pet 5–22, sub 2–22, ned otvoreno – točno vrijeme nije poznato */
  var H = { 1: [5, 22], 2: [5, 22], 3: [5, 22], 4: [5, 22], 5: [5, 22], 6: [2, 22] };
  var now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
  $$("[data-hours] tr").forEach(function (tr) { if (+tr.dataset.day === d) tr.classList.add("today"); });
  $$("[data-open]").forEach(function (el) {
    var txt = $(".txt", el), t = H[d];
    if (!t) { txt.textContent = "Nedjeljom otvoreno · nazovite za točno vrijeme"; return; }
    if (h >= t[0] && h < t[1]) txt.textContent = "Sada otvoreno · zatvaramo u " + t[1] + ":00";
    else {
      el.classList.add("closed");
      var nd = (d + (h >= t[1] ? 1 : 0)) % 7, n = H[nd];
      txt.textContent = "Sada zatvoreno · " + (n ? (nd === d ? "otvaramo u " : "sutra otvaramo u ") + n[0] + ":00" : "sutra (nedjelja) nazovite za vrijeme");
    }
  });
  var hh = $(".clock .hh"), mm = $(".clock .mm");
  if (hh && mm) setTimeout(function () {
    hh.style.transform = "rotate(" + ((now.getHours() % 12) * 30 + now.getMinutes() / 2) + "deg)";
    mm.style.transform = "rotate(" + now.getMinutes() * 6 + "deg)";
  }, 400);

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1300, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    el.textContent = "0";
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = to; }, dur + 400);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
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

  /* magnetni gumb (samo miš) */
  if (fine && !reduce) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* harmonika: samo jedno pitanje otvoreno */
  $$(".faq details").forEach(function (det) {
    det.addEventListener("toggle", function () {
      if (det.open) $$(".faq details").forEach(function (o) { if (o !== det) o.open = false; });
    });
  });

  /* obrazac: bez javnog e-maila slaže popis, kopira ga i nudi poziv; s data-mail otvara e-poštu */
  $$("form.lead-form").forEach(function (fm) {
    var dt = $("input[type=date]", fm);
    if (dt) { try { dt.min = new Date().toISOString().slice(0, 10); } catch (e) {} }
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime"], ["tel", "Telefon"], ["datum", "Datum preuzimanja"], ["sat", "Vrijeme"], ["popis", "Narudžba"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      var text = "Narudžba – Pekara Luščić\n" + body.join("\n");
      if (fm.dataset.mail) {
        location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Narudžba – " + f.get("ime")) + "&body=" + encodeURIComponent(text);
        return;
      }
      var ok = $(".ok", fm);
      if (ok) { $("pre", ok).textContent = text; ok.style.display = "block"; }
      try { navigator.clipboard.writeText(text); } catch (err) {}
      if (window.matchMedia("(max-width: 860px)").matches && fm.dataset.tel) setTimeout(function () { location.href = "tel:" + fm.dataset.tel; }, 900);
    });
  });
})();
