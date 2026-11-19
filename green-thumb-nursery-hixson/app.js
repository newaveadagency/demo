/* Green Thumb Nursery – demo interactions */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header: shrink on scroll + mobile menu */
  var hdr = $(".hdr");
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle("small", window.scrollY > 30); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    var mb = $(".menu-btn", hdr);
    if (mb) mb.addEventListener("click", function () {
      var o = hdr.classList.toggle("open");
      mb.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$(".nav a", hdr).forEach(function (a) { a.addEventListener("click", function () { hdr.classList.remove("open"); }); });
  }

  /* SVG line drawing: measure path lengths */
  $$('[data-anim="draw"] path').forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
  });

  /* counters */
  function count(el) {
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0);
    if (reduce || !to) { el.textContent = to; return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* reveal on scroll */
  var items = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { count(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* parallax images (rAF, passive scroll) */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var update = function () {
      var vh = window.innerHeight;
      par.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = "translate3d(0," + (p * -40).toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* tilt cards */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* question form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["interest", "Interested in"], ["message", "Message"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("interest") || "Question") + " – " + f.get("name")) +
        "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Green Thumb Nursery website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
