/* Plesni centar Beat – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* otkrivanje pri skrolanju */
  var reveal = $$("[data-anim], [data-ages]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveal.forEach(function (el) {
      /* maskirani redovi: promatra se roditelj jer je sam element odrezan */
      if (el.getAttribute("data-anim") === "up" && el.parentElement) {
        var po = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { el.classList.add("in"); po.disconnect(); } }); });
        po.observe(el.parentElement);
      } else io.observe(el);
    });
  } else reveal.forEach(function (el) { el.classList.add("in"); });

  /* kinetička riječ u naslovu */
  $$("[data-rot]").forEach(function (box) {
    var w = $$("b", box), i = 0;
    if (!w.length) return;
    w[0].classList.add("on");
    if (reduce || w.length < 2) return;
    setInterval(function () {
      var cur = w[i]; i = (i + 1) % w.length;
      cur.classList.remove("on"); cur.classList.add("out");
      setTimeout(function () { cur.classList.remove("out"); }, 600);
      w[i].classList.add("on");
    }, 2300);
  });

  /* brojači */
  var counters = $$("[data-count]");
  function runCount(el) {
    var to = +el.getAttribute("data-count"), from = to > 1000 ? to - 40 : 0, t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: .6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* zaglavlje, paralaksa, vodoravna galerija */
  var nav = $(".nav"), par = $("[data-parallax] img"), hgal = $(".hgal"), track = $("[data-hgal]"), hbar = $("[data-hbar]");
  var pinned = false;
  function setupGallery() {
    if (!hgal || !track) return;
    var wide = window.innerWidth > 900 && !reduce;
    if (wide) {
      hgal.classList.add("pinned");
      var dist = track.scrollWidth - window.innerWidth + 40;
      hgal.style.height = (window.innerHeight + Math.max(dist, 0)) + "px";
      pinned = true;
    } else {
      hgal.classList.remove("pinned"); hgal.style.height = ""; track.style.transform = ""; pinned = false;
    }
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (nav) nav.classList.toggle("small", y > 40);
      if (par && !reduce && y < window.innerHeight * 1.2) par.style.transform = "translate3d(0," + (y * 0.28) + "px,0) scale(1.08)";
      if (pinned) {
        var r = hgal.getBoundingClientRect(), max = hgal.offsetHeight - window.innerHeight;
        var p = Math.min(Math.max(-r.top / (max || 1), 0), 1);
        var dist = track.scrollWidth - window.innerWidth + 40;
        track.style.transform = "translate3d(" + (-p * dist) + "px,0,0)";
        if (hbar) hbar.style.transform = "scaleX(" + p + ")";
      } else if (hbar && track) {
        var m = track.scrollWidth - track.clientWidth;
        hbar.style.transform = "scaleX(" + (m > 0 ? track.scrollLeft / m : 0) + ")";
      }
      ticking = false;
    });
  }
  setupGallery();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { setupGallery(); onScroll(); });
  if (track) track.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", function () { setupGallery(); onScroll(); });
  onScroll();

  /* magnetni gumbi i nagib kartica (samo miš) */
  if (fine && !reduce) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.25) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.35) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.removeProperty("--mx"); b.style.removeProperty("--my"); });
    });
    $$(".card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 10) + "deg) rotateX(" + (-y * 10) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* upitnik za upis → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["age", "Dob polaznika"], ["service", "Program"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Upit za upis – " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Plesnog centra Beat");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
