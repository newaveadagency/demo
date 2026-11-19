/* Studio Vitalis – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
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

  /* zaglavlje se smanjuje + paralaksa hero fotografije */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.getAttribute("data-parallax")) || 0.06;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.18)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseInt(el.getAttribute("data-count"), 10), from = to > 100 ? to - 30 : 0, dur = 1400, t0 = null;
    if (reduce || isNaN(to)) return;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    el.textContent = from;
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { var d = el.getAttribute("data-d"); if (d) el.style.transitionDelay = (d * 0.09) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]"), tlines = $$("[data-tline]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.concat(tlines).forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        t.classList.add("in");
        if (t.hasAttribute("data-count")) count(t);
        io.unobserve(t);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.concat(counters, tlines).forEach(function (el) { io.observe(el); });
  }

  /* status: radimo li sada (Europe/Zagreb) */
  var st = $("[data-open]");
  if (st) {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var g = {}; parts.forEach(function (p) { g[p.type] = p.value; });
      var m = parseInt(g.hour, 10) * 60 + parseInt(g.minute, 10), wd = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(g.weekday) > -1;
      var open = wd && ((m >= 540 && m < 720) || (m >= 840 && m < 1200));
      st.textContent = open ? "Sada radimo · do " + (m < 720 ? "12:00" : "20:00") : "Pon–pet 9–12 i 14–20 · sada zatvoreno";
      if (!open) st.classList.add("off");
    } catch (e) { /* ostaje statični tekst */ }
  }

  /* podizbornik usluga: označi trenutni odjeljak */
  var sub = $$(".subnav a");
  if (sub.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        sub.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + e.target.id;
          a.classList.toggle("cur", on);
          if (on && a.scrollIntoView && a.parentNode.scrollWidth > a.parentNode.clientWidth) a.parentNode.scrollLeft = a.offsetLeft - 20;
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$(".svc[id]").forEach(function (s) { so.observe(s); });
  }

  /* filtar cjenika */
  var fb = $$(".filt button");
  fb.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      fb.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".prow[data-cat]").forEach(function (r) { r.classList.toggle("hide", f !== "all" && r.getAttribute("data-cat") !== f); });
    });
  });

  /* FAQ: samo jedno otvoreno pitanje */
  var dets = $$(".faq details");
  dets.forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) dets.forEach(function (o) { if (o !== d) o.open = false; }); }); });

  /* obrazac -> pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["service", "Usluga"], ["time", "Termin"], ["message", "Opis"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Upit za termin – " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano sa stranice studiovitalis.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
