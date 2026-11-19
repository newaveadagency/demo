/* Pierce Heating & Air Conditioning – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* reveal on scroll (+ staggered hero lines) */
  var anim = $$("[data-anim]");
  if (still || !("IntersectionObserver" in window)) anim.forEach(function (el) { el.classList.add("in"); });
  else {
    $$(".hero h1 .ln>span, .phero h1 .ln>span").forEach(function (el, i) { el.style.transitionDelay = (0.12 + i * 0.12) + "s"; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    anim.forEach(function (el) { io.observe(el); });
  }

  /* counters */
  var counters = $$("[data-count]");
  var run = function (el) {
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0), t0 = null, dur = 1600;
    var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if (!still && "IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* parallax on photos */
  var plx = $$(".plx");
  if (!still && plx.length) {
    var tick = false;
    var upd = function () {
      plx.forEach(function (img) { var r = img.parentNode.getBoundingClientRect(), vh = window.innerHeight; if (r.bottom < 0 || r.top > vh) return; var p = (r.top + r.height / 2 - vh / 2) / vh; img.style.transform = "scale(1.12) translateY(" + (p * -26).toFixed(1) + "px)"; });
      tick = false;
    };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  }

  /* magnetic call button */
  if (!still && window.matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* estimate form -> prepared email (falls back to phone if no address is set) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Service"], ["zip", "ZIP code"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail");
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Estimate request: " + f.get("service") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Pierce Heating & Air website");
        if (ok) { ok.textContent = "Your email app is open with your request ready to send. Thank you!"; ok.style.display = "block"; }
      } else if (ok) {
        ok.innerHTML = "Thanks, " + String(f.get("name")).replace(/[<>&"]/g, "") + ". To book your free estimate, call <a href=\"tel:+15024470987\">502-447-0987</a> and mention: " + String(f.get("service")).replace(/[<>&"]/g, "") + ".";
        ok.style.display = "block";
      }
    });
  });
})();
