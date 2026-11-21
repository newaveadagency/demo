/* MM torte – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

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

  /* zaglavlje se smanjuje, paralaksa, vremenska crta se crta pri skrolanju */
  var nav = $(".nav"), par = $$("[data-parallax]"), tl = $(".tl"), fg = tl ? $(".fg", tl) : null, ticking = false;
  function onScroll() {
    var y = window.pageYOffset, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
      if (r.bottom > 0 && r.top < vh) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    if (fg) {
      var b = tl.getBoundingClientRect();
      var p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.75 - b.top) / b.height));
      fg.style.strokeDashoffset = (1 - p).toFixed(3);
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1400, t0 = null;
    if (reduce) { el.textContent = to; return; }
    el.textContent = "0";
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
    /* hero je odmah vidljiv: maskirani redovi naslova ne presijecaju zaslon, pa ih pokrećemo izravno */
    var heroT = $$(".hero [data-anim]");
    setTimeout(function () { heroT.forEach(function (el) { el.classList.add("in"); }); }, 80);
    targets.forEach(function (el) { if (heroT.indexOf(el) < 0) io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) {
    if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = "";
  });

  /* nagib kartica i magnetni gumbi (samo miš) */
  if (fine && !reduce) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* otvoreno / zatvoreno – pon–pet 8–15, sub 8–13 (Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = +g("hour") + g("minute") / 60;
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1, sat = d === "Sat";
      var open = (wk && h >= 8 && h < 15) || (sat && h >= 8 && h < 13);
      el.classList.toggle("open", open);
      el.textContent = open ? ("Sada radimo · do " + (sat ? "13" : "15") + " h") : "Sada ne radimo · upit pošaljite obrascem";
    } catch (e) {}
  });

  /* galerija: filtri i povećanje */
  var fbar = $(".filters");
  if (fbar) {
    var figs = $$(".grid-g figure");
    var setCat = function (cat) {
      $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.f === cat); });
      figs.forEach(function (f) {
        var show = cat === "sve" || f.dataset.cat === cat;
        f.classList.toggle("hide", !show);
        if (show) f.classList.add("in");
      });
    };
    $$("button", fbar).forEach(function (b) { b.addEventListener("click", function () { setCat(b.dataset.f); }); });
    var h = location.hash.slice(1);
    if (h && $('button[data-f="' + h + '"]', fbar)) setCat(h);

    var lb = document.createElement("div");
    lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Povećana fotografija");
    lb.innerHTML = '<img alt=""><button type="button" aria-label="Zatvori">×</button>';
    document.body.appendChild(lb);
    var lbImg = $("img", lb), lbBtn = $("button", lb), last = null;
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    figs.forEach(function (f) {
      f.tabIndex = 0;
      var open = function () { var im = $("img", f); lbImg.src = im.src; lbImg.alt = im.alt; last = f; lb.classList.add("open"); lbBtn.focus(); };
      f.addEventListener("click", open);
      f.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    lb.addEventListener("click", function (e) { if (e.target !== lbImg) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) close(); });
  }

  /* obrazac → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["occasion", "Prigoda"], ["date", "Datum preuzimanja"], ["size", "Veličina"], ["shape", "Oblik"], ["message", "Ideja / napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za tortu – " + (f.get("occasion") || "MM torte") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s mmtorte.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
