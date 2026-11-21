/* Recta Via – skripta stranice (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik na mobitelu */
  var nav = $(".nav"), burger = $(".burger"), menu = $(".menu");
  function navH() { if (nav) document.documentElement.style.setProperty("--navh", nav.offsetHeight + "px"); }
  navH(); window.addEventListener("resize", navH);
  if (burger && menu) {
    burger.addEventListener("click", function () {
      navH(); var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
      nav.classList.toggle("solid", o);
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); nav.classList.remove("solid"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* vodoravna galerija vezana uz skrolanje (samo desktop, bez reduced-motion) */
  var hs = $(".hs"), track = hs && $(".hs-track", hs), pinned = false, extra = 0;
  function setupHS() {
    if (!hs || !track) return;
    var want = !reduce && window.innerWidth > 900;
    hs.classList.toggle("pin", want); pinned = want;
    track.style.transform = "";
    if (want) {
      extra = Math.max(0, track.scrollWidth - window.innerWidth);
      hs.style.setProperty("--hs-h", (window.innerHeight + extra) + "px");
    }
  }
  setupHS(); window.addEventListener("resize", setupHS);

  /* zaglavlje se smanjuje pri skrolanju */
  var ticking = false;
  function frame() {
    if (nav) nav.classList.toggle("small", window.scrollY > 40);
    if (pinned) {
      var r = hs.getBoundingClientRect(), total = hs.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / (total || 1)));
      track.style.transform = "translate3d(" + (-p * extra) + "px,0,0)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* brojači (godine kreću od nižeg broja da ne broje od nule) */
  function count(el) {
    var end = parseInt(el.getAttribute("data-count"), 10); if (isNaN(end)) return;
    if (reduce) { el.textContent = end; return; }
    var start = end > 1000 ? end - 40 : 0, t0 = Date.now(), dur = 1500;
    (function step() {
      var k = Math.min(1, (Date.now() - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(start + (end - start) * e);
      if (k < 1) setTimeout(step, 30);
    })();
  }

  /* otkrivanje pri skrolanju; maske i SVG crte promatraju se preko roditelja */
  var targets = $$("[data-anim], [data-count]");
  function reveal(el) {
    var d = parseInt(el.getAttribute("data-delay") || "0", 10);
    setTimeout(function () { el.classList.add("in"); if (el.hasAttribute("data-count")) count(el); }, d);
  }
  if (!("IntersectionObserver" in window) || reduce) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var map = new Map();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (map.get(e.target) || []).forEach(reveal);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    targets.forEach(function (el) {
      var k = el.getAttribute("data-anim"), w = el;
      if (k === "rise") w = el.parentElement;
      if (k === "draw") w = el.closest("svg").parentElement;
      if (!map.has(w)) { map.set(w, []); io.observe(w); }
      map.get(w).push(el);
    });
  }

  /* magnetni gumbi, nagib kartica i reflektor koji prati kursor */
  if (fine && !reduce) {
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.25) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.35) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--x", x * 100 + "%"); c.style.setProperty("--y", y * 100 + "%");
        c.style.transform = "perspective(800px) rotateX(" + ((0.5 - y) * 7) + "deg) rotateY(" + ((x - 0.5) * 9) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* obrasci → pripremljena e-pošta */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime i prezime"], ["telefon", "Telefon"], ["email", "E-mail"], ["usluga", "Zanima me"], ["poruka", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      var subj = "Upit: " + (f.get("usluga") || "knjigovodstvo") + " – " + (f.get("ime") || "");
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice recta-via.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });

  /* godina u podnožju */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
