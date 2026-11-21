/* Klet Kozjak – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* zaglavlje se smanjuje + paralaksa hero fotografije */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* SVG crtež kozlića: duljina svake linije */
  $$(".goat-draw path").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {} });

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = to > 1000 ? to - 40 : 0, dur = 1400, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = to; }, dur + 400);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
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

  /* rezervacijska kartica: kartice Stol / Smještaj / Proslava */
  $$("form.book").forEach(function (fm) {
    var kind = $('input[name="kind"]', fm), tabs = $$('[role="tab"]', fm), lab = $("[data-label-date]", fm);
    function pick(k) {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t.dataset.kind === k); });
      if (kind) kind.value = k;
      $$("[data-only]", fm).forEach(function (el) { el.hidden = el.dataset.only !== k; });
      if (lab) lab.textContent = k === "Smještaj" ? "Datum dolaska" : (k === "Stol u kleti" ? "Datum" : "Datum događanja");
    }
    tabs.forEach(function (t) { t.addEventListener("click", function () { pick(t.dataset.kind); }); });
    $$("[data-kind-link]").forEach(function (a) { a.addEventListener("click", function () { pick(a.dataset.kindLink); }); });
  });

  /* jelovnik: filtri i pretraga */
  var fbar = $(".filters");
  if (fbar) {
    var groups = $$(".mgroup"), q = $("input", fbar), cat = "sve", empty = $(".empty");
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); };
    var apply = function () {
      var term = norm(q ? q.value : ""), anyAll = false;
      groups.forEach(function (g) {
        var catOk = cat === "sve" || g.dataset.cat === cat, any = false;
        $$(".mitem", g).forEach(function (it) {
          var ok = catOk && (!term || norm(it.textContent).indexOf(term) > -1);
          it.hidden = !ok; if (ok) any = true;
        });
        g.hidden = !any; if (any) anyAll = true;
      });
      if (empty) empty.style.display = anyAll ? "none" : "block";
    };
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        cat = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
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
      [["kind", "Vrsta upita"], ["event", "Prigoda"], ["date", "Datum"], ["out", "Datum odlaska"], ["people", "Broj osoba"], ["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["message", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      var subj = "Upit – " + (f.get("kind") || f.get("event") || "Klet Kozjak") + (f.get("date") ? " – " + f.get("date") : "") + " – " + f.get("name");
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s klet-kozjak.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
