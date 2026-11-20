/* Lens Queen – skripta stranice (prijedlog) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

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

  /* zaglavlje se smanjuje + paralaksa + objektiv se okreće (rAF, passive scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), spin = $$("[data-spin]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
        if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
      });
      spin.forEach(function (el) { el.style.transform = "rotate(" + (y * 0.08).toFixed(1) + "deg)"; });
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* reflektor koji prati kursor + svjetlo po staklenim karticama */
  if (fine && !reduce) {
    var root = document.documentElement, mx = 0, my = 0, pend = false;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (pend) return; pend = true;
      requestAnimationFrame(function () {
        root.style.setProperty("--mx", mx + "px"); root.style.setProperty("--my", my + "px");
        pend = false;
      });
    }, { passive: true });
    $$(".glass").forEach(function (g) {
      g.addEventListener("pointermove", function (e) {
        var r = g.getBoundingClientRect();
        g.style.setProperty("--cx", (e.clientX - r.left) + "px"); g.style.setProperty("--cy", (e.clientY - r.top) + "px");
      });
    });
    /* nagib kartica */
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" + (px * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    /* magnetni gumbi */
    $$(".btn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* bljesak „okidača” na klik gumba */
  $$(".btn").forEach(function (b) {
    b.addEventListener("click", function () {
      if (reduce) return;
      b.classList.add("flash");
      requestAnimationFrame(function () { requestAnimationFrame(function () { b.classList.remove("flash"); }); });
    });
  });

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), dur = 1400, t0 = null;
    var fmt = function (v) { return v.toFixed(dec).replace(".", ","); };
    if (reduce) { el.textContent = fmt(to); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.12) + "s"; });
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
    /* hero se otkriva odmah (redovi su izvan svoje maske pa ih IO ne vidi) */
    var heroEls = $$(".hero [data-anim]");
    requestAnimationFrame(function () { setTimeout(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }, 60); });
    targets.filter(function (el) { return heroEls.indexOf(el) < 0; }).forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains("in") && t.hasAttribute("data-anim")) t.style.transitionDelay = "";
  });

  /* radno vrijeme: svaki dan 9–17 (Europe/Zagreb) */
  try {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = +g("hour") + g("minute") / 60;
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.dataset.day === day); });
    $$("[data-open]").forEach(function (el) {
      var open = h >= 9 && h < 17;
      el.classList.toggle("open", open);
      el.textContent = open ? "Sada dostupna · do 17 h" : (h < 9 ? "Danas od 9 h" : "Sutra od 9 h");
    });
  } catch (e) {}

  /* upit → pripremljena poruka (SMS / kopiranje) */
  $$("form.lead-form").forEach(function (fm) {
    var out = $(".out", fm), pre = $("pre", fm), sms = $(".sms", fm), copy = $(".copy", fm);
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), L = ["Pozdrav Andrea, upit za fotkanje (s web stranice):"];
      [["type", "Vrsta"], ["date", "Željeni datum"], ["place", "Lokacija"], ["message", "Ideja"], ["name", "Ime"], ["phone", "Telefon"]].forEach(function (k) {
        var v = (f.get(k[0]) || "").toString().trim();
        if (v) L.push(k[1] + ": " + v);
      });
      var txt = L.join("\n");
      pre.textContent = txt;
      if (sms) sms.href = "sms:" + fm.dataset.sms + "?&body=" + encodeURIComponent(txt);
      out.classList.add("show");
      if (copy) copy.onclick = function () {
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { copy.textContent = "Kopirano"; });
      };
    });
  });
})();
