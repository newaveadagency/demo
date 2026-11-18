/* Ashton Funeral Home – site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onScrollHeader = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };

  /* reveal on scroll (fade-up, line masks, clip-path masks, svg drawing) */
  var revealAll = function () { $$("[data-anim], .leaf").forEach(function (el) { el.classList.add("in"); }); };
  if (reduce || !("IntersectionObserver" in window)) revealAll();
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    /* headline lines sit inside overflow:hidden masks, so they start on load instead of via the observer */
    $$("[data-anim]").forEach(function (el) { if (el.getAttribute("data-anim") !== "line") io.observe(el); });
    $$(".leaf").forEach(function (el) { io.observe(el); });
    setTimeout(function () { $$("[data-anim=line], .hero [data-anim]").forEach(function (el) { el.classList.add("in"); }); }, 60);
  }

  /* count-up numbers */
  var runCount = function (el) {
    var to = parseInt(el.getAttribute("data-count"), 10), from = parseInt(el.getAttribute("data-from") || "0", 10);
    if (el.hasAttribute("data-since")) to = new Date().getFullYear() - parseInt(el.getAttribute("data-since"), 10);
    if (isNaN(to)) return;
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 2200;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else counters.forEach(runCount);

  /* slow parallax on framed photos + timeline line drawing */
  var px = $$("[data-parallax]");
  var tl = $(".tl-line line"), tlBox = $(".timeline");
  var ticking = false;
  var frame = function () {
    ticking = false;
    onScrollHeader();
    if (reduce) return;
    var vh = window.innerHeight;
    px.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var k = parseFloat(img.getAttribute("data-parallax")) || 0.08;
      var c = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = "translate3d(0," + (-8 + c * k * -100).toFixed(2) + "%,0)";
    });
    if (tl && tlBox) {
      var b = tlBox.getBoundingClientRect(), len = b.height;
      var p = Math.min(Math.max((vh * 0.7 - b.top) / len, 0), 1);
      tl.setAttribute("y2", (len * p).toFixed(1));
    }
  };
  var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", req, { passive: true });
  frame();
  if (tl && reduce && tlBox) tl.setAttribute("y2", tlBox.getBoundingClientRect().height);

  /* tabs (services page checklist) */
  $$("[role=tablist]").forEach(function (list) {
    var tabs = $$("[role=tab]", list);
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", on);
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
      });
    });
  });

  /* contact / planning forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["topic", "Regarding"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent((f.get("topic") || "Message") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from ashtonfuneralhome.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
