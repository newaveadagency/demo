/* Fizioterapija Vratarić – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav"), menu = $(".menu"), burger = $(".burger");
  var setH = function () { if (nav) document.documentElement.style.setProperty("--navh", nav.offsetHeight + "px"); };
  var onNav = function () { if (nav) { nav.classList.toggle("small", window.scrollY > 30); setH(); } };
  window.addEventListener("scroll", onNav, { passive: true }); window.addEventListener("resize", setH); onNav();
  if (burger && menu) burger.addEventListener("click", function () {
    var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o ? "true" : "false"); setH();
  });
  $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu && menu.classList.contains("open")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.focus(); } });

  /* brojači */
  var count = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10), plain = el.hasAttribute("data-plain");
    if (isNaN(end) || reduce) return;
    var start = plain ? end - 40 : 0, t0 = null, dur = 1500;
    var step = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = String(Math.round(start + (end - start) * e)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = String(end); }, dur + 300);
  };

  /* otkrivanje (fade-up, clip-path, linije naslova) */
  var reveal = function (el) { if (el.classList.contains("in")) return; el.classList.add("in"); $$("[data-count]", el).forEach(count); };
  var first = $$(".hero [data-anim], .phead [data-anim]");
  setTimeout(function () { first.forEach(reveal); }, 80);
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    $$("[data-anim]").forEach(function (el) { if (first.indexOf(el) < 0) io.observe(el); });
  } else $$("[data-anim]").forEach(function (el) { el.classList.add("in"); });

  /* paralaksa hero slike + SVG crta vremenske linije (rAF, passive scroll) */
  var par = $$("[data-parallax]"), tls = $$("[data-tl]");
  if (!reduce && (par.length || tls.length)) {
    tls.forEach(function (t) { var d = $(".draw", t); if (d) { d.style.strokeDasharray = "1"; d.style.strokeDashoffset = "1"; } });
    var ticking = false;
    var frame = function () {
      ticking = false; var vh = window.innerHeight;
      par.forEach(function (el) {
        var b = el.parentNode.getBoundingClientRect(); if (b.bottom < 0 || b.top > vh) return;
        el.style.transform = "translate3d(0," + (-(1 - b.bottom / (vh + b.height)) * 14).toFixed(2) + "%,0)";
      });
      tls.forEach(function (t) {
        var d = $(".draw", t); if (!d) return;
        var r = t.getBoundingClientRect(), p = (vh * 0.8 - r.top) / r.height;
        d.style.strokeDashoffset = String(1 - Math.max(0, Math.min(1, p)));
      });
    };
    var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    window.addEventListener("scroll", req, { passive: true }); window.addEventListener("resize", req); frame();
  }

  /* magnetni gumbi */
  if (!reduce && window.matchMedia("(hover:hover)").matches) $$(".btn").forEach(function (b) {
    b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + "px)"; });
    b.addEventListener("mouseleave", function () { b.style.transform = ""; });
  });

  /* usluge: otvori stavku iz poveznice (#id) */
  var openHash = function () { var h = location.hash && document.getElementById(location.hash.slice(1)); if (h && h.tagName === "DETAILS") { h.open = true; h.classList.add("in"); } };
  window.addEventListener("hashchange", openHash); openHash();

  /* obrazac → pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-pošta"], ["service", "Usluga"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za termin – " + (f.get("service") || "fizikalna terapija") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
