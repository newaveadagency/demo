/* OPG Jaić Krasnik – skripta stranice (prijedlog) */
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
      burger.setAttribute("aria-expanded", o);
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* SVG crtanje: duljina loze */
  $$(".draw").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 2); } catch (e) {}
  });

  /* kupina koja dozrijeva: zelena → crvena → kupinasto crna */
  var berry = $("[data-ripe]"), drs = berry ? $$("[data-t]", berry) : [];
  var STAGES = ["#8aa05f", "#b9b25a", "#c0503f", "#8e2a45", "#3a1838"];
  function ripen(p) {
    drs.forEach(function (g) {
      var t = parseFloat(g.getAttribute("data-t")), k = Math.max(0, Math.min(1, (p - t * 0.6) / 0.4));
      var c = g.firstElementChild, idx = Math.min(STAGES.length - 1, Math.floor(k * (STAGES.length - 1) + 0.0001));
      if (c && c.getAttribute("fill") !== STAGES[idx]) c.setAttribute("fill", STAGES[idx]);
    });
  }

  /* skrol: zaglavlje, paralaksa, dozrijevanje */
  var nav = $(".nav"), par = $$("[data-par]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset, h = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) {
      par.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > h) return;
        var off = (r.top + r.height / 2 - h / 2) * parseFloat(im.dataset.par) * -1;
        im.style.transform = "translate3d(0," + (off - r.height * 0.08).toFixed(1) + "px,0)";
      });
      if (berry) {
        var b = berry.getBoundingClientRect();
        ripen(Math.max(0, Math.min(1, (h - b.top) / (h * 0.55 + b.height * 0.6))));
      }
    }
    ticking = false;
  }
  if (berry && !reduce) ripen(0);
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* brojači (godine kreću od bliže vrijednosti) */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = to > 1900 && to < 2100 ? to - 50 : 0, dur = 1600, t0 = null;
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
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  targets.forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.12) + "s"; });
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) {
      if (el.dataset.anim === "ln" && el.parentNode) {
        var lo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { el.classList.add("in"); lo.disconnect(); } }); });
        lo.observe(el.parentNode);
      } else io.observe(el);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* mikrointerakcije: magnetni gumb i nagib kartica */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".btn.acc").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* obrazac → pripremljeni e-mail */
  var FIELDS = [["name", "Ime i prezime"], ["phone", "Telefon"], ["what", "Zanima me"], ["people", "Broj osoba / količina"], ["date", "Željeni datum"], ["message", "Poruka"]];
  $$("form.lead-form").forEach(function (fm) {
    var ok = $(".ok", fm);
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), out = [];
      FIELDS.forEach(function (k) { var v = f.get(k[0]); if (v) out.push(k[1] + ": " + v); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("what") || "OPG Jaić Krasnik") + (f.get("date") ? " – " + f.get("date") : "")) + "&body=" + encodeURIComponent(out.join("\n") + "\n\nPoslano s web stranice OPG-a Jaić Krasnik");
      if (ok) ok.style.display = "block";
    });
  });
})();
