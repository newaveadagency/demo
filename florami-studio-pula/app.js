/* Florami studio, Pula – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* riječi u naslovu jedna za drugom */
  $$("[data-anim='word']").forEach(function (w, i) { w.style.transitionDelay = (0.08 + i * 0.09) + "s"; });
  $$(".stagger > [data-anim]").forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = (i * 0.09) + "s";
  });

  /* otkrivanje pri skrolanju */
  var els = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* brojači */
  var counters = $$("[data-count]");
  var run = function (el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1600;
    if (reduce || !end) { el.textContent = end; return; }
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* nagib kartica (mikrointerakcija) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* paralaksa u kolažu */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var upd = function () {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect(), k = +(el.getAttribute("data-parallax") || 0.08);
        el.style.transform = "translateY(" + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* galerija: filtri */
  var fbtn = $$(".filters button");
  fbtn.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      fbtn.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".masonry figure").forEach(function (fig) {
        fig.classList.toggle("hide", f !== "sve" && fig.getAttribute("data-cat") !== f);
      });
    });
  });

  /* galerija: povećanje fotografije */
  $$(".masonry figure").forEach(function (fig) {
    var img = $("img", fig);
    var open = function () {
      var lb = document.createElement("div");
      lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", img.alt);
      lb.innerHTML = '<img alt=""><button type="button" aria-label="Zatvori">×</button>';
      lb.firstChild.src = img.src; lb.firstChild.alt = img.alt;
      var close = function () { lb.remove(); document.removeEventListener("keydown", esc); fig.focus(); };
      var esc = function (e) { if (e.key === "Escape") close(); };
      lb.addEventListener("click", function (e) { if (e.target !== lb.firstChild) close(); });
      document.addEventListener("keydown", esc);
      document.body.appendChild(lb);
      lb.querySelector("button").focus();
    };
    fig.addEventListener("click", open);
    fig.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });

  /* upit → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime i prezime"], ["telefon", "Telefon"], ["email", "E-mail"], ["datum", "Datum vjenčanja / događaja"], ["lokacija", "Lokacija"], ["usluga", "Zanima me"], ["poruka", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + (f.get("usluga") || "cvijeće") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Florami studija");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
