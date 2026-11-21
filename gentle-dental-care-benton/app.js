/* Gentle Dental Care, Benton KY – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrink, hero parallax, timeline progress (one rAF on a passive listener) */
  var plx = $(".plx"), steps = $(".steps"), prog = steps ? $(".prog", steps) : null, ticking = false;
  function frame() {
    var y = window.scrollY || 0, vh = innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (plx && !reduce) {
      var r = plx.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) plx.style.transform = "translate3d(0," + (-(1 - r.bottom / (vh + r.height)) * 60).toFixed(1) + "px,0)";
    }
    if (prog) {
      var s = steps.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh * 0.75 - s.top) / s.height));
      prog.style.strokeDashoffset = reduce ? 0 : (1 - p).toFixed(3);
    }
    ticking = false;
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener("resize", frame);
  frame();

  /* reveal on scroll with a stagger between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.hasAttribute("data-anim"); }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* headline lines rise one after another on load; logo tooth draws itself */
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
    $$(".tooth-path[data-anim]").forEach(function (el) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 200); });
  }

  if (!reduce && hover) {
    /* cursor spotlight on glass cards */
    $$(".spot").forEach(function (c) {
      c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--x", (e.clientX - r.left) + "px"); c.style.setProperty("--y", (e.clientY - r.top) + "px"); });
    });
    /* glow that follows the cursor in the hero */
    var hero = $(".hero");
    if (hero) hero.addEventListener("pointermove", function (e) { var r = hero.getBoundingClientRect(); hero.style.setProperty("--mx", (e.clientX - r.left) + "px"); hero.style.setProperty("--my", (e.clientY - r.top) + "px"); });
    /* gentle 3D tilt on service cards */
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        if (!c.classList.contains("in")) return;
        var r = c.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        c.style.transition = "transform .15s";
        c.style.transform = "perspective(800px) rotateX(" + (-dy * 6).toFixed(2) + "deg) rotateY(" + (dx * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transition = ""; c.style.transform = ""; });
    });
    /* magnetic buttons */
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* only one FAQ open at a time */
  var faqs = $$(".faq details");
  faqs.forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; }); }); });

  /* appointment form -> prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["patient", "Patient"], ["service", "Interested in"], ["message", "Preferred time / notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      if (fm.dataset.mail) location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Appointment request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Gentle Dental Care website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
