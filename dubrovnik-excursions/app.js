/* Dubrovnik Excursions and Tours – zajednička skripta */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav"), menu = $(".menu"), burger = $(".burger");
  var onNav = function () { if (nav) nav.classList.toggle("small", window.scrollY > 30); };
  window.addEventListener("scroll", onNav, { passive: true }); onNav();
  if (burger) burger.addEventListener("click", function () {
    menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open"));
  });
  $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }); });

  /* 2. otkrivanje (maska redaka, clip-path slika, fade-up) + 3. brojači */
  var count = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10), dur = 1800, n = 0, steps = 45;
    if (reduce) { el.textContent = end; return; }
    el.textContent = "0";
    var id = setInterval(function () {
      n++; var p = n / steps, e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * e);
      if (n >= steps) { clearInterval(id); el.textContent = end; }
    }, dur / steps);
  };
  var reveal = function (el) { el.classList.add("in"); $$("[data-count]", el).forEach(count); };
  var hero = $$(".hero [data-anim], .phead [data-anim]");
  setTimeout(function () { hero.forEach(reveal); }, 100);
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    $$("[data-anim]").forEach(function (el) { if (hero.indexOf(el) < 0) io.observe(el); });
  } else $$("[data-anim]").forEach(reveal);

  /* 4. paralaksa slike + 5. SVG linija plana izleta crta se skrolanjem */
  var par = $$("[data-parallax]"), tl = $("[data-tl]"), draw = tl && $(".tl-line .draw", tl);
  if (!reduce && (par.length || draw)) {
    if (draw) { draw.style.strokeDasharray = "1"; draw.style.strokeDashoffset = "1"; }
    var ticking = false;
    var frame = function () {
      ticking = false;
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var b = el.getBoundingClientRect(); if (b.bottom < -200 || b.top > vh + 200) return;
        var k = (b.top + b.height / 2 - vh / 2) / vh;
        el.style.transform = "translate3d(0," + (k * -50).toFixed(1) + "px,0)";
      });
      if (draw) {
        var r = tl.getBoundingClientRect(), p = (vh * 0.75 - r.top) / r.height;
        draw.style.strokeDashoffset = String(1 - Math.max(0, Math.min(1, p)));
      }
    };
    var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    window.addEventListener("scroll", req, { passive: true }); window.addEventListener("resize", req); frame();
  }

  /* beskonačna traka s odredištima – pokreće se pri prvoj interakciji (štedi CPU dok je stranica u mirovanju) */
  var mq = $(".marq");
  if (mq && !reduce) {
    var go = function () { mq.classList.add("run"); ["scroll", "pointermove", "touchstart", "keydown"].forEach(function (ev) { window.removeEventListener(ev, go); }); };
    ["scroll", "pointermove", "touchstart", "keydown"].forEach(function (ev) { window.addEventListener(ev, go, { passive: true }); });
  }

  /* 6. harmonika: glatko otvaranje odgovora i planova izleta */
  $$("details").forEach(function (d) {
    var s = $("summary", d), body = $(".ans", d);
    if (!s || !body || reduce || !body.animate) return;
    s.addEventListener("click", function (e) {
      e.preventDefault();
      if (d.open) {
        var a = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 380, easing: "cubic-bezier(.22,.7,.12,1)" });
        a.onfinish = function () { d.open = false; };
      } else {
        d.open = true;
        body.animate([{ height: "0px", opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], { duration: 520, easing: "cubic-bezier(.22,.7,.12,1)" });
      }
    });
  });

  /* 7. magnetni gumbi (samo miš) */
  if (!reduce && window.matchMedia("(hover:hover)").matches) $$(".acts .btn, .btn-terra").forEach(function (b) {
    b.addEventListener("mousemove", function (e) {
      var r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      b.style.transform = "translate(" + (x * 0.18).toFixed(1) + "px," + (y * 0.3).toFixed(1) + "px)";
    });
    b.addEventListener("mouseleave", function () { b.style.transform = ""; });
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

  /* gumb "Upit za …" bira izlet u obrascu */
  $$("[data-izlet]").forEach(function (b) { b.addEventListener("click", function () { var s = $("#f-izlet"); if (s) s.value = b.getAttribute("data-izlet"); }); });

  /* obrazac → pripremljena e-poruka (mailto) */
  $$("form.lead-form").forEach(function (fm) {
    var d = fm.querySelector("input[type=date]");
    if (d) d.min = new Date().toISOString().slice(0, 10);
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["izlet", "Izlet"], ["datum", "Željeni datum"], ["osobe", "Broj osoba"], ["ime", "Ime i prezime"], ["telefon", "Telefon"], ["email", "E-mail"], ["poruka", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var subj = "Upit: " + (f.get("izlet") || "izlet") + (f.get("datum") ? ", " + f.get("datum") : "");
      location.href = "mailto:" + (fm.getAttribute("data-mail") || "") + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s dubrovnik-excursions.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
