/* Mini kamp Mon Paradis – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  onScroll();

  /* brojači */
  var fmt = function (n, plain) { return plain ? String(n) : n.toLocaleString("hr-HR"); };
  var count = function (el) {
    var to = +el.dataset.count, from = +(el.dataset.from || 0), suf = el.dataset.suffix || "", plain = el.hasAttribute("data-plain"), t0 = null, dur = 1600;
    if (reduce) { el.textContent = fmt(to, plain) + suf; return; }
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e), plain) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* otkrivanje pri skrolanju */
  var show = function (el) { el.classList.add("in"); $$("[data-count]", el).forEach(count); };
  if ("IntersectionObserver" in window && !reduce) {
    /* riječi naslova i lukovi su odrezani (overflow/clip-path), pa se promatra njihov roditelj */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target._anim || [e.target]).forEach(show);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    $$("[data-anim]").forEach(function (el) {
      var k = el.getAttribute("data-anim");
      if (k === "word" || k === "arch") {
        var host = k === "word" ? el.closest("h1,h2") : el.parentNode;
        if (!host._anim) { host._anim = []; io.observe(host); }
        host._anim.push(el);
      } else io.observe(el);
    });
  } else {
    $$("[data-anim]").forEach(function (el) { el.classList.add("in"); });
  }

  /* paralaksa */
  var par = $$(".par");
  var ticking = false;
  var parallax = function () {
    ticking = false;
    var vh = window.innerHeight;
    par.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var sp = +(el.dataset.speed || 0.05), d = (r.top + r.height / 2 - vh / 2) * sp;
      el.style.transform = "translate3d(0," + d.toFixed(1) + "px,0)" + (el.tagName === "IMG" ? " scale(1.12)" : "");
    });
  };
  window.addEventListener("scroll", function () {
    onScroll();
    if (!reduce && par.length && !ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });
  if (!reduce) parallax();

  /* magnetni gumbi (samo miš) */
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    $$(".hero .btn, .more .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* galerija: filtri + povećanje */
  var figs = $$(".gal figure");
  $$(".filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".filters button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var f = b.dataset.f;
      figs.forEach(function (fg) { fg.classList.toggle("hide", f !== "sve" && fg.dataset.cat !== f); });
    });
  });
  if (figs.length) {
    var lb = document.createElement("div"), cur = 0, last = null;
    lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Povećana fotografija");
    lb.innerHTML = '<img alt=""><p></p><button class="x" type="button" aria-label="Zatvori">×</button><button class="pv" type="button" aria-label="Prethodna">‹</button><button class="nx" type="button" aria-label="Sljedeća">›</button>';
    document.body.appendChild(lb);
    var vis = function () { return figs.filter(function (f) { return !f.classList.contains("hide"); }); };
    var open = function (i) {
      var list = vis(); cur = (i + list.length) % list.length;
      var im = $("img", list[cur]); var big = $("img", lb);
      big.src = $("button", list[cur]).dataset.full; big.alt = im.alt; $("p", lb).textContent = im.alt;
      lb.classList.add("open"); $(".x", lb).focus();
    };
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    figs.forEach(function (f) { $("button", f).addEventListener("click", function () { last = this; open(vis().indexOf(f)); }); });
    $(".x", lb).addEventListener("click", close);
    $(".pv", lb).addEventListener("click", function () { open(cur - 1); });
    $(".nx", lb).addEventListener("click", function () { open(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") open(cur - 1); else if (e.key === "ArrowRight") open(cur + 1);
    });
  }

  /* upit → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["email", "E-mail"], ["from", "Dolazak"], ["to", "Odlazak"], ["adults", "Odrasli"], ["kids", "Djeca (dob)"], ["pitch", "Smještaj"], ["vehicle", "Vozilo"], ["dog", "Pas"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za boravak " + (f.get("from") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice kampa Mon Paradis");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
