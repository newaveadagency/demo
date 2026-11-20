/* Tattoo studio Kosta – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { if (menu) menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje se smanjuje + paralaksa (rAF, passive scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    if (nav) nav.classList.toggle("small", window.pageYOffset > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(" + (el.tagName === "VIDEO" ? 1.06 : 1.12) + ")";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* video: bez automatske reprodukcije uz smanjeno kretanje */
  $$("video[data-autoplay]").forEach(function (v) {
    if (reduce) return;
    v.preload = "auto"; v.muted = true;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  });

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1600, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }

  /* SVG linija koraka */
  $$(".steps svg.line path").forEach(function (p) {
    try { var l = Math.ceil(p.getTotalLength()); p.style.setProperty("--len", l); p.style.strokeDasharray = "6 8"; } catch (e) {}
  });

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * (el.dataset.anim === "drop" ? 0.08 : 0.09)) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]"), lines = $$(".steps svg.line path");
  function drawLine(p) { if (reduce) { p.style.strokeDashoffset = 0; return; } p.style.transition = "stroke-dashoffset 2.2s cubic-bezier(.6,0,.2,1)"; p.style.strokeDashoffset = 0; }
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    lines.forEach(drawLine);
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
    var lo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { drawLine(e.target); lo.unobserve(e.target); } });
    }, { threshold: 0.5 });
    lines.forEach(function (p) { lo.observe(p.closest(".steps") ? p : p); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* reflektor koji prati kursor (sekcije i kartice) */
  if (fine && !reduce) {
    $$(".spot, .card").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--x", (e.clientX - r.left) + "px");
        el.style.setProperty("--y", (e.clientY - r.top) + "px");
      });
    });
    /* nagib kartice */
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    /* magnetni gumb */
    $$(".magnet").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * .25).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.removeProperty("--mx"); b.style.removeProperty("--my"); });
    });
  }

  /* otvoreno / zatvoreno – pon–pet 13–20 (Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = +g("hour") + g("minute") / 60;
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      var open = wk && h >= 13 && h < 20;
      el.classList.toggle("open", open);
      el.textContent = open ? "Studio je sada otvoren · do 20 h" : (wk && h < 13 ? "Otvaramo danas u 13 h · Velebitska 80" : "Sada zatvoreno · radimo pon – pet 13 – 20 h");
    } catch (e) {}
  });

  /* galerija: filtri */
  var fbar = $(".filters");
  if (fbar) {
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        $$(".gal figure").forEach(function (fig) { fig.hidden = !(f === "sve" || fig.dataset.cat === f); if (!fig.hidden) fig.classList.add("in"); });
      });
    });
  }

  /* svjetlosni okvir (lightbox) – stvara se tek na klik */
  var figs = $$(".gal figure");
  if (figs.length) {
    var lb = null, cur = 0;
    function vis() { return figs.filter(function (f) { return !f.hidden; }); }
    function show(i) {
      var list = vis(); cur = (i + list.length) % list.length;
      var img = $("img", list[cur]), cap = $("figcaption", list[cur]);
      $("img", lb).src = img.src; $("img", lb).alt = img.alt;
      $("p", lb).textContent = (cap ? cap.textContent : "") + "  ·  " + (cur + 1) + " / " + list.length;
    }
    function close() { if (lb) { lb.remove(); lb = null; document.removeEventListener("keydown", key); } }
    function key(e) { if (e.key === "Escape") close(); if (e.key === "ArrowRight") show(cur + 1); if (e.key === "ArrowLeft") show(cur - 1); }
    figs.forEach(function (f) {
      f.tabIndex = 0;
      f.setAttribute("role", "button");
      function open() {
        lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Pregled fotografije");
        lb.innerHTML = '<img alt=""><button class="x" aria-label="Zatvori">×</button><button class="p" aria-label="Prethodna">‹</button><button class="n" aria-label="Sljedeća">›</button><p></p>';
        document.body.appendChild(lb);
        $(".x", lb).onclick = close; $(".p", lb).onclick = function () { show(cur - 1); }; $(".n", lb).onclick = function () { show(cur + 1); };
        lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
        document.addEventListener("keydown", key);
        show(vis().indexOf(f)); $(".x", lb).focus();
      }
      f.addEventListener("click", open);
      f.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["service", "Usluga"], ["message", "Ideja / poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("service") || "Tattoo Kosta") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Tattoo studija Kosta");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
