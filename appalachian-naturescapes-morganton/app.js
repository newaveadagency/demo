/* Appalachian Naturescapes – site script (demo redesign) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* creek lines: prepare stroke for scroll drawing */
  var creeks = $$("path[data-draw]").map(function (p) {
    var len = 0; try { len = p.getTotalLength(); } catch (e) {}
    if (!len || reduce) return null;
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    return { p: p, len: len, box: p.closest(".sec") || p.parentNode };
  }).filter(Boolean);

  /* scroll: shrinking header, mountain ridge parallax, creek drawing (one rAF, passive listener) */
  var ridges = $$(".ridge[data-depth]"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 50);
      if (!reduce) {
        ridges.forEach(function (r) { if (y < vh * 1.5) r.style.transform = "translate3d(0," + (y * +r.getAttribute("data-depth")).toFixed(1) + "px,0)"; });
        creeks.forEach(function (c) {
          var b = c.box.getBoundingClientRect(), prog = (vh - b.top) / (b.height + vh * 0.4);
          prog = Math.max(0, Math.min(1, prog));
          c.p.style.strokeDashoffset = (c.len * (1 - prog)).toFixed(1);
        });
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – final value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$("h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* playful tilt on cards (hover devices only) */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".blob").forEach(function (b) {
      var wrap = b.parentNode;
      wrap.addEventListener("mousemove", function (e) { var r = wrap.getBoundingClientRect(); b.style.transform = "rotateY(" + ((e.clientX - r.left) / r.width - .5) * 8 + "deg) rotateX(" + -((e.clientY - r.top) / r.height - .5) * 8 + "deg)"; });
      wrap.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* FAQ: keep one open at a time */
  $$(".faq details").forEach(function (d, _, all) {
    d.addEventListener("toggle", function () { if (d.open) $$(".faq details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* consultation form -> prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["town", "Town"], ["service", "Interested in"], ["message", "About the property"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Consultation request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from appalachiannaturescapes.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
