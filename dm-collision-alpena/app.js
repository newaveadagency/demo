/* D&M Collision – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* hero headline: masked line rise */
  $$(".split").forEach(function (h) { if (!reduce) h.classList.add("go"); });

  /* shrinking header + hero parallax (rAF, passive scroll) */
  var nav = $(".nav"), par = $("[data-par] img"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset || 0;
    if (nav) nav.classList.toggle("small", y > 40);
    if (par && !reduce && y < 1200) par.style.transform = "translate3d(0," + (y * 0.12 - 30) + "px,0)";
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* counters */
  function count(el) {
    var to = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    if (reduce) { el.textContent = to; return; }
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  /* scroll reveal */
  var targets = $$("[data-anim]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in"); io.unobserve(e.target);
        $$("[data-count]", e.target).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  } else targets.forEach(function (el) { el.classList.add("in"); });

  /* magnetic buttons + tilt photo (fine pointers only) */
  if (!reduce && window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (t) {
      t.addEventListener("mousemove", function (e) { var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; t.style.transform = "perspective(900px) rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg)"; });
      t.addEventListener("mouseleave", function () { t.style.transform = ""; });
    });
  }

  /* FAQ: one open at a time */
  var qs = $$(".qs details");
  qs.forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) qs.forEach(function (o) { if (o !== d) o.open = false; }); }); });

  /* estimate form: prepared email, or a call-ready message while no address is set */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["vehicle", "Vehicle"], ["service", "Service"], ["message", "What happened"], ["loaner", "Needs a loaner car"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = (fm.getAttribute("data-mail") || "").trim();
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Estimate request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app is open with your request ready to send. Thank you!"; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "";
        var p = document.createElement("p"); p.textContent = "Thanks, " + f.get("name") + ". The quickest way to set up your free estimate is a call:"; ok.appendChild(p);
        var a = document.createElement("a"); a.href = "tel:+19893564867"; a.textContent = "Call 989-356-4867"; ok.appendChild(a);
        ok.style.display = "block";
      }
    });
  });
})();
