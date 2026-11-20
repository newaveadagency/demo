/* Fishing Losinj – skripta stranice (prijedlog) */
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

  /* zaglavlje se smanjuje + paralaksa */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.05;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači (decimalni zarez) */
  function fmt(v, dec) { return v.toFixed(dec).replace(".", ","); }
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), dur = 1500, t0 = null;
    if (reduce) { el.textContent = fmt(to, dec); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e, dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to, dec);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = fmt(to, dec); }, dur + 400);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.11) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = fmt(+el.dataset.count, +(el.dataset.dec || 0)); });
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

  /* magnetni gumb i nagib kartica (samo miš) */
  if (fine && !reduce) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        if (!c.classList.contains("in") && c.hasAttribute("data-anim")) return;
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transition = "transform .15s";
        c.style.transform = "perspective(900px) rotateY(" + (x * 5).toFixed(2) + "deg) rotateX(" + (-y * 5).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transition = ""; c.style.transform = ""; });
    });
  }

  /* harmonika: samo jedno pitanje otvoreno */
  $$(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) $$(".faq details").forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* obrazac → pripremljeni SMS (nema javnog e-maila); s data-mail otvara e-poštu */
  $$("form.lead-form").forEach(function (fm) {
    var dt = $("input[type=date]", fm);
    if (dt) { try { dt.min = new Date().toISOString().slice(0, 10); } catch (e) {} }
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["tura", "Tura"], ["datum", "Datum"], ["osobe", "Broj osoba"], ["ime", "Ime"], ["tel", "Telefon"], ["mjesto", "Preuzimanje"], ["napomena", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      var text = "Upit za ribolovnu turu (web)\n" + body.join("\n");
      if (fm.dataset.mail) location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za turu – " + f.get("ime")) + "&body=" + encodeURIComponent(text);
      else location.href = "sms:" + fm.dataset.sms + "?&body=" + encodeURIComponent(text);
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
