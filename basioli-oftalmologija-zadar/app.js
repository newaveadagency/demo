/* Ordinacija dr. Nikolina Basioli – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("sm", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* otkrivanje: mreža i hero odmah, ostalo pri skrolanju */
  var show = function (el) { el.classList.add("in"); };
  $$(".cols [data-anim]").forEach(function (el, i) { setTimeout(function () { show(el); }, 60 * i); });
  $$(".hero [data-anim], .phead [data-anim]").forEach(function (el, i) { setTimeout(function () { show(el); }, 180 + 130 * i); });
  var rest = $$("[data-anim]").filter(function (el) { return !el.closest(".cols, .hero, .phead"); });
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sib = e.target.parentNode ? $$(":scope > [data-anim]", e.target.parentNode) : [];
        var d = Math.max(0, sib.indexOf(e.target)) % 6;
        setTimeout(function () { show(e.target); }, d * 90);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    rest.forEach(function (el) { io.observe(el); });
  } else rest.forEach(show);

  /* brojači */
  var counters = $$("[data-count]");
  var runCount = function (el) {
    var to = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    var step = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } }); }, { threshold: .6 });
    counters.forEach(function (el) { el.textContent = "0"; co.observe(el); });
  }

  /* paralaksa slika */
  var px = $$(".px img");
  if (px.length && !reduce) {
    px.forEach(function (img) { img.style.height = "116%"; img.style.marginTop = "-8%"; });
    var ticking = false;
    var par = function () {
      var vh = window.innerHeight;
      px.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var k = ((r.top + r.height / 2) - vh / 2) / vh;
        img.style.transform = "translateY(" + (k * -7).toFixed(2) + "%)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(par); } }, { passive: true });
    par();
  }

  /* magnetni gumbi */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".btn-or, .btn-ink").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .14).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .22).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* radno vrijeme: pon, sri 12–19; uto, čet, pet 8–15 (Europe/Zagreb) */
  var H = { 1: [12, 19], 2: [8, 15], 3: [12, 19], 4: [8, 15], 5: [8, 15] };
  var DAY = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];
  try {
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = +g("hour") + g("minute") / 60;
    $$("[data-open]").forEach(function (el) {
      var o = H[wd], txt;
      if (o && h >= o[0] && h < o[1]) { txt = "Otvoreno do " + o[1] + ":00"; el.classList.add("open"); }
      else if (o && h < o[0]) txt = "Otvaramo danas u " + (o[0] < 10 ? "0" : "") + o[0] + ":00";
      else { var n = wd, i = 0; do { n = (n + 1) % 7; i++; } while (!H[n] && i < 8); txt = "Zatvoreno · otvaramo " + (i === 1 ? "sutra" : "u " + DAY[n].replace("srijeda", "srijedu").replace("nedjelja", "nedjelju").replace("subota", "subotu")) + " u " + (H[n][0] < 10 ? "0" : "") + H[n][0] + ":00"; }
      el.textContent = txt;
    });
    $$("[data-hours] [data-d]").forEach(function (r) { if (+r.getAttribute("data-d") === wd) r.classList.add("today"); });
  } catch (e) {}

  /* galerija – povećanje */
  var lb = $(".lb");
  if (lb) {
    var lbImg = $("img", lb), last = null;
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    $$("[data-full]").forEach(function (b) {
      b.addEventListener("click", function () { last = b; var im = $("img", b); lbImg.src = b.getAttribute("data-full"); lbImg.alt = im ? im.alt : ""; lb.classList.add("open"); $("button", lb).focus(); });
    });
    $("button", lb).addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) close(); });
  }

  /* harmonika – samo jedno otvoreno pitanje */
  $$(".faq details").forEach(function (d, _, all) {
    d.addEventListener("toggle", function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* cjenik: pretraga i kategorije */
  var q = $("#trazi"), chips = $$(".chips button"), groups = $$(".pgroup"), empty = $(".empty");
  if (q && groups.length) {
    var cat = "sve";
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); };
    var filter = function () {
      var term = norm(q.value.trim()), any = false;
      groups.forEach(function (g) {
        var inCat = cat === "sve" || g.getAttribute("data-cat") === cat, vis = 0;
        $$(".row", g).forEach(function (r) { var ok = inCat && (!term || norm(r.textContent).indexOf(term) > -1); r.hidden = !ok; if (ok) vis++; });
        g.hidden = !vis; if (vis) any = true;
      });
      if (empty) empty.style.display = any ? "none" : "block";
    };
    q.addEventListener("input", filter);
    chips.forEach(function (c) { c.addEventListener("click", function () { chips.forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); }); c.classList.add("on"); c.setAttribute("aria-pressed", "true"); cat = c.getAttribute("data-c"); filter(); }); });
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["service", "Razlog dolaska"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Upit za termin – " + (f.get("service") || "pregled") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice basioli.eu");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
