/* Pansion Winnetou – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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

  /* zaglavlje se smanjuje, paralaksa slika, kotač se okreće sa skrolanjem */
  var nav = $(".nav"), par = $$("[data-parallax]"), wheels = $$("[data-wheel]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect(), k = parseFloat(el.getAttribute("data-parallax")) || 0.08;
        if (r.bottom > -200 && r.top < innerHeight + 200) {
          el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
        }
      });
      wheels.forEach(function (w) { w.style.transform = "rotate(" + (y * 0.25).toFixed(1) + "deg)"; });
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.getAttribute("data-count")), dur = 1400, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    el.textContent = "0";
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = to; }, dur + 400);
  }

  /* duljina SVG linije rute za crtanje */
  $$(".route .draw").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  $$("[data-anim]").forEach(function (el) { var d = el.getAttribute("data-d"); if (d) el.style.transitionDelay = (d * 0.09) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
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
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) {
    if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = "";
  });

  /* nagib kartica prema kursoru */
  if (fine && !reduce) {
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
    /* magnetni gumbi */
    $$(".btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* gumb "Upit za ovu sobu" unaprijed odabere sobu u obrascu */
  $$("[data-soba]").forEach(function (a) {
    a.addEventListener("click", function () {
      var sel = $("#f-soba"), want = a.getAttribute("data-soba");
      if (!sel) return;
      $$("option", sel).forEach(function (o) { if (o.textContent.indexOf(want) === 0) sel.value = o.value || o.textContent; });
    });
  });

  /* datumi: odlazak ne prije dolaska */
  var dol = $("#f-dol"), odl = $("#f-odl");
  if (dol && odl) {
    try { dol.min = new Date().toISOString().slice(0, 10); } catch (e) {}
    dol.addEventListener("change", function () { odl.min = dol.value; if (odl.value && odl.value < dol.value) odl.value = ""; });
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["arrival", "Dolazak"], ["departure", "Odlazak"], ["guests", "Broj osoba"], ["room", "Vrsta sobe"], ["meals", "Obroci"], ["name", "Ime i prezime"], ["email", "E-mail"], ["phone", "Telefon"], ["message", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      var subj = "Upit za smještaj " + (f.get("arrival") || "") + " – " + (f.get("departure") || "") + " – " + f.get("name");
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Pansiona Winnetou");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
