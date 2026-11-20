/* HM workshop – interakcije i animacije */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  onScroll();

  /* otkrivanje pri skrolanju */
  var counted = function (el) {
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), t0 = null;
    var fmt = function (v) { return v.toFixed(dec).replace(".", ","); };
    if (reduce) { el.textContent = fmt(end); return; }
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1600, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var targets = $$("[data-anim],[data-draw],[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add("in");
        if (el.hasAttribute("data-count")) counted(el);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) {
      /* redovi naslova (maska .ln) i clip-path slike nemaju vidljivu površinu, pa promatramo roditelja */
      if (el.dataset.anim === "line" || el.dataset.anim === "wipe") {
        var p = el.parentNode;
        var io2 = new IntersectionObserver(function (es) {
          if (es[0].isIntersecting) { el.classList.add("in"); io2.disconnect(); }
        }, { threshold: 0.01 });
        io2.observe(p);
      } else io.observe(el);
    });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
  }

  /* paralaksa */
  var par = $$("[data-parallax]");
  var ticking = false;
  var paint = function () {
    ticking = false;
    var vh = window.innerHeight;
    par.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var k = parseFloat(img.dataset.parallax) || 0.05;
      img.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -k - r.height * 0.07) + "px,0)";
    });
  };
  window.addEventListener("scroll", function () {
    onScroll();
    if (!reduce && par.length && !ticking) { ticking = true; requestAnimationFrame(paint); }
  }, { passive: true });
  if (!reduce) paint();

  /* magnetni gumb */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.2 + "px," + (e.clientY - r.top - r.height / 2) * 0.3 + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    /* nagib kartica */
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + x * 6 + "deg) rotateX(" + -y * 6 + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* prije / poslije */
  $$("[data-ba]").forEach(function (r) {
    var box = r.closest(".ba");
    var set = function () { box.style.setProperty("--p", r.value + "%"); };
    r.addEventListener("input", set);
    set();
  });

  /* galerija – povećanje */
  var lb = $(".lb"), figs = $$(".gal figure"), cur = 0;
  if (lb && figs.length) {
    var lbImg = $("img", lb), lbCap = $("p", lb), last = null;
    var show = function (i) {
      cur = (i + figs.length) % figs.length;
      var im = $("img", figs[cur]);
      lbImg.src = im.getAttribute("src"); lbImg.alt = im.alt;
      lbCap.textContent = $("figcaption", figs[cur]).textContent + " · " + (cur + 1) + " / " + figs.length;
    };
    var close = function () { lb.classList.remove("open"); document.body.style.overflow = ""; if (last) last.focus(); };
    figs.forEach(function (f, i) {
      $(".zoom", f).addEventListener("click", function () { last = this; show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; $(".x", lb).focus(); });
    });
    $(".x", lb).addEventListener("click", close);
    $(".pv", lb).addEventListener("click", function () { show(cur - 1); });
    $(".nx", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* obrazac – priprema SMS (ili e-pošte ako je zadana adresa) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = false;
      $$("[required]", fm).forEach(function (i) { var b = !i.value.trim(); i.classList.toggle("bad", b); if (b) bad = true; });
      if (bad) { var first = $(".bad", fm); if (first) first.focus(); return; }
      var f = new FormData(fm);
      var body = [
        "Ime: " + f.get("ime"),
        "Telefon: " + f.get("telefon"),
        "Vozilo: " + (f.get("vozilo") || "-"),
        "Usluga: " + f.get("usluga"),
        "Opis: " + (f.get("opis") || "-")
      ];
      var text = "Upit za popravak (web)\n" + body.join("\n");
      if (fm.dataset.mail) location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + f.get("usluga") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(text);
      else location.href = "sms:" + fm.dataset.sms + "?&body=" + encodeURIComponent(text);
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
