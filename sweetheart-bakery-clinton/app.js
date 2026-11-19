/* Sweetheart Bakery & Homer's Deli – site script */
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
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); });
    });
  }

  /* header shrinks on scroll (with hysteresis, the ribbon hides) */
  var onScroll = function () {
    if (!nav) return;
    var y = window.scrollY;
    if (y > 140) nav.classList.add("small"); else if (y < 30) nav.classList.remove("small");
  };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (HTML already holds the final number) */
  var count = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    if (reduce || isNaN(end)) return;
    var start = end > 1000 ? end - 75 : 0, t0 = Date.now(), dur = 1600;
    var tick = function () {
      var p = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = end;
    };
    tick();
  };

  /* reveal: hero words pop in on load, everything else on scroll */
  var items = $$("[data-anim]");
  var show = function (el) { el.classList.add("in"); $$("[data-count]", el).forEach(count); };
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var heroItems = items.filter(function (el) { return el.closest(".hero,.p-hero"); });
    heroItems.forEach(function (el, i) {
      el.style.transitionDelay = (80 + i * 90) + "ms";
      setTimeout(function () { el.classList.add("in"); }, 30);
      setTimeout(function () { el.style.transitionDelay = ""; }, 3000);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [], idx = sib.indexOf(el);
        if (idx > 0) { el.style.transitionDelay = Math.min(idx * 70, 420) + "ms"; setTimeout(function () { el.style.transitionDelay = ""; }, 1800); }
        show(el);
        $$("[data-anim]", el).forEach(function (c) { if (c.closest(".draw") === c) show(c); });
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { if (heroItems.indexOf(el) < 0) io.observe(el); });
  }

  /* parallax photos inside blobs and frames */
  var px = $$("[data-parallax]");
  if (px.length && !reduce) {
    var ticking = false;
    var move = function () {
      px.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.06;
        img.style.transform = "translateY(" + off.toFixed(1) + "px) scale(1.1)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* playful hover: magnetic buttons and tilting cards (pointer devices only) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    /* sprinkles drift away from the cursor in the hero */
    $$(".hero-art").forEach(function (art) {
      var sp = $$(".sprinkle", art);
      art.addEventListener("mousemove", function (e) {
        var r = art.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        sp.forEach(function (s, i) { var k = (i % 2 ? 1 : -1) * (10 + i * 4); s.style.translate = (x * k).toFixed(1) + "px " + (y * k).toFixed(1) + "px"; });
      });
      art.addEventListener("mouseleave", function () { sp.forEach(function (s) { s.style.translate = ""; }); });
    });
  }

  /* open / closed now (Central time) */
  var hours = {
    bakery: { 2: [6, 18], 3: [6, 18], 4: [6, 18], 5: [6, 18], 6: [6, 14] },
    deli: { 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [8, 14] }
  };
  var now = null;
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    now = { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h: (+g("hour") % 24) + g("minute") / 60 };
  } catch (e) {}
  var fmt = function (h) { return (h > 12 ? h - 12 : h) + (h >= 12 ? " pm" : " am"); };
  if (now) {
    $$("[data-open]").forEach(function (el) {
      var key = el.getAttribute("data-open"), t = hours[key] && hours[key][now.d], name = key === "deli" ? "Deli" : "Bakery";
      var open = t && now.h >= t[0] && now.h < t[1];
      el.textContent = open ? name + " open now · until " + fmt(t[1]) : name + " closed now · " + (key === "deli" ? "Mon–Fri 8 am–7 pm · Sat 8 am–2 pm" : "Tue–Fri 6 am–6 pm · Sat 6 am–2 pm");
      var dot = el.parentElement && $("[data-open-dot]", el.parentElement);
      if (dot) dot.classList.toggle("off", !open);
    });
    $$("[data-hours] tr").forEach(function (tr) { if (+tr.getAttribute("data-day") === now.d) tr.classList.add("today"); });
  }

  /* forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["topic", "Topic"], ["date", "Date needed"], ["flavor", "Flavor"], ["filling", "Filling"], ["size", "Size"], ["message", "Message"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
