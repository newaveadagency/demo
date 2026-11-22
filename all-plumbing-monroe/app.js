/* All Plumbing, Inc. – site script (no dependencies) */
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

  /* header shrinks on scroll; hero swoosh drifts (rAF + passive listener) */
  var sw = $(".swoosh"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (sw && !reduce && y < 900) sw.style.transform = "translate3d(" + (y * -0.12).toFixed(1) + "px," + (y * 0.18).toFixed(1) + "px,0)";
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – the real value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll with a small stagger between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        if (!el.closest(".hero-h, .page-hero h1")) el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: line-by-line mask reveal */
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* magnetic call buttons */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* office open / closed – Mon–Fri 7:30–16:45, Central time */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      el.textContent = wk && h >= 7.5 && h < 16.75 ? "Office open now · until 4:45 pm" : "Office closed now · 24-hour emergency service available";
    } catch (e) {}
  });

  /* service request form → prepared e-mail (or a call prompt while no address is set) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [], ok = $(".ok", fm);
      [["name", "Name"], ["phone", "Phone"], ["service", "Service needed"], ["address", "Address / town"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var mail = (fm.getAttribute("data-mail") || "").trim();
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Service request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the All Plumbing website");
        if (ok) { ok.textContent = "Your e-mail app should open with the request filled in. Just press send."; ok.style.display = "block"; }
      } else if (ok) {
        ok.innerHTML = "Thanks, " + String(f.get("name")).replace(/[<>&"]/g, "") + "! The fastest way to book is a quick call: <a href=\"tel:+13183226970\">(318) 322-6970</a>.";
        ok.style.display = "block";
      }
    });
  });
})();
