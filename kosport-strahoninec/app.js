/* Kosport Bike Shop & Servis – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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

  /* zaglavlje se smanjuje, paralaksa, kotač se vrti sa skrolanjem */
  var nav = $(".nav"), par = $$("[data-parallax]"), spin = $$("[data-spin]"), ticking = false, base = 0;
  function setSpin() { spin.forEach(function (el) { el.style.transform = "rotate(" + (window.pageYOffset * 0.45 + base).toFixed(1) + "deg)"; }); }
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
        if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
      });
      setSpin();
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* kotač se lagano vrti i bez skrolanja */
  /* (lagana vrtnja bez skrolanja je CSS animacija .idle) */

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || 0), dur = 1500, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.08) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    /* elementi "up" su izvan svog okvira (overflow:hidden), pa promatramo roditelja */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        if (t.dataset.anim === "up") t.classList.add("in");
        else if (t.__up) t.__up.classList.add("in");
        else t.classList.add("in");
        io.unobserve(t);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) {
      if (el.dataset.anim === "up" && el.parentNode) { el.parentNode.__up = el; io.observe(el.parentNode); }
      else io.observe(el);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* magnetni gumb */
  if (fine && !reduce) $$("[data-magnet]").forEach(function (b) {
    b.addEventListener("mousemove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + "px");
      b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + "px");
    });
    b.addEventListener("mouseleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
  });

  /* nagib kartica */
  if (fine && !reduce) $$("[data-tilt]").forEach(function (c) {
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.setProperty("--ry", (x * 7).toFixed(2) + "deg");
      c.style.setProperty("--rx", (-y * 7).toFixed(2) + "deg");
    });
    c.addEventListener("mouseleave", function () { c.style.setProperty("--ry", "0deg"); c.style.setProperty("--rx", "0deg"); });
  });

  /* otvoreno / zatvoreno: pon–sri 8–16, čet–pet 12–18, sub 8–12 (Europe/Zagreb) */
  var HRS = { 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [12, 18], 5: [12, 18], 6: [8, 12] };
  try {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = +g("hour") + g("minute") / 60;
    var today = HRS[day], open = !!today && h >= today[0] && h < today[1];
    var names = ["nedjelju", "ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu"];
    $$("[data-open]").forEach(function (el) {
      el.classList.add(open ? "open" : "shut");
      if (open) { el.textContent = "Sada otvoreno · do " + today[1] + " h"; return; }
      var nd = day, n = 0;
      if (!(today && h < today[0])) { do { nd = (nd + 1) % 7; n++; } while (!HRS[nd]); }
      el.textContent = "Sada zatvoreno · otvaramo " + (n === 0 ? "danas" : n === 1 ? "sutra" : "u " + names[nd]) + " u " + HRS[nd][0] + " h";
    });
    $$("[data-hours] tr").forEach(function (tr) { if (+tr.dataset.day === day) tr.classList.add("today"); });
  } catch (e) {}

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["type", "Vrsta"], ["model", "Marka i model"], ["budget", "Okvirni budžet"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((fm.dataset.subject || "Upit") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
