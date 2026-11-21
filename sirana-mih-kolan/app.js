/* MIH Sirana Kolan – skripta stranice (demo) */
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

  /* zaglavlje se smanjuje, paralaksa, crtanje vremenske crte */
  var nav = $(".nav"), par = $$("[data-parallax]"), lines = $$(".tl svg.line path:not(.bg)"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.08;
        if (r.bottom > -200 && r.top < vh + 200) {
          var c = Math.max(-40, Math.min(40, (r.top + r.height / 2 - vh / 2) * k));
          el.style.transform = "translate3d(0," + c.toFixed(1) + "px,0) scale(1.08)";
        }
      });
      lines.forEach(function (p) {
        var box = p.closest(".tl").getBoundingClientRect();
        var prog = Math.min(Math.max((vh * 0.75 - box.top) / box.height, 0), 1);
        p.style.strokeDashoffset = (1 - prog).toFixed(3);
      });
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1700, t0 = null, from = to > 1000 ? to - 120 : 0;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target._animChild || e.target).classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) {
      /* redovi naslova u maski: promatra se roditelj jer je sam red izvan maske */
      if (el.dataset.anim === "up" && el.parentNode) { el.parentNode._animChild = el; io.observe(el.parentNode); }
      else io.observe(el);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* magnetni gumbi (samo miš) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".acts .btn, .more .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* filtar sireva */
  var fbtns = $$(".filters button");
  fbtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.dataset.f;
      fbtns.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      $$(".ch[data-k]").forEach(function (c) {
        var show = f === "all" || c.dataset.k === f;
        c.classList.toggle("hide", !show);
        if (show) c.classList.add("in");
      });
    });
  });

  /* FAQ: samo jedno otvoreno pitanje */
  var dets = $$(".faq details");
  dets.forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) dets.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["product", "Zanima me"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("product") || "MIH sirana") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
