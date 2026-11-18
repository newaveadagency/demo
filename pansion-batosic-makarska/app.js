/* Pansion Batošić – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje pri skrolanju + paralaksa */
  var nav = $(".nav"), px = $$(".px"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.pageYOffset;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) px.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect(), vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = "translate3d(0," + (p * -60).toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1600;
    if (reduce || !end) { el.textContent = end; return; }
    function step(t) { if (!t0) t0 = t; var k = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  var items = $$("[data-anim]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) {
      if (el.getAttribute("data-anim") === "arch") {
        /* clip-path skriva element pa promatramo roditelja */
        var po = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { el.classList.add("in"); po.disconnect(); } }, { threshold: 0.05 });
        po.observe(el.parentElement);
      } else io.observe(el);
    });
  } else items.forEach(function (el) { el.classList.add("in"); });

  /* nagib kartica soba */
  if (fine && !reduce) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    /* magnetni gumb */
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .25).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* datum odlaska ne može biti prije dolaska */
  $$("form.lead-form").forEach(function (fm) {
    var a = $("[name=from]", fm), b = $("[name=to]", fm);
    var today = new Date().toISOString().slice(0, 10);
    if (a) a.min = today;
    if (a && b) { b.min = today; a.addEventListener("change", function () { b.min = a.value || today; if (b.value && b.value < a.value) b.value = ""; }); }
  });

  /* upiti → pripremljeni e-mail */
  function hr(d) { if (!d) return ""; var p = d.split("-"); return p.length === 3 ? (+p[2]) + ". " + (+p[1]) + ". " + p[0] + "." : d; }
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime"], ["email", "E-mail"], ["phone", "Telefon"], ["from", "Dolazak"], ["to", "Odlazak"], ["guests", "Broj osoba"], ["room", "Soba"], ["breakfast", "Doručak"], ["message", "Poruka"]].forEach(function (k) {
        var v = f.get(k[0]); if (v) body.push(k[1] + ": " + (k[0] === "from" || k[0] === "to" ? hr(v) : v));
      });
      var subj = "Upit za smještaj" + (f.get("from") ? " " + hr(f.get("from")) + " – " + hr(f.get("to")) : "") + " – " + f.get("name");
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent("Poštovani,\n\n" + body.join("\n") + "\n\nPoslano sa stranice batosic.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
