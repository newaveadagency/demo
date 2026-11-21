/* Jacobs Meat Market – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var nav = $(".nav"), burger = $(".burger"), menu = $(".menu");
  var setNavH = function () { if (nav) document.documentElement.style.setProperty("--navh", nav.offsetHeight + "px"); };
  setNavH(); window.addEventListener("resize", setNavH);
  if (burger && menu) {
    burger.addEventListener("click", function () {
      setNavH();
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 60); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final number is already in the HTML) */
  var count = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    if (reduce || isNaN(end)) return;
    var start = end > 1000 ? end - 80 : 0, t0 = Date.now(), dur = 1800;
    var tick = function () {
      var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = end;
    };
    tick();
  };

  /* SVG line drawing: measure path length */
  $$('[data-anim="draw"]').forEach(function (svg) {
    var p = $("path", svg);
    if (p && p.getTotalLength) { try { svg.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} }
  });

  /* reveal on scroll */
  var items = $$("[data-anim]");
  var show = function (el) { el.classList.add("in"); $$("[data-count]", el).forEach(count); };
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var heroItems = items.filter(function (el) { return el.closest(".hero,.p-hero"); });
    heroItems.forEach(function (el, i) {
      el.style.transitionDelay = (100 + i * 120) + "ms";
      setTimeout(function () { el.classList.add("in"); }, 40);
      setTimeout(function () { el.style.transitionDelay = ""; }, 3000);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [], idx = sib.indexOf(el);
        if (idx > 0) { el.style.transitionDelay = Math.min(idx * 90, 450) + "ms"; setTimeout(function () { el.style.transitionDelay = ""; }, 2000); }
        show(el); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { if (heroItems.indexOf(el) < 0) io.observe(el); });
  }

  /* parallax photos */
  var px = $$("[data-parallax]");
  if (px.length && !reduce) {
    var ticking = false;
    var move = function () {
      px.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.04;
        img.style.transform = "translateY(" + off.toFixed(1) + "px) scale(1.16)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* magnetic buttons (pointer devices only) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open / closed – Mon–Sat 8 am to 6 pm, Central time */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday"));
    var h = (+g("hour") % 24) + g("minute") / 60;
    var open = day > 0 && h >= 8 && h < 18;
    $$("[data-open]").forEach(function (el) {
      el.textContent = open ? "Open now · until 6 pm today" : "Closed now · Mon–Sat 8 am – 6 pm";
      var dot = el.previousElementSibling; if (dot && dot.classList.contains("dot")) dot.classList.toggle("off", !open);
    });
    $$(".hours tr[data-day]").forEach(function (tr) { if (+tr.getAttribute("data-day") === day) tr.classList.add("today"); });
  } catch (e) {}

  /* order form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["topic", "Order"], ["date", "Pick-up date"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Order") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
