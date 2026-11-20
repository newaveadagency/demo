/* Swayne Studios – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + parallax (rAF, passive listener) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + (((r.top + r.height / 2) - innerHeight / 2) * -0.1 - r.height * 0.08).toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* aperture line drawing: measure real path lengths */
  $$(".aperture [data-draw]").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {} });

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
    var intro = $$(".hero-h [data-anim], .page-hero h1 [data-anim]").concat($$(".stack [data-anim]"));
    intro.forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* cursor spotlight in the hero */
  if (!reduce && fine) {
    $$(".hero, .page-hero").forEach(function (h) {
      var spot = $(".spot", h); if (!spot) return;
      h.addEventListener("pointermove", function (e) {
        var r = h.getBoundingClientRect();
        spot.style.setProperty("--mx", (e.clientX - r.left) + "px");
        spot.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* glass cards: tilt + light that follows the cursor */
  if (!reduce && fine) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--x", (x * 100).toFixed(1) + "%"); c.style.setProperty("--y", (y * 100).toFixed(1) + "%");
        c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 6).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 8).toFixed(2) + "deg)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });

    /* magnetic buttons */
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* horizontal gallery: vertical wheel scrolls sideways, drag with mouse */
  $$(".hgal").forEach(function (g) {
    g.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var max = g.scrollWidth - g.clientWidth;
      if ((e.deltaY > 0 && g.scrollLeft < max - 1) || (e.deltaY < 0 && g.scrollLeft > 0)) { e.preventDefault(); g.scrollLeft += e.deltaY; }
    }, { passive: false });
    var down = false, sx = 0, sl = 0;
    g.addEventListener("mousedown", function (e) { down = true; sx = e.pageX; sl = g.scrollLeft; g.style.scrollSnapType = "none"; g.style.cursor = "grabbing"; e.preventDefault(); });
    addEventListener("mouseup", function () { if (!down) return; down = false; g.style.scrollSnapType = ""; g.style.cursor = ""; });
    g.addEventListener("mousemove", function (e) { if (down) g.scrollLeft = sl - (e.pageX - sx); });
  });

  /* booking form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Session"], ["date", "Preferred date"], ["message", "Idea"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Session request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from swaynestudios.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
