/* Bendtsen's Bakery – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var nav = $(".nav"), burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 60); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (the HTML already holds the final number) */
  var count = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    if (reduce || isNaN(end)) return;
    var start = end > 1000 ? end - 120 : 0, t0 = Date.now(), dur = 1700;
    var tick = function () {
      var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = end;
    };
    tick();
  };

  /* reveal on scroll */
  var items = $$("[data-anim]");
  var show = function (el) { el.classList.add("in"); $$("[data-count]", el).forEach(count); };
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    /* hero plays on load, staggered */
    var heroItems = items.filter(function (el) { return el.closest(".hero,.p-hero"); });
    heroItems.forEach(function (el, i) {
      el.style.transitionDelay = (120 + i * 110) + "ms";
      setTimeout(function () { el.classList.add("in"); }, 30);
      setTimeout(function () { el.style.transitionDelay = ""; }, 2600);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [], idx = sib.indexOf(el);
        if (idx > 0) { el.style.transitionDelay = Math.min(idx * 80, 400) + "ms"; setTimeout(function () { el.style.transitionDelay = ""; }, 1800); }
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
        var off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.07;
        img.style.transform = "translateY(" + off.toFixed(1) + "px)";
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
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open / closed (Mon–Fri 6–5, Sat 6–4, Central time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60;
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1, close = wk ? 17 : d === "Sat" ? 16 : 0;
      if (close && h >= 6 && h < close) el.textContent = "Open now · until " + (close - 12) + " pm today";
      else el.textContent = "Closed now · Mon–Fri 6 am – 5 pm · Sat 6 am – 4 pm";
    } catch (e) {}
  });

  /* contact forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["topic", "Topic"], ["date", "Date needed"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
