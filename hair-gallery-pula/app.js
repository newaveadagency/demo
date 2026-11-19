/* Hair Gallery Pula – skripta stranice (demo) */
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

  /* zaglavlje se smanjuje + paralaksa (rAF, passive) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
      if (r.bottom > -200 && r.top < innerHeight + 200) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseInt(el.dataset.count, 10), dur = to > 100 ? 1800 : 1200, from = to > 100 ? to - 60 : 0, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* SVG crtanje: duljina putanje */
  $$("[data-draw] path").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {} });

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]"), draws = $$("[data-draw]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    draws.forEach(function (el) { el.classList.add("drawn"); });
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) {
      /* maska: element je odrezan roditeljem (overflow:hidden), pa promatramo roditelja */
      if (el.dataset.anim === "mask") {
        var mo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { el.classList.add("in"); mo.disconnect(); } });
        mo.observe(el.parentNode);
      } else io.observe(el);
    });
    var dr = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("drawn"); dr.unobserve(e.target); } });
    }, { threshold: 0.2 });
    draws.forEach(function (el) { dr.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* magnetni gumbi */
  if (fine && !reduce) $$("[data-magnet]").forEach(function (b) {
    b.addEventListener("mousemove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
      b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px");
    });
    b.addEventListener("mouseleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
  });

  /* otvoreno / zatvoreno (Europe/Zagreb): uto, čet, pet 8–15, sri 8–20, sub 8–14 */
  var H = { 2: [8, 15], 3: [8, 20], 4: [8, 15], 5: [8, 15], 6: [8, 14] };
  var NAMES = ["nedjelju", "ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu"];
  try {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var today = H[day], open = !!today && h >= today[0] && h < today[1], msg;
    if (open) msg = "Sada otvoreno · do " + today[1] + " h";
    else {
      var d = day, n = 0;
      if (today && h < today[0]) msg = "Sada zatvoreno · otvaramo danas u " + today[0] + " h";
      else { do { d = (d + 1) % 7; n++; } while (!H[d] && n < 8); msg = "Sada zatvoreno · otvaramo " + (n === 1 ? "sutra" : "u " + NAMES[d]) + " u " + H[d][0] + " h"; }
    }
    $$("[data-open]").forEach(function (el) { el.classList.toggle("open", open); el.textContent = msg; });
    $$("[data-hours] tr").forEach(function (tr) { if (+tr.dataset.day === day) tr.classList.add("today"); });
  } catch (e) {}

  /* galerija: filtar + lightbox */
  var fbar = $(".filters"), figs = $$(".gal figure");
  if (fbar) $$("button", fbar).forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.dataset.f;
      $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      figs.forEach(function (fg) { fg.hidden = !(f === "sve" || fg.dataset.cat === f); });
    });
  });
  var lb = $(".lb");
  if (lb && figs.length) {
    var li = $("img", lb), cap = $("p", lb), cur = 0, last = null;
    var vis = function () { return figs.filter(function (f) { return !f.hidden; }); };
    var show = function (i) {
      var v = vis(); cur = (i + v.length) % v.length;
      var im = $("img", v[cur]); li.src = $("button", v[cur]).dataset.full; li.alt = im.alt; cap.textContent = im.alt + " · " + (cur + 1) + "/" + v.length;
    };
    figs.forEach(function (fg) {
      $("button", fg).addEventListener("click", function () { last = this; show(vis().indexOf(fg)); lb.classList.add("open"); $(".x", lb).focus(); });
    });
    var hide = function () { lb.classList.remove("open"); if (last) last.focus(); };
    $(".x", lb).addEventListener("click", hide);
    $(".pv", lb).addEventListener("click", function () { show(cur - 1); });
    $(".nx", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) hide(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") hide(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["service", "Usluga"], ["date", "Željeni dan"], ["message", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za termin – " + (f.get("service") || "Hair Gallery") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s hairgallery.com.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
