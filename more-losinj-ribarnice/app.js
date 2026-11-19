/* More-Lošinj – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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

  /* zaglavlje se smanjuje, paralaksa, crtanje vremenske crte */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  var tl = $(".tl"), tlPath = tl ? $("svg.line path", tl) : null;
  function sizeLine() {
    if (!tlPath) return;
    var svg = tlPath.parentNode, h = tl.offsetHeight;
    svg.setAttribute("viewBox", "0 0 6 " + h);
    tlPath.setAttribute("d", "M3 0V" + h);
    tl.style.setProperty("--len", h);
  }
  function onScroll() {
    var y = window.pageYOffset, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
      if (r.bottom > 0 && r.top < vh) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    if (tlPath) {
      var r = tl.getBoundingClientRect(), h = tl.offsetHeight;
      var p = Math.min(Math.max((vh * 0.75 - r.top) / h, 0), 1);
      tl.style.setProperty("--off", (h * (1 - p)).toFixed(0));
    }
    ticking = false;
  }
  sizeLine();
  window.addEventListener("resize", function () { sizeLine(); onScroll(); });
  window.addEventListener("load", function () { sizeLine(); onScroll(); });
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from) || 0, suf = el.dataset.suffix || "", dur = 1500, t0 = null;
    if (reduce) { el.textContent = to + suf; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ""); });
  } else {
    /* redak naslova je unutar maske (overflow:hidden) – promatra se roditelj */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target._line || e.target).classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) {
      var t = el;
      if (el.dataset.anim === "line") { t = el.parentNode; t._line = el; }
      io.observe(t);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* nagib kartica i magnetni gumbi (samo miš) */
  if (fine && !reduce) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* cjenik: filtri */
  var tabs = $(".ptabs");
  if (tabs) {
    $$("button", tabs).forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.dataset.f;
        $$("button", tabs).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        $$(".pcard").forEach(function (c) {
          if (c.dataset.cat === "uzgoj") { c.hidden = !(f === "sve" || f === "uzgoj"); return; }
          var any = false;
          $$(".olist .row", c).forEach(function (r) { var ok = f === "sve" || r.dataset.cat === f; r.hidden = !ok; if (ok) any = true; });
          c.hidden = !any;
        });
      });
    });
  }

  /* cjenik: težina ribe → razred */
  $$(".sizer").forEach(function (s) {
    var inp = $("input", s), out = $("output", s), rows = $$("tr", s.parentNode);
    function upd() {
      var g = +inp.value;
      out.textContent = g >= 1000 ? (g / 1000).toFixed(2).replace(".", ",").replace(/0$/, "") + " kg" : g + " g";
      rows.forEach(function (r) { r.classList.toggle("hit", g >= +r.dataset.min && g < +r.dataset.max); });
    }
    inp.addEventListener("input", upd); upd();
  });

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["shop", "Ribarnica"], ["date", "Datum"], ["product", "Što me zanima"], ["qty", "Količina"], ["message", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za ribu – " + (f.get("shop") || "More-Lošinj") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
