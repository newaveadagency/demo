/* Taxi Fićo Dubrovnik – skripta stranice (prijedlog) */
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

  /* sat (Europe/Zagreb) u zaglavlju */
  var clocks = $$("[data-clock]");
  function tick() {
    try {
      var t = new Intl.DateTimeFormat("hr-HR", { timeZone: "Europe/Zagreb", hour: "2-digit", minute: "2-digit" }).format(new Date());
      clocks.forEach(function (c) { c.textContent = t; });
    } catch (e) {}
  }
  if (clocks.length) { tick(); setInterval(tick, 5000); }

  /* zaglavlje se smanjuje + paralaksa fotografije */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.1)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* SVG ruta: duljina linija za crtanje */
  $$(".route .draw").forEach(function (p) {
    try { var L = Math.ceil(p.getTotalLength()) + 2; p.style.setProperty("--len", L); p.style.strokeDasharray = L; } catch (e) {}
  });

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1200, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  targets.forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
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
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* magnetni gumbi */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".btn.acc").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* cjenik: filtri */
  var fbar = $(".filters");
  if (fbar) {
    var groups = $$(".pgroup"), empty = $(".empty");
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        var cat = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        groups.forEach(function (g) { g.hidden = !(cat === "sve" || g.dataset.cat === cat); });
        if (empty) empty.style.display = groups.some(function (g) { return !g.hidden; }) ? "none" : "block";
      });
    });
    if (location.hash) { var hb = $('button[data-f="' + location.hash.slice(1) + '"]', fbar); if (hb) hb.click(); }
  }

  /* obrasci → pripremljeni e-mail ili WhatsApp poruka */
  var FIELDS = [["name", "Ime i prezime"], ["phone", "Telefon"], ["from", "Polazište"], ["to", "Odredište"], ["date", "Datum"], ["time", "Vrijeme"], ["people", "Broj putnika"], ["flight", "Broj leta"], ["message", "Napomena"]];
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
      var f = new FormData(fm);
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Rezervacija vožnje – " + (f.get("from") || "") + " → " + (f.get("to") || "") + " – " + (f.get("date") || "")) + "&body=" + encodeURIComponent(body(fm) + "\n\nPoslano s web stranice Taxi Fićo");
      if (ok) ok.style.display = "block";
    });
    var wa = $("[data-send-wa]", fm);
    if (wa) wa.addEventListener("click", function () {
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      window.open("https://wa.me/" + fm.dataset.wa + "?text=" + encodeURIComponent("Pozdrav, želim rezervirati vožnju.\n" + body(fm)), "_blank", "noopener");
      if (ok) ok.style.display = "block";
    });
  });
})();
