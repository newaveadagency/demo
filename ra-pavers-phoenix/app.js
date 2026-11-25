/* R&A Pavers LLC – site script */
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

  /* reveal on scroll, with stagger for siblings (hero lines, pavers, cards) */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    items.forEach(function (el) {
      var p = el.parentElement, sib = p ? Array.prototype.filter.call(p.children, function (c) { return c.hasAttribute("data-anim"); }) : [];
      var i = sib.indexOf(el);
      if (el.closest(".pavers")) el.style.transitionDelay = (i * 0.045).toFixed(3) + "s";
      else if (el.closest(".hero h1")) el.style.transitionDelay = (0.15 + Array.prototype.indexOf.call(el.closest("h1").children, el.parentElement) * 0.14).toFixed(2) + "s";
      else if (i > 0) el.style.transitionDelay = Math.min(i * 0.09, 0.5).toFixed(2) + "s";
    });
    /* masked / clipped elements are observed through their visible wrapper */
    var host = function (el) {
      if (el.closest(".ln")) return el.closest(".ln");
      if (el.closest(".arc-head")) return el.closest(".arc-head");
      if (el.classList.contains("frame") || el.classList.contains("reveal")) return el.parentElement;
      return el;
    };
    var map = [];
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        map.forEach(function (m) { if (m[0] === e.target) m[1].classList.add("in"); });
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { var h = host(el); map.push([h, el]); io.observe(h); });
  }

  /* header shrinks on scroll + hero parallax (rAF, passive) */
  var nav = $(".nav"), par = $(".parallax"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset || 0;
    if (nav) nav.classList.toggle("small", y > 40);
    if (par && !reduce && y < window.innerHeight * 1.2) par.style.transform = "translate3d(0," + (-y * 0.12).toFixed(1) + "px,0)";
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* magnetic buttons */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* gallery lightbox */
  var lb = $(".lb");
  if (lb) {
    var lbImg = $("img", lb), last = null;
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    $$(".gal button").forEach(function (b) {
      b.addEventListener("click", function () {
        var im = $("img", b); last = b;
        lbImg.src = b.getAttribute("data-full"); lbImg.alt = im ? im.alt : "";
        lb.classList.add("open"); $("button", lb).focus();
      });
    });
    $("button", lb).addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) close(); });
  }

  /* quote form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["city", "City"], ["service", "Service"], ["message", "Project details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Quote request: " + (f.get("service") || "Project") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the R&A Pavers website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
