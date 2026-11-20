/* Vina Vivoda – skripta stranice (demo) */
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

  /* zaglavlje, paralaksa, SVG crta vremenske crte */
  var nav = $(".nav"), par = $$("[data-parallax]"), lines = $$(".tl svg.line path"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) {
      par.forEach(function (el) {
        if (window.innerWidth < 981 && el.classList.contains("rack")) { el.style.transform = ""; return; }
        var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.1;
        if (r.bottom > 0 && r.top < vh) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + "px,0)";
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
    var to = parseFloat(el.dataset.count), dur = 1700, t0 = null, from = to > 1000 ? to - 74 : 0;
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
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target._animChild || e.target).classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) {
      if (el.dataset.anim === "up" && el.parentNode) { el.parentNode._animChild = el; io.observe(el.parentNode); }
      else io.observe(el);
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* nagib kartica vina */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".wine").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* FAQ: samo jedno otvoreno pitanje */
  var dets = $$(".faq details");
  dets.forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) dets.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* filtar vina */
  var chips = $$(".chip");
  chips.forEach(function (ch) {
    ch.addEventListener("click", function () {
      chips.forEach(function (o) { o.classList.toggle("on", o === ch); });
      var f = ch.dataset.f;
      $$(".wl-item").forEach(function (it) {
        var show = f === "sve" || it.dataset.type === f;
        it.classList.toggle("hide", !show);
        if (show) $$("[data-anim]", it).forEach(function (a) { a.classList.add("in"); });
      });
    });
  });

  /* "Upit za ovo vino" popuni obrazac */
  var sel = $("#vino");
  $$("[data-wine]").forEach(function (b) {
    b.addEventListener("click", function () { if (sel) sel.value = b.dataset.wine; });
  });

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["product", "Upit za"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("product") || "Vina Vivoda") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
