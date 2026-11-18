/* Vinarija Krolo – zajednička skripta */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* zaglavlje: prozirno na vrhu, tamno i niže pri skrolanju */
  var nav = $(".nav"), menu = $(".menu"), burger = $(".burger");
  var onNav = function () { if (nav) nav.classList.toggle("solid", window.scrollY > 40 || (menu && menu.classList.contains("open"))); };
  window.addEventListener("scroll", onNav, { passive: true }); onNav();
  if (burger) burger.addEventListener("click", function () {
    menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); onNav();
  });
  $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger && burger.setAttribute("aria-expanded", "false"); onNav(); }); });

  /* otkrivanje pri skrolanju + brojači */
  var count = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10), t0 = null, dur = 1600;
    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
    if (reduce) { el.textContent = fmt(end); return; }
    var step = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(end * e)); if (p < 1) requestAnimationFrame(step); };
    el.textContent = "0"; requestAnimationFrame(step);
    setTimeout(function () { el.textContent = fmt(end); }, dur + 400);
  };
  var reveal = function (el) { el.classList.add("in"); $$("[data-count]", el).forEach(count); };
  var hero = $$(".hero [data-anim], .phead [data-anim]");
  setTimeout(function () { hero.forEach(reveal); }, 120);
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
    $$("[data-anim]").forEach(function (el) { if (hero.indexOf(el) < 0) io.observe(el); });
  } else $$("[data-anim]").forEach(function (el) { el.classList.add("in"); });

  /* vremenska crta: SVG linija se iscrtava sa skrolanjem */
  var tl = $("[data-tl]"), draw = tl && $(".tl-line .draw", tl);
  /* paralaksa slika */
  var par = $$("[data-parallax]");
  if (!reduce && (draw || par.length)) {
    if (draw) { draw.style.strokeDasharray = "1"; draw.style.strokeDashoffset = "1"; }
    var ticking = false;
    var frame = function () {
      ticking = false;
      var vh = window.innerHeight;
      if (draw) {
        var r = tl.getBoundingClientRect(), p = (vh * 0.7 - r.top) / r.height;
        draw.style.strokeDashoffset = String(1 - Math.max(0, Math.min(1, p)));
      }
      par.forEach(function (el) {
        var b = el.parentNode.getBoundingClientRect(); if (b.bottom < 0 || b.top > vh) return;
        var k = (b.top + b.height / 2 - vh / 2) / vh;
        el.style.transform = "translate3d(0," + (k * -60).toFixed(1) + "px,0)";
      });
    };
    var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    window.addEventListener("scroll", req, { passive: true }); window.addEventListener("resize", req); frame();
  }

  /* SVG loza u zaglavlju podstranica: crtanje poteza */
  if (!reduce) $$("[data-draw]").forEach(function (p, i) {
    var len = p.getTotalLength ? p.getTotalLength() : 600;
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    p.style.transition = "stroke-dashoffset 2.4s cubic-bezier(.4,.1,.2,1) " + (0.3 + i * 0.18) + "s";
    requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = "0"; }); });
  });

  /* nagib kartica vina */
  if (!reduce && window.matchMedia("(hover:hover)").matches) $$("[data-tilt]").forEach(function (c) {
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)";
    });
    c.addEventListener("mouseleave", function () { c.style.transform = ""; });
  });

  /* galerija – povećanje */
  var links = $$(".gal a");
  if (links.length) {
    var lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Galerija");
    lb.innerHTML = '<img alt=""><button class="x" aria-label="Zatvori">×</button><button class="p" aria-label="Prethodna">‹</button><button class="n" aria-label="Sljedeća">›</button><div class="c"></div>';
    document.body.appendChild(lb);
    var cur = 0, last = null;
    var show = function (i) { cur = (i + links.length) % links.length; var a = links[cur]; $("img", lb).src = a.getAttribute("href"); $("img", lb).alt = ($("img", a) || {}).alt || ""; $(".c", lb).textContent = (cur + 1) + " / " + links.length; lb.classList.add("open"); $(".x", lb).focus(); };
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    links.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); last = a; show(i); }); });
    $(".x", lb).onclick = close;
    $(".p", lb).onclick = function () { show(cur - 1); };
    $(".n", lb).onclick = function () { show(cur + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (!lb.classList.contains("open")) return; if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
  }

  /* gumbi "Upit za narudžbu" biraju vino u obrascu */
  $$("[data-vino]").forEach(function (b) { b.addEventListener("click", function () { var s = $("#n-vino"); if (s) s.value = b.getAttribute("data-vino"); }); });

  /* obrazac na naslovnici: degustacija ili narudžba */
  $$("form.lead-form").forEach(function (fm) {
    var radios = $$("input[name=vrsta][type=radio]", fm);
    var sync = function () { var t = (fm.querySelector("input[name=vrsta]:checked") || {}).value !== "Narudžba vina"; $$(".only-tour", fm).forEach(function (el) { el.style.display = t ? "" : "none"; }); };
    radios.forEach(function (r) { r.addEventListener("change", sync); }); if (radios.length) sync();
    var d = fm.querySelector("input[type=date]");
    if (d) { var t = new Date(Date.now() + 4 * 864e5); d.min = t.toISOString().slice(0, 10); }

    /* slaganje e-poruke (mailto) */
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [], vrsta = f.get("vrsta") || "Upit", tour = vrsta === "Degustacija";
      var rows = [["vrsta", "Vrsta upita"], ["program", "Program"], ["vino", "Vino"], ["datum", "Željeni datum"], ["kolicina", tour ? "Broj osoba" : "Broj boca"], ["ime", "Ime i prezime"], ["telefon", "Telefon"], ["email", "E-mail"], ["poruka", "Poruka"]];
      rows.forEach(function (k) {
        var el = fm.querySelector("[name=" + k[0] + "]"); if (!el || (el.closest(".only-tour") && el.closest(".only-tour").style.display === "none")) return;
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      var subj = tour ? "Upit za degustaciju – " + (f.get("program") || "") + (f.get("datum") ? ", " + f.get("datum") : "") : "Upit za narudžbu vina – " + (f.get("ime") || "");
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s vinarija-krolo.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
