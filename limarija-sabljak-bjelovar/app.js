/* Limarija Sabljak d.o.o. – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* duljina SVG linija za crtanje */
  $$('[data-anim="draw"] path').forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {} });

  /* otkrivanje pri skrolanju */
  var show = function (el) { el.classList.add("in"); if (el.hasAttribute("data-count")) count(el); };
  var heroLines = $$(".hero h1 [data-anim]");
  heroLines.forEach(function (el) { setTimeout(function () { el.classList.add("in"); }, 150); });
  var targets = $$("[data-anim]").filter(function (el) { return heroLines.indexOf(el) < 0; }).concat($$("[data-count]").filter(function (el) { return !el.hasAttribute("data-anim"); }));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  } else targets.forEach(function (el) { el.classList.add("in"); });

  /* brojači */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var end = parseFloat(el.getAttribute("data-count")), start = parseFloat(el.getAttribute("data-from") || 0);
    if (reduce) { el.textContent = end; return; }
    var t0 = null, dur = 1600;
    var step = function (t) {
      if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(start + (end - start) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* paralaksa */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var upd = function () {
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var f = parseFloat(el.getAttribute("data-parallax")) || 0.15;
        var y = Math.max(-90, Math.min(90, (r.top + r.height / 2 - vh / 2) * -f));
        el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* magnetni gumbi i nagib kartica (samo miš) */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)"; c.style.boxShadow = "0 24px 40px rgba(0,0,0,.14)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; c.style.boxShadow = ""; });
    });
  }

  /* otvoreno / zatvoreno: pon–pet 8–16 (Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(g("weekday")) > -1, h = +g("hour") + g("minute") / 60;
      var open = wk && h >= 8 && h < 16;
      el.textContent = open ? "Ured je sada otvoren" : "Ured je sada zatvoren – pošaljite upit e-poštom";
      el.classList.toggle("open", open);
    } catch (e) {}
  });

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["place", "Mjesto objekta"], ["service", "Vrsta radova"], ["message", "Opis"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + (f.get("service") || "radovi") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Limarije Sabljak");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });

  /* galerija: povećanje */
  var items = $$(".gal button");
  if (items.length) {
    var lb = document.createElement("div");
    lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Povećana fotografija");
    lb.innerHTML = '<img alt=""><p></p><button class="x" type="button" aria-label="Zatvori">×</button><button class="pv" type="button" aria-label="Prethodna">‹</button><button class="nx" type="button" aria-label="Sljedeća">›</button>';
    document.body.appendChild(lb);
    var cur = 0, last = null, vis = function () { return items.filter(function (b) { return b.offsetParent !== null; }); };
    var open = function (i) { var list = vis(); cur = (i + list.length) % list.length; var im = $("img", list[cur]); $("img", lb).src = im.currentSrc || im.src; $("img", lb).alt = im.alt; $("p", lb).textContent = im.alt; lb.classList.add("open"); $(".x", lb).focus(); };
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    items.forEach(function (b) { b.addEventListener("click", function () { last = b; open(vis().indexOf(b)); }); });
    $(".x", lb).addEventListener("click", close);
    $(".pv", lb).addEventListener("click", function () { open(cur - 1); });
    $(".nx", lb).addEventListener("click", function () { open(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (!lb.classList.contains("open")) return; if (e.key === "Escape") close(); if (e.key === "ArrowLeft") open(cur - 1); if (e.key === "ArrowRight") open(cur + 1); });
  }

  /* filtar galerije */
  $$(".filt button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".filt button").forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
      var c = b.getAttribute("data-f");
      $$(".pg").forEach(function (s) { s.hidden = !(c === "sve" || s.getAttribute("data-cat") === c); });
    });
  });
})();
