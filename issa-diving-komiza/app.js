/* ISSA Diving Center – demo skripta */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* otkrivanje pri skrolanju */
  var counted = function (el) {
    var end = +el.getAttribute("data-count"), from = end > 1000 ? end - 60 : 0, t0 = null, dur = 1600;
    if (reduce) { el.textContent = end; return; }
    var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(from + (end - from) * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(counted);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    $$("[data-anim]").forEach(function (el) { io.observe(el); });
  } else {
    $$("[data-anim]").forEach(function (el) { el.classList.add("in"); });
  }

  /* kinetička riječ u naslovu */
  $$("[data-rotate]").forEach(function (el) {
    var words = el.getAttribute("data-rotate").split("|"), i = 0;
    if (reduce || words.length < 2) return;
    setInterval(function () {
      el.classList.add("out");
      setTimeout(function () {
        i = (i + 1) % words.length; el.textContent = words[i];
        el.classList.remove("out"); el.classList.add("pre");
        void el.offsetWidth; el.classList.remove("pre");
      }, 420);
    }, 2600);
  });

  /* vodoravna galerija olupina */
  var hx = $(".hx"), track = hx && $(".hx-track", hx), bar = hx && $("[data-hx-bar]", hx), dist = 0;
  var wide = window.matchMedia("(min-width: 861px)");
  function setupHx() {
    if (!hx) return;
    var pin = wide.matches && !reduce;
    hx.classList.toggle("pin", pin);
    track.style.transform = "";
    if (pin) {
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      hx.style.setProperty("--hx-h", (window.innerHeight + dist) + "px");
    } else { hx.style.removeProperty("--hx-h"); dist = 0; }
  }
  if (track) {
    track.addEventListener("scroll", function () {
      if (hx.classList.contains("pin")) return;
      var m = track.scrollWidth - track.clientWidth; bar.style.setProperty("--p", m > 0 ? track.scrollLeft / m : 0);
    }, { passive: true });
  }

  /* zaglavlje, dubinomjer, paralaksa, galerija – jedan rAF */
  var nav = $(".nav"), depth = $("[data-depth]"), dbar = $(".depth-bar i"), par = $("[data-parallax]"), ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset, h = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (depth) { var p = h > 0 ? Math.min(y / h, 1) : 0; depth.textContent = Math.round(p * 120); if (dbar) dbar.style.setProperty("--p", (p * 100) + "%"); }
    if (par && !reduce && y < window.innerHeight * 1.2) par.style.transform = "translate3d(0," + (y * 0.25) + "px,0)";
    if (hx && hx.classList.contains("pin") && dist) {
      var top = hx.getBoundingClientRect().top, q = Math.min(Math.max(-top / dist, 0), 1);
      track.style.transform = "translate3d(" + (-q * dist) + "px,0,0)";
      if (bar) bar.style.setProperty("--p", q);
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { setupHx(); onScroll(); });
  window.addEventListener("load", function () { setupHx(); onScroll(); });
  setupHx(); frame();

  /* magnetni gumbi i nagib kartica */
  if (fine && !reduce) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.25) + "px," + ((e.clientY - r.top - r.height / 2) * 0.35) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(1000px) rotateY(" + (x * 6) + "deg) rotateX(" + (-y * 6) + "deg)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* upit → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["email", "E-mail"], ["phone", "Telefon"], ["date", "Okvirni datum"], ["service", "Zanima me"], ["divers", "Broj ronilaca"], ["level", "Razina certifikata"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + (f.get("service") || "ronjenje") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
