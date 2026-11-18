/* Kuća peciva – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } });
  }

  /* zaglavlje se smanjuje pri skrolanju + paralaksa */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.08;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

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

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.09) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
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
  /* nakon ulaska makni kašnjenje da hover bude trenutan */
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* otvoreno / zatvoreno – pon–pet 6–17, sub 6–13 (Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = +g("hour") + g("minute") / 60;
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1, sat = d === "Sat";
      var open = (wk && h >= 6 && h < 17) || (sat && h >= 6 && h < 13);
      el.classList.toggle("open", open);
      el.textContent = open ? ("Trgovina je sada otvorena · do " + (sat ? "13" : "17") + " h") : "Trgovina je sada zatvorena · otvaramo u 6 h";
    } catch (e) {}
  });

  /* cjenik: filtri i pretraga */
  var fbar = $(".filters");
  if (fbar) {
    var items = $$(".pitem, .cake-t tbody tr"), groups = $$(".pgroup"), q = $("input", fbar), cat = "sve", empty = $(".empty");
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); };
    function apply() {
      var term = norm(q ? q.value : "");
      groups.forEach(function (g) {
        var catOk = cat === "sve" || g.dataset.cat === cat, any = false;
        $$(".pitem, tbody tr", g).forEach(function (it) {
          var ok = catOk && (!term || norm(it.textContent).indexOf(term) > -1);
          it.hidden = !ok; if (ok) any = true;
        });
        g.hidden = !any;
      });
      if (empty) empty.style.display = groups.some(function (g) { return !g.hidden; }) ? "none" : "block";
    }
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        cat = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        apply();
      });
    });
    if (q) q.addEventListener("input", apply);
    if (items.length && location.hash) {
      var hb = $('button[data-f="' + location.hash.slice(1) + '"]', fbar); if (hb) hb.click();
    }
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["occasion", "Prigoda"], ["product", "Što želim naručiti"], ["date", "Datum preuzimanja"], ["people", "Broj osoba"], ["message", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Narudžba / upit – " + (f.get("occasion") || "Kuća peciva") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s kucapeciva.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
