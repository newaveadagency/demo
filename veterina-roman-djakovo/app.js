/* Veterinarska ljekarna i ambulanta Roman – interakcije */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. zaglavlje se smanjuje pri skrolanju + izbornik */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", scrollY > 30); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o);
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* 2. otkrivanje pri skrolanju (fade-up, redovi naslova, clip-path, pečat, SVG crtanje) */
  var els = $$("[data-anim]");
  var reveal = function (el) { el.classList.add("in"); };
  if (reduce || !("IntersectionObserver" in window)) { els.forEach(reveal); }
  else {
    /* redovi naslova su izvan maske (overflow:hidden), pa se prati njihov roditelj */
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target._animKids || [e.target]).forEach(reveal); io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) {
      /* maskirani elementi (redovi naslova, clip-path) prate roditelja */
      if (el.dataset.anim === "line" || el.dataset.anim === "wipe") {
        var p = el.parentNode;
        if (!p._animKids) { p._animKids = []; io.observe(p); }
        p._animKids.push(el);
      } else io.observe(el);
    });
  }

  /* 3. brojači */
  var count = function (el) {
    var to = +el.dataset.count, from = +(el.dataset.from || 0), t0 = null, dur = 1400;
    if (reduce) { el.textContent = to; return; }
    var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } }); }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  /* 4. paralaksa fotografija + pečat se okreće sa skrolanjem */
  var par = $$("[data-parallax]"), spin = $$("[data-spin]");
  if (!reduce && (par.length || spin.length)) {
    var ticking = false;
    var upd = function () {
      ticking = false;
      par.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect(), k = +img.dataset.parallax;
        if (r.bottom < 0 || r.top > innerHeight) return;
        img.style.transform = "translateY(" + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px) scale(1.08)";
      });
      spin.forEach(function (s) { s.style.transform = "rotate(" + (scrollY * 0.12).toFixed(1) + "deg)"; });
    };
    addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* 5. magnetni gumb i nagib kartica */
  if (!reduce && matchMedia("(hover:hover)").matches) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(800px) rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* 6. radno vrijeme uživo (Europe/Zagreb) */
  var H = { 1: [7, 14], 2: [13, 19], 3: [7, 14], 4: [13, 19], 5: [7, 14], 6: [7, 12], 0: null };
  var DAYS = ["u nedjelju", "u ponedjeljak", "u utorak", "u srijedu", "u četvrtak", "u petak", "u subotu"];
  var now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Zagreb" }));
  var d = now.getDay(), h = now.getHours() + now.getMinutes() / 60, hh = H[d];
  var open = !!(hh && h >= hh[0] && h < hh[1]);
  var label = open ? "Sada otvoreno · do " + hh[1] + " h" : "Sada zatvoreno";
  if (!open) {
    for (var i = 0; i < 8; i++) {
      var dd = (d + i) % 7, x = H[dd];
      if (x && (i > 0 || h < x[0])) { label += " · otvaramo " + (i === 0 ? "danas" : i === 1 ? "sutra" : DAYS[dd]) + " u " + x[0] + " h"; break; }
    }
  }
  $$("[data-open]").forEach(function (el) { el.classList.toggle("is-open", open); el.textContent = label; });
  $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.dataset.day === d); });

  /* 7. traka sezone kolinja (15.11. – 23.12.) */
  var fill = $("[data-season-fill]"), dot = $("[data-season-dot]"), sn = $("[data-season]");
  if (fill && sn) {
    var y = now.getFullYear(), a = new Date(y, 10, 15), b = new Date(y, 11, 23, 23, 59), day = 864e5;
    var p = 0, txt;
    if (now < a) { txt = "Sezona počinje 15. studenoga – još " + Math.ceil((a - now) / day) + " dana."; }
    else if (now > b) { p = 1; txt = "Ovogodišnja sezona je završila. Sljedeća počinje 15. studenoga."; }
    else {
      p = (now - a) / (b - a);
      var left = Math.ceil((b - now) / day);
      txt = "Sezona traje – do kraja je još " + left + (left % 10 === 1 && left % 100 !== 11 ? " dan." : " dana.");
      if (dot) dot.classList.add("on");
    }
    sn.textContent = txt;
    var go = function () { fill.style.width = (p * 100).toFixed(1) + "%"; if (dot) dot.style.left = (p * 100).toFixed(1) + "%"; };
    if (reduce || !("IntersectionObserver" in window)) go();
    else { var sio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { go(); sio.disconnect(); } }, { threshold: 0.4 }); sio.observe(fill.parentNode); }
  }

  /* 8. galerija s povećanjem */
  var lb = $(".lb"), pics = $$("[data-lb] img"), cur = 0;
  if (lb && pics.length) {
    var show = function (n) {
      cur = (n + pics.length) % pics.length; var im = pics[cur];
      $("img", lb).src = im.src; $("img", lb).alt = im.alt;
      var cap = im.closest("figure").querySelector("figcaption"); $("p", lb).textContent = cap ? cap.textContent : "";
    };
    pics.forEach(function (im, n) { im.parentNode.addEventListener("click", function () { show(n); lb.classList.add("on"); $(".x", lb).focus(); }); });
    $(".x", lb).addEventListener("click", function () { lb.classList.remove("on"); });
    $(".pv", lb).addEventListener("click", function () { show(cur - 1); });
    $(".nx", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("on"); });
    addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") lb.classList.remove("on");
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* 9. obrazac slaže SMS poruku (tvrtka nema javnu e-adresu) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime"], ["phone", "Tel"], ["animal", "Životinja"], ["reason", "Razlog"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var sep = /iPhone|iPad|Mac/.test(navigator.userAgent) ? "&" : "?";
      location.href = "sms:" + fm.dataset.sms + sep + "body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
