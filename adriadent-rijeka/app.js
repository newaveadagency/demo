/* Adriadent – zajednička skripta (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* zaglavlje: smanjuje se pri skrolanju + traka napretka */
  var hd = $(".hd"), prog = $(".prog"), ticking = false;
  var onScroll = function () {
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (hd) hd.classList.toggle("small", y > 40);
    if (prog) prog.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
    parallax();
  };
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("open")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.focus(); } });
  }

  /* paralaksa slike u traci */
  var px = $$("[data-parallax]");
  function parallax() {
    if (reduce) return;
    px.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = "translate3d(0," + (p * -60).toFixed(1) + "px,0)";
    });
  }

  /* brojači */
  function count(el) {
    var end = parseFloat(el.getAttribute("data-count")), t0 = null, dur = 1400;
    if (reduce || !end) { el.textContent = end; return; }
    var step = function (t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(end * e);
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = "0";
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  var anims = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    anims.forEach(function (el) { el.classList.add("in"); });
  } else {
    /* skriveni (izrezani) elementi nemaju vidljivu površinu, pa se promatra njihov roditelj */
    var groups = [];
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        groups.forEach(function (g) { if (g.t === e.target) g.els.forEach(function (el) { el.classList.add("in"); }); });
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    anims.forEach(function (el) {
      var type = el.getAttribute("data-anim");
      if (type === "col") { requestAnimationFrame(function () { el.classList.add("in"); }); return; }
      var t = /^(clip|line|wipe)$/.test(type) ? el.parentNode : el, g = null;
      groups.forEach(function (x) { if (x.t === t) g = x; });
      if (g) g.els.push(el); else { groups.push({ t: t, els: [el] }); io.observe(t); }
    });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* današnji dan u radnom vremenu */
  var today = new Date().getDay();
  $$(".hours [data-day]").forEach(function (r) { if (+r.getAttribute("data-day") === today) r.classList.add("today"); });

  /* sadržaj podstranice: aktivna stavka prati skrolanje */
  var toc = $$(".toc a[href^='#']");
  if (toc.length && "IntersectionObserver" in window) {
    var map = {};
    toc.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { toc.forEach(function (a) { a.classList.remove("on"); }); var a = map[e.target.id]; if (a) a.classList.add("on"); }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* obrazac: pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime i prezime"], ["telefon", "Telefon"], ["email", "E-mail"], ["usluga", "Razlog dolaska"], ["poruka", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent((f.get("usluga") || "Upit") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s adriadent.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });

  onScroll();
})();
