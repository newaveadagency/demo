/* Guarantee Roofing & Sheet Metal – site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* year */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* counters */
  function count(el) {
    var end = parseInt(el.getAttribute("data-count"), 10); if (isNaN(end)) return;
    if (reduce) { el.textContent = end; return; }
    var start = end > 1000 ? end - 46 : 0, t0 = null, dur = 1800;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* reveal on scroll */
  var items = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
    /* hero lines start right away */
    setTimeout(function () { $$(".hero [data-anim], .phero [data-anim]").forEach(function (el) { el.classList.add("in"); }); }, 80);
  }

  /* parallax (rAF, passive scroll) */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var run = function () {
      var vh = window.innerHeight;
      par.forEach(function (img) {
        var box = img.parentElement.getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        var k = parseFloat(img.getAttribute("data-parallax")) || 0.1;
        var off = (box.top + box.height / 2 - vh / 2) * -k;
        img.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    window.addEventListener("resize", run); run();
  }

  /* magnetic buttons (pointer devices only) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".btn-red").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* accordion: one open at a time */
  $$(".acc details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".acc details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* project request form -> prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["company", "Company / building"], ["phone", "Phone"], ["email", "Email"], ["town", "Town"], ["service", "I need"], ["message", "About the project"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + (fm.getAttribute("data-mail") || "") + "?subject=" + encodeURIComponent("Project review – " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Guarantee Roofing website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
