/* OPG Vrljić – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje se smanjuje + paralaksa slika */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function fmt(n, sep) { return sep ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : String(n); }
  function count(el) {
    var to = parseFloat(el.dataset.count), sep = el.dataset.sep, from = to > 1900 && to < 2100 ? 1990 : 0, dur = 1500, t0 = null;
    if (reduce) { el.textContent = fmt(to, sep); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e), sep);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to, sep);
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  $$('[data-anim="line"]').forEach(function (el) { var s = el.firstElementChild; if (s && el.dataset.d) s.style.transitionDelay = (el.dataset.d * 0.12) + "s"; });
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

  /* staklenka: boja meda prema sorti */
  var jarFill = $(".jarbox .fill"), jarName = $("[data-jarname]");
  $$(".hcard[data-honey]").forEach(function (c) {
    function on() {
      if (jarFill) jarFill.setAttribute("fill", c.dataset.honey);
      if (jarName) jarName.textContent = c.dataset.name;
      $$(".hcard.act").forEach(function (x) { x.classList.remove("act"); });
      c.classList.add("act");
    }
    c.addEventListener("mouseenter", on); c.addEventListener("focus", on); c.addEventListener("click", on);
  });

  /* nagib kartica */
  if (fine && !reduce) $$("[data-tilt]").forEach(function (c) {
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = "perspective(800px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)";
    });
    c.addEventListener("mouseleave", function () { c.style.transform = ""; });
  });

  /* proizvodi: filtri i pretraga */
  var fbar = $(".filters");
  if (fbar) {
    var groups = $$(".pgroup"), q = $("input", fbar), cat = "sve", empty = $(".empty");
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); };
    var apply = function () {
      var term = norm(q ? q.value : "");
      groups.forEach(function (g) {
        var catOk = cat === "sve" || g.dataset.cat === cat, any = false;
        $$(".pitem", g).forEach(function (it) {
          var ok = catOk && (!term || norm(it.textContent).indexOf(term) > -1);
          it.hidden = !ok; if (ok) { any = true; it.classList.add("in"); }
        });
        g.hidden = !any;
      });
      if (empty) empty.style.display = groups.some(function (g) { return !g.hidden; }) ? "none" : "block";
    };
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        cat = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        apply();
      });
    });
    if (q) q.addEventListener("input", apply);
    if (location.hash) { var hb = $('button[data-f="' + location.hash.slice(1) + '"]', fbar); if (hb) hb.click(); }
  }

  /* dodaj u narudžbu: upiši u obrazac */
  var area = $("#f-nar"), cart = $("[data-cart]"), cartN = $("[data-cart-n]"), picked = {};
  function render() {
    var keys = Object.keys(picked), n = 0;
    keys.forEach(function (k) { n += picked[k]; });
    if (area) area.value = keys.map(function (k) { return picked[k] + " × " + k; }).join("\n");
    if (cart) { cart.hidden = n === 0; if (cartN) cartN.textContent = n; }
  }
  $$("[data-add]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!cart) { location.href = "proizvodi.html#narudzba"; return; }
      var k = b.dataset.add; picked[k] = (picked[k] || 0) + 1; render();
      b.classList.add("done"); b.textContent = "Dodano (" + picked[k] + ")";
    });
  });

  /* obrasci: pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["address", "Adresa za dostavu"], ["product", "Narudžba"], ["payment", "Način plaćanja"], ["message", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + (k[0] === "product" ? "\n" : "") + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Narudžba – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s opg-vrljic.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
