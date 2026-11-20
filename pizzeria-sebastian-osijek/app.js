/* Pizzeria Sebastian – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { if (menu) menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o);
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje se smanjuje + paralaksa */
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

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || 0), dur = 1500, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    el.textContent = from;
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
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

  /* hero: izmjena pizza (clip-path brisanje) */
  var box = $("[data-slides]");
  if (box) {
    var sl = $$(".slide", box), bars = $$(".bar i", box), tag = $(".hero-tag", box), cur = 0, timer;
    var show = function (n) {
      sl.forEach(function (s, i) { s.classList.toggle("out", i === cur && i !== n); s.classList.remove("on"); });
      cur = n; sl[n].classList.add("on");
      bars.forEach(function (b, i) { b.classList.remove("on"); if (i === n) { void b.offsetWidth; b.classList.add("on"); } });
      if (tag) {
        $(".num", tag).textContent = ("0" + (n + 1)).slice(-2) + " / " + ("0" + sl.length).slice(-2);
        $(".nm", tag).textContent = sl[n].dataset.name;
        $(".ing", tag).textContent = sl[n].dataset.ing;
      }
      setTimeout(function () { sl.forEach(function (s, i) { if (i !== cur) s.classList.remove("out"); }); }, 1150);
    };
    if (!reduce && sl.length > 1) {
      timer = setInterval(function () { if (!document.hidden) show((cur + 1) % sl.length); }, 6000);
    }
  }

  /* otvoreno / zatvoreno – pon–sub 9–22 (Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = +g("hour") + g("minute") / 60;
      var work = d !== "Sun", open = work && h >= 9 && h < 22;
      el.classList.toggle("open", open);
      el.textContent = open ? "Sada otvoreno · peć radi do 22 h" : (work && h < 9 ? "Zatvoreno · otvaramo danas u 9 h" : (d === "Sat" || d === "Sun" ? "Zatvoreno · otvaramo u ponedjeljak u 9 h" : "Zatvoreno · otvaramo sutra u 9 h"));
    } catch (e) {}
  });

  /* jelovnik: filtri i pretraga */
  var fbar = $(".filters");
  if (fbar) {
    var items = $$(".mi"), q = $("input", fbar), cat = "sve", empty = $(".empty-msg");
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); };
    var apply = function () {
      var term = norm(q ? q.value : ""), any = false;
      items.forEach(function (it) {
        var ok = (cat === "sve" || (" " + it.dataset.cat + " ").indexOf(" " + cat + " ") > -1) && (!term || norm(it.textContent).indexOf(term) > -1);
        it.hidden = !ok; if (ok) { any = true; it.classList.add("in"); }
      });
      if (empty) empty.style.display = any ? "none" : "block";
    };
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        cat = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        apply();
      });
    });
    if (q) q.addEventListener("input", apply);
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["type", "Vrsta upita"], ["date", "Datum"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("type") || "Pizzeria Sebastian") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });

  /* godina u podnožju */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
