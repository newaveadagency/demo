/* Dječji vrtić Nemo – demo redizajn */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header */
  var nav = $(".nav"), ticking = false;
  function onScroll() { if (nav) nav.classList.toggle("small", window.scrollY > 30); ticking = false; }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* counters */
  function count(el) {
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0);
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  /* reveal on scroll */
  var targets = $$("[data-anim]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        t.classList.add("in");
        if (t.hasAttribute("data-d")) t.addEventListener("transitionend", function h() { t.classList.add("done"); t.removeEventListener("transitionend", h); });
        $$("[data-count]", e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
  }

  /* magnetic button */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* gallery filter */
  var tabs = $$(".tabs button");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var f = t.getAttribute("data-f");
      tabs.forEach(function (x) { x.setAttribute("aria-pressed", x === t ? "true" : "false"); });
      $$(".gal figure").forEach(function (fg) {
        var show = f === "sve" || fg.getAttribute("data-grp") === f;
        fg.hidden = !show;
        if (show) fg.classList.add("in");
      });
    });
  });

  /* enquiry forms -> prepared e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-pošta"], ["topic", "Tema"], ["age", "Dijete"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent((f.get("topic") || "Upit") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice vrtic-nemo.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
