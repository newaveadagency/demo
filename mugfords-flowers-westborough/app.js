/* Mugford's Flowers – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header */
  var nav = $(".nav");
  var onScrollNav = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScrollNav, { passive: true }); onScrollNav();

  /* reveal on scroll (hero words get a staggered pop) */
  var anims = $$("[data-anim]");
  $$(".hero [data-anim]").forEach(function (el, i) { el.style.transitionDelay = (i * 0.09) + "s"; });
  $$(".svc-grid [data-anim], .pk-grid [data-anim], .steps [data-anim], .phero .row [data-anim]").forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 0.08) + "s"; });
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    anims.forEach(function (el) { io.observe(el); });
  } else anims.forEach(function (el) { el.classList.add("in"); });

  /* counters */
  var counters = $$("[data-count]");
  var runCount = function (el) {
    var end = +el.getAttribute("data-count"), t0 = null;
    var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* parallax on hero photos */
  var par = $$("[data-par]");
  if (!reduce && par.length) {
    var ticking = false;
    var upd = function () { var y = window.scrollY; par.forEach(function (el) { el.style.transform = "translate3d(0," + (y * +el.getAttribute("data-par")).toFixed(1) + "px,0)"; }); ticking = false; };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  }

  /* reviews slider buttons */
  var track = $(".reviews .track");
  $$("[data-rv]").forEach(function (b) {
    b.addEventListener("click", function () { if (!track) return; var card = $(".quote", track); var w = card ? card.offsetWidth + 22 : 400; track.scrollBy({ left: w * +b.getAttribute("data-rv"), behavior: reduce ? "auto" : "smooth" }); });
  });

  /* gallery filter */
  var filters = $$(".filters button");
  filters.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      filters.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$("#gal figure").forEach(function (fig) {
        var show = f === "all" || fig.getAttribute("data-cat") === f;
        fig.classList.toggle("hide", !show);
        if (show) fig.classList.add("in");
      });
    });
  });

  /* lightbox */
  var lb = $(".lb");
  if (lb) {
    var lbImg = $("img", lb), lbBtn = $("button", lb), last = null;
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    $$("[data-full]").forEach(function (b) {
      b.addEventListener("click", function () { last = b; lbImg.src = b.getAttribute("data-full"); lbImg.alt = $("img", b).alt; lb.classList.add("open"); lbBtn.focus(); });
    });
    lbBtn.addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) close(); });
  }

  /* forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["occasion", "Occasion"], ["date", "Date"], ["venue", "Venue"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent((f.get("occasion") || "Flower inquiry") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from mugfordsflowers.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
