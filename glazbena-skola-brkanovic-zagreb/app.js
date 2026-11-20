/* Glazbena škola Brkanović – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    var close = function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* vodoravna galerija vođena skrolanjem */
  var hs = $("[data-hscroll]"), track = hs && $(".hs-track", hs), bar = hs && $(".hs-bar i", hs);
  var wide = function () { return window.innerWidth > 720 && !reduce; };
  function sizeHs() {
    if (!hs || !track) return;
    hs.classList.toggle("live", wide());
    if (!wide()) { hs.style.height = ""; track.style.transform = ""; return; }
    var extra = Math.max(0, track.scrollWidth - window.innerWidth);
    hs.style.height = (window.innerHeight + extra) + "px";
  }
  function moveHs() {
    if (!hs || !track || !wide()) return;
    var r = hs.getBoundingClientRect(), extra = Math.max(0, track.scrollWidth - window.innerWidth);
    var p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
    track.style.transform = "translate3d(" + (-extra * p).toFixed(1) + "px,0,0)";
    if (bar) bar.style.transform = "scaleX(" + p.toFixed(3) + ")";
  }

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav"), ticking = false;
  function onScroll() {
    if (nav) nav.classList.toggle("small", window.pageYOffset > 40);
    moveHs();
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", function () { sizeHs(); moveHs(); });
  sizeHs(); onScroll();

  /* izmjenjivanje instrumenata u naslovu */
  $$("[data-rot]").forEach(function (el) {
    var words = el.dataset.rot.split("|"), i = 0;
    if (reduce || words.length < 2) return;
    setInterval(function () {
      el.classList.add("out");
      setTimeout(function () {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove("out");
      }, 360);
    }, 2000);
  });

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1400, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = to; }, dur + 400);
  }

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
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
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* nagib kartica */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["program", "Program"], ["instrument", "Instrument / smjer"], ["message", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za upis – " + (f.get("program") || "Glazbena škola Brkanović") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Glazbene škole Brkanović");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
