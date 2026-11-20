/* FizioCentar Dravinski — app.js (bez vanjskih biblioteka) */
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
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje + paralaksa */
  var nav = $(".nav"), par = $("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset || 0;
    if (nav) nav.classList.toggle("small", y > 30);
    if (par && !reduce) {
      var r = par.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) par.style.transform = "translate3d(0," + (-r.top * 0.1 - 20).toFixed(1) + "px,0)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1200;
    el.textContent = "0";
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
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
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) requestAnimationFrame(function () { reveal(el); });
      else io.observe(el);
    });
  }

  /* reflektor koji prati kursor na staklenim karticama */
  if (fine && !reduce) {
    $$(".glass").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
    /* sjaj u heroju lagano prati kursor */
    $$("[data-spot]").forEach(function (s) {
      var g = $(".glow", s);
      if (!g) return;
      s.addEventListener("pointermove", function (e) {
        var r = s.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        g.style.transform = "translate3d(" + (x * 40).toFixed(1) + "px," + (y * 30).toFixed(1) + "px,0)";
      });
    });
    /* magnetni gumbi */
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* radno vrijeme: pon–pet 8–20, sub 8–14, ned zatvoreno (Europe/Zagreb) */
  var HOURS = { 0: null, 1: [480, 1200], 2: [480, 1200], 3: [480, 1200], 4: [480, 1200], 5: [480, 1200], 6: [480, 840] };
  var DAYS = ["nedjelju", "ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu"];
  function zagrebNow() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), m: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function hhmm(m) { return Math.floor(m / 60) + ":" + ("0" + (m % 60)).slice(-2); }
  var now = zagrebNow();
  var row = $('[data-hours] tr[data-day="' + now.d + '"]');
  if (row) row.classList.add("today");
  var st = $("[data-open]");
  if (st) {
    var h = HOURS[now.d], txt;
    if (h && now.m >= h[0] && now.m < h[1]) { st.classList.add("open"); txt = "Otvoreno · danas do " + hhmm(h[1]); }
    else {
      var d = now.d, k = 0, nx;
      if (h && now.m < h[0]) nx = { d: d, h: h, today: true };
      while (!nx && k < 7) { k++; var dd = (d + k) % 7; if (HOURS[dd]) nx = { d: dd, h: HOURS[dd], tomorrow: k === 1 }; }
      txt = "Zatvoreno · otvaramo " + (nx.today ? "danas" : nx.tomorrow ? "sutra" : "u " + DAYS[nx.d]) + " u " + hhmm(nx.h[0]);
    }
    $(".st", st).textContent = txt;
  }

  /* filtri u cjeniku */
  var fl = $("[data-filters]"), list = $("[data-plist]");
  function setFilter(f) {
    if (!fl) return;
    $$(".chip", fl).forEach(function (c) { var on = c.getAttribute("data-f") === f; c.classList.toggle("on", on); c.setAttribute("aria-pressed", on ? "true" : "false"); });
    $$(".pitem", list).forEach(function (it) { it.hidden = !(f === "all" || it.getAttribute("data-cat") === f); if (!it.hidden) it.classList.add("in"); });
  }
  if (fl && list) {
    fl.addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (b) setFilter(b.getAttribute("data-f")); });
    var hash = (location.hash || "").slice(1);
    var map = { prenatal: "pre", postnatal: "post", manualni: "man" };
    if (map[hash]) setFilter(map[hash]);
    else if (hash) { var t = document.getElementById(hash); if (t) { var dt = $("details", t); if (dt) dt.open = true; } }
  }

  /* obrazac upita → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime i prezime"], ["telefon", "Telefon"], ["usluga", "Usluga"], ["faza", "Tjedan trudnoće / od poroda"], ["poruka", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Upit: " + (f.get("usluga") || "termin") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
