/* Manual Physical Therapy, Inc. – site script */
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
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 24); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* SVG line length for draw animation */
  $$('[data-anim="draw"] path').forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 2); } catch (e) {}
  });

  /* counters */
  function count(el) {
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0);
    if (reduce || isNaN(to)) { el.textContent = to; return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = from;
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = to; }, dur + 400); /* safety net if rAF is throttled */
  }

  /* reveal on scroll */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    $$("[data-count]").forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) {
      /* hero headline lines sit inside overflow:hidden masks, so the observer never sees them: reveal on load */
      if (el.parentNode && el.parentNode.classList && el.parentNode.classList.contains("ln")) { setTimeout(function () { el.classList.add("in"); }, 120); }
      else io.observe(el);
    });
  }

  /* gentle parallax on hero photo */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var move = function () {
      par.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var y = Math.max(-12, Math.min(12, (r.top + r.height / 2 - window.innerHeight / 2) * -0.05));
        img.style.transform = "scale(1.12) translate3d(0," + y.toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* appointment request -> prepared email to the chosen clinic */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [], clinic = f.get("clinic") || "Wilson";
      var to = clinic === "Rocky Mount" && fm.dataset.mail2 ? fm.dataset.mail2 : fm.dataset.mail;
      [["clinic", "Clinic"], ["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Interested in"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Appointment request (" + clinic + ") – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from manualptinc.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
