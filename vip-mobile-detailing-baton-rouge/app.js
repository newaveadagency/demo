/* V.I.P Mobile Detailing L.L.C. – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* scroll: shrinking header + hero image parallax (rAF, passive) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (-(1 - r.bottom / (innerHeight + r.height)) * r.height * 0.15).toFixed(1) + "px,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters: final value is already in the HTML */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
        if (el.hasAttribute("data-count")) count(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 140); });
  }

  /* magnetic buttons (desktop pointer only) */
  if (!reduce && fine) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* build your detail: adds up the listed prices */
  var bld = $(".builder");
  if (bld) {
    var sum = $(".sum", bld), list = $(".picked", bld), wax = $(".wax-opt", bld), shown = 285;
    var calc = function () {
      var total = 0, names = [], base = $("input[name=base]:checked", bld);
      var hasWax = base && base.hasAttribute("data-wax");
      if (wax) { wax.classList.toggle("off", !!hasWax); if (hasWax) $("input", wax).checked = false; }
      if (base && +base.value) { total += +base.value; names.push(base.getAttribute("data-name")); }
      $$("input[type=checkbox]:checked", bld).forEach(function (c) { total += +c.value; names.push(c.getAttribute("data-name")); });
      list.innerHTML = names.length ? names.map(function (n) { return "<li>" + n + "</li>"; }).join("") : "<li>Pick a service</li>";
      if (reduce) { sum.textContent = total; shown = total; return; }
      var from = shown, t0 = null;
      (function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 450, 1); sum.textContent = Math.round(from + (total - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(performance.now());
      shown = total;
    };
    bld.addEventListener("change", calc); calc();
  }

  /* request form: email if an address is set, otherwise a summary to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["town", "Town"], ["vehicle", "Vehicle"], ["service", "Service"], ["message", "Where and when"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Detail request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Faster: call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Call V.I.P at " + tel + " with this:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
