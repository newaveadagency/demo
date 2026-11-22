/* Affordable Appliance Repair – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o ? "true" : "false"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header + portrait parallax (rAF, passive scroll) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) im.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -0.08 - 14).toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    if (!end) return;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* SVG line drawing: measure length */
  $$(".draw").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });

  /* reveal on scroll with stagger */
  var items = $$("[data-anim]"), draws = $$(".draw");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    draws.forEach(function (d) { d.classList.add("drawn"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.classList.contains("draw")) { el.classList.add("drawn"); io.unobserve(el); return; }
        var sib = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.hasAttribute("data-anim"); }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
        setTimeout(function () { el.style.transitionDelay = ""; }, 1400);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    draws.forEach(function (d) { io.observe(d); });
    /* hero words pop in one after another */
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 120); });
  }

  /* magnetic buttons + playful card tilt */
  if (!reduce && hover) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(700px) rotateX(" + (-y * 8).toFixed(2) + "deg) rotateY(" + (x * 10).toFixed(2) + "deg) translateY(-6px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open now (Mon–Sat 8:00–17:00, Arizona time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, open = d !== "Sun" && h >= 8 && h < 17;
      el.textContent = open ? "Open now · until 5 pm today" : "Closed now · Mon–Sat 8 am – 5 pm";
      var dot = el.parentNode.querySelector(".dot"); if (dot && !open) dot.classList.add("closed");
    } catch (e) {}
  });

  /* year */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* service request → prepared email (or phone hint while no email is set) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [], clean = function (v) { return String(v || "").replace(/[<>&"]/g, ""); };
      [["name", "Name"], ["phone", "Phone"], ["city", "City"], ["appliance", "Appliance"], ["brand", "Brand"], ["model", "Model #"], ["message", "Problem"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail");
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Service request: " + f.get("appliance") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Affordable Appliance Repair website");
        if (ok) { ok.textContent = "Your email app is open with the request ready to send. Thank you!"; ok.style.display = "block"; }
      } else if (ok) {
        ok.innerHTML = "Thanks, " + clean(f.get("name")) + ". To book, call <a href=\"tel:+19284587299\">(928) 458-7299</a> and mention your " + clean(f.get("appliance")) + ".";
        ok.style.display = "block";
      }
    });
  });
})();
