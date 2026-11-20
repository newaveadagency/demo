/* Krojački salon Elegans — app.js (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); });
    });
  }

  /* zaglavlje se smanjuje + paralaksa hero fotografije */
  var nav = $(".nav"), par = $("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset || 0;
    if (nav) nav.classList.toggle("small", y > 30);
    if (par && !reduce) {
      var r = par.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) par.style.transform = "scale(1.08) translate3d(0," + (-r.top * 0.06).toFixed(1) + "px,0)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduce) { el.textContent = to; return; }
    var from = to > 1000 ? to - 40 : 0, t0 = null, dur = 1400;
    el.textContent = from;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (fade-up, maska riječi, clip-path, šav) */
  function reveal(el) {
    el.classList.add("in");
    $$("[data-count]", el).forEach(count);
  }
  var targets = $$("[data-anim], [data-path]");
  if (!("IntersectionObserver" in window) || reduce) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        reveal(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) requestAnimationFrame(function () { reveal(el); });
      else io.observe(el);
    });
  }

  /* nagib kartica (samo miš) */
  if (fine && !reduce) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* radno vrijeme (Europe/Zagreb): pon, sri, pet 7–15, uto, čet 13–20, sub 9–13 */
  var HOURS = { 0: null, 1: [420, 900], 2: [780, 1200], 3: [420, 900], 4: [780, 1200], 5: [420, 900], 6: [540, 780] };
  var DAYS = ["nedjelju", "ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu"];
  function zagrebNow() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), m: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function hhmm(m) { var h = Math.floor(m / 60), mm = m % 60; return h + (mm ? ":" + ("0" + mm).slice(-2) : "") + " h"; }
  var now = zagrebNow();
  var row = $('[data-hours] tr[data-day="' + now.d + '"]');
  if (row) row.classList.add("today");
  var st = $("[data-open]");
  if (st) {
    var h = HOURS[now.d], txt;
    if (h && now.m >= h[0] && now.m < h[1]) { st.classList.add("open"); txt = "Otvoreno · danas do " + hhmm(h[1]); }
    else {
      var d = now.d, k = 0, nx = null;
      if (h && now.m < h[0]) nx = { d: d, h: h, today: true };
      while (!nx && k < 7) { k++; var dd = (d + k) % 7; if (HOURS[dd]) nx = { d: dd, h: HOURS[dd], tomorrow: k === 1 }; }
      txt = "Zatvoreno · otvaramo " + (nx.today ? "danas" : nx.tomorrow ? "sutra" : "u " + DAYS[nx.d]) + " u " + hhmm(nx.h[0]);
    }
    $(".st", st).textContent = txt;
  }

  /* obrazac upita → pripremljeni e-mail (ili sažetak + poziv ako e-mail nije upisan) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime i prezime"], ["telefon", "Telefon"], ["usluga", "Usluga"], ["datum", "Rok"], ["poruka", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Upit: " + (f.get("usluga") || "") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Otvara se vaš program za e-poštu s pripremljenim upitom. Za brži dogovor nazovite " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Hvala, " + f.get("ime") + ". Salon zasad nema objavljenu e-mail adresu, pa nazovite " + tel + " i navedite:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
