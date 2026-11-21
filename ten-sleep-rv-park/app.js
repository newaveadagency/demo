/* Ten Sleep RV Park – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* horizontal "places to stay" gallery driven by vertical scroll (wide screens only) */
  var stays = $(".stays"), track = stays && $(".stays-track", stays), pinOn = false;
  function setupPin() {
    if (!stays || !track) return;
    var want = !reduce && innerWidth > 900 && matchMedia("(hover: hover)").matches;
    if (want !== pinOn) { pinOn = want; stays.classList.toggle("pinned", want); track.style.transform = ""; }
    if (pinOn) {
      var extra = Math.max(0, track.scrollWidth - innerWidth);
      stays.style.setProperty("--pinh", (innerHeight + extra) + "px");
      stays.dataset.extra = extra;
    }
  }

  /* road line draws as you scroll */
  var road = $(".road"), roadPath = road && $(".road-line", road);

  /* header shrink + parallax + pinned gallery + road line (one rAF loop, passive listener) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        if (plx) {
          var r = plx.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < vh) plx.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -0.1).toFixed(1) + "px,0)";
        }
        if (pinOn) {
          var s = stays.getBoundingClientRect(), ex = +stays.dataset.extra || 0;
          var p = Math.min(1, Math.max(0, -s.top / Math.max(1, s.height - vh)));
          track.style.transform = "translate3d(" + (-p * ex).toFixed(1) + "px,0,0)";
        }
        if (roadPath) {
          var rr = road.getBoundingClientRect();
          var q = Math.min(1, Math.max(0, (vh * 0.85 - rr.top) / (rr.height + vh * 0.2)));
          roadPath.style.setProperty("--draw", (1 - q).toFixed(3));
        }
      }
      ticking = false;
    });
  }
  setupPin();
  addEventListener("resize", function () { setupPin(); onScroll(); });
  addEventListener("load", function () { setupPin(); onScroll(); });
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = parseFloat(el.getAttribute("data-count")), dec = +(el.getAttribute("data-dec") || 0), t0 = null, dur = 1500;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = end.toFixed(dec);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = end.toFixed(dec); }, dur + 300);
  }

  /* reveal on scroll with a small stagger between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-h [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* kinetic word in the hero */
  $$("[data-rot]").forEach(function (el) {
    var words = el.getAttribute("data-rot").split("|"), n = 0;
    if (reduce || words.length < 2) return;
    setInterval(function () {
      el.classList.add("out");
      setTimeout(function () {
        n = (n + 1) % words.length; el.textContent = words[n];
        el.classList.remove("out"); el.classList.add("pre");
        void el.offsetWidth; el.classList.remove("pre");
      }, 450);
    }, 2600);
  });

  /* magnetic buttons */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    /* tilt on photo cards */
    $$(".tilt, .stay, .rate").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* question form → prepared e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "E-mail"], ["arrive", "Arriving"], ["stay", "Stay type"], ["message", "Question"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Question about a stay (" + (f.get("stay") || "") + ") – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from tensleeprvpark.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
