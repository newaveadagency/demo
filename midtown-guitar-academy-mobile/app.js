/* Midtown Guitar Academy – concept site script */
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

  /* header shrink + photo parallax (one rAF loop, passive scroll) */
  var photos = $$(".photo img"), ticking = false;
  function frame() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) photos.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect(), vh = innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = "scale(1.12) translateY(" + (p * -26).toFixed(1) + "px)";
    });
    ticking = false;
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* counters (the final number is already in the HTML) */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  /* guitar strings: strum once when drawn, pluck on hover */
  var strs = $$(".guitar .str");
  function pluck(s, delay) {
    setTimeout(function () { s.classList.remove("pluck"); void s.getBoundingClientRect(); s.classList.add("pluck"); }, delay || 0);
  }
  function strum() { if (!reduce) strs.forEach(function (s, i) { pluck(s, i * 60); }); }
  if (!reduce) {
    strs.forEach(function (s) { s.addEventListener("animationend", function () { s.classList.remove("pluck"); }); });
    var g = $(".guitar");
    if (g) g.addEventListener("pointermove", function (e) {
      var r = g.getBoundingClientRect(), yy = (e.clientY - r.top) / r.height * 300, xx = (e.clientX - r.left) / r.width * 600;
      if (xx < 200) return;
      strs.forEach(function (s, i) { var sy = 140.5 + i * 3.8; if (Math.abs(sy - yy) < 2.6 && !s.classList.contains("pluck")) pluck(s); });
    });
  }

  /* reveal on scroll, with a small stagger between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    $$("[data-count]").forEach(function (el) { el.dataset.done = 1; });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; });
        el.style.transitionDelay = Math.min(Math.max(0, sib.indexOf(el)), 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
        if (el.classList.contains("strings")) setTimeout(strum, 1500);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero lines rise one after another */
    $$(".hero h1 [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) {
      io.unobserve(el); el.style.transition = "transform .9s cubic-bezier(.2,.8,.2,1) " + (0.1 + i * 0.14) + "s";
      setTimeout(function () { el.classList.add("in"); }, 80);
    });
  }

  /* card tilt (pointer devices only) */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".card, .plan").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "translateY(-6px) perspective(800px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    /* magnetic primary buttons */
    $$(".btn-sun").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* FAQ accordion */
  $$(".qa button").forEach(function (b) {
    b.addEventListener("click", function () {
      var qa = b.parentNode, open = !qa.classList.contains("open");
      $$(".qa.open").forEach(function (o) { o.classList.remove("open"); $("button", o).setAttribute("aria-expanded", "false"); });
      if (open) { qa.classList.add("open"); b.setAttribute("aria-expanded", "true"); }
    });
  });

  /* lesson inquiry → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["instrument", "Instrument"], ["length", "Lesson length"], ["student", "Lessons are for"], ["message", "Experience & best days"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Lesson inquiry: " + (f.get("instrument") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
