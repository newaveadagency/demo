/* Aquavision Aquarius Malinska – skripta stranice (prijedlog) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { if (!menu) return; menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { burger.setAttribute("aria-expanded", menu.classList.toggle("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* vodoravna galerija: na širokom ekranu klizi dok se skrola (sticky) */
  var hgal = $(".hgal"), track = hgal && $(".hgal-track", hgal), bar = hgal && $(".hgal-bar", hgal);
  var hxOn = false, hxDist = 0;
  function setupHx() {
    if (!hgal || !track) return;
    var want = !reduce && window.innerWidth > 1020;
    document.documentElement.classList.toggle("hx", want);
    hxOn = want;
    if (!want) { track.style.transform = ""; hgal.style.removeProperty("--hh"); return; }
    hxDist = Math.max(0, track.scrollWidth - window.innerWidth);
    hgal.style.setProperty("--hh", (window.innerHeight + hxDist) + "px");
  }

  /* zaglavlje, paralaksa, galerija */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.05;
      if (r.bottom > 0 && r.top < vh) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    if (hxOn) {
      var r = hgal.getBoundingClientRect(), total = hgal.offsetHeight - vh;
      var p = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 0;
      track.style.transform = "translate3d(" + (-p * hxDist).toFixed(1) + "px,0,0)";
      if (bar) bar.style.setProperty("--p", p.toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { setupHx(); onScroll(); }, 150); });
  window.addEventListener("load", function () { setupHx(); onScroll(); });
  setupHx(); onScroll();

  /* SVG karta: duljina linija za crtanje */
  $$(".map .draw").forEach(function (p) {
    try { var L = Math.ceil(p.getTotalLength()) + 2; p.style.setProperty("--len", L); } catch (e) {}
  });

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
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (stupnjevanje preko data-d) */
  var targets = $$("[data-anim], [data-map]"), counters = $$("[data-count]");
  targets.forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.12) + "s"; });
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

  /* mikrointerakcije: magnetni gumbi i nagib kartica */
  if (!reduce && fine) {
    $$(".btn.acc").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(1000px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* obrazac → pripremljeni SMS (ili e-mail ako je upisana adresa) */
  var FIELDS = [["name", "Ime"], ["phone", "Telefon"], ["trip", "Izlet"], ["port", "Polazak iz"], ["date", "Datum"], ["people", "Broj osoba"], ["message", "Napomena"]];
  function body(fm) {
    var f = new FormData(fm), out = [];
    FIELDS.forEach(function (k) { var v = f.get(k[0]); if (v) out.push(k[1] + ": " + v); });
    return out.join("\n");
  }
  $$("form.lead-form").forEach(function (fm) {
    var ok = $(".ok", fm);
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var txt = "Pozdrav, upit za izlet katamaranom:\n" + body(fm);
      if (fm.dataset.mail) {
        location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za izlet – " + (new FormData(fm).get("date") || "")) + "&body=" + encodeURIComponent(txt + "\n\nPoslano s web stranice Aquavision Aquarius");
      } else {
        location.href = "sms:" + (fm.dataset.sms || "") + "?&body=" + encodeURIComponent(txt);
      }
      if (ok) ok.style.display = "block";
    });
  });
})();
