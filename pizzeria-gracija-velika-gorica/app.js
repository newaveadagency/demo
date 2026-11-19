/* Pizzeria Gracija – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* reveal on scroll (hero words get a stagger) */
  var anims = $$("[data-anim]");
  $$('[data-anim="word"]').forEach(function (el, i) { el.style.transitionDelay = (0.12 + i * 0.09) + "s"; });
  if (reduce || !("IntersectionObserver" in window)) anims.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    anims.forEach(function (el) { io.observe(el); });
  }

  /* counters */
  var counters = $$("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, to = +el.getAttribute("data-count"), t0 = performance.now(), dur = 1400;
        (function step(t) {
          var p = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
          el.textContent = v; if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = "0"; co.observe(el); });
  }

  /* header shrink, horizontal gallery, parallax, spinning pizza */
  var nav = $(".nav"), hs = $(".hs"), track = hs && $(".hs-track", hs), plx = $$(".plx"), spin = $(".hero-pizza .spin");
  function hsSetup() {
    if (!hs) return;
    var pin = !reduce && window.innerWidth > 900;
    hs.classList.toggle("pin", pin);
    if (pin) hs.style.height = (track.scrollWidth - window.innerWidth + window.innerHeight + 80) + "px";
    else { hs.style.height = ""; track.style.transform = ""; }
  }
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY;
    if (nav) nav.classList.toggle("small", y > 40);
    if (reduce) return;
    if (hs && hs.classList.contains("pin")) {
      var r = hs.getBoundingClientRect(), max = track.scrollWidth - window.innerWidth;
      var p = Math.min(1, Math.max(0, -r.top / (hs.offsetHeight - window.innerHeight)));
      track.style.transform = "translate3d(" + (-p * max) + "px,0,0)";
    }
    plx.forEach(function (img) {
      var b = img.parentNode.getBoundingClientRect();
      if (b.bottom < 0 || b.top > window.innerHeight) return;
      var k = (b.top + b.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = "translate3d(0," + (k * -60 - 30) + "px,0)";
    });
    if (spin && y < window.innerHeight * 1.5) spin.style.transform = "rotate(" + (y * 0.25) + "deg)";
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", function () { hsSetup(); req(); });
  window.addEventListener("load", function () { hsSetup(); req(); });
  hsSetup(); frame();

  /* magnetic buttons + tilt cards (mouse only) */
  if (fine && !reduce) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.25) + "px," + ((e.clientY - r.top - r.height / 2) * 0.35) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateX(" + (-y * 9) + "deg) rotateY(" + (x * 11) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open now (Mon–Sat 9:30–23:30, Sun 12–23, Europe/Zagreb; holidays follow Sunday hours) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, open = d === "Sun" ? h >= 12 && h < 23 : h >= 9.5 && h < 23.5;
      el.textContent = open ? "Sada smo otvoreni" : "Trenutno zatvoreno";
      el.classList.add(open ? "is-open" : "is-closed");
    } catch (e) {}
  });

  /* size picker on menu */
  var sizes = $(".sizes");
  if (sizes) {
    var root = document.documentElement;
    root.setAttribute("data-pick", "velika");
    $$("button", sizes).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", sizes).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        root.setAttribute("data-pick", b.getAttribute("data-size"));
      });
    });
  }

  /* inquiry form → prepared e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Pizzerije Gracija");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
