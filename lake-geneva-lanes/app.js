/* Lake Geneva Lanes – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && window.matchMedia("(hover: hover)").matches;

  /* mobile menu */
  var nav = $(".nav"), burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* counters (HTML already holds the final number) */
  var count = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    if (reduce || isNaN(end)) return;
    var start = end > 1000 ? end - 60 : 0, t0 = Date.now(), dur = 1600;
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
    var heroItems = items.filter(function (el) { return el.closest(".hero,.p-hero"); });
    heroItems.forEach(function (el, i) {
      el.style.transitionDelay = (100 + i * 120) + "ms";
      setTimeout(function () { el.classList.add("in"); }, 30);
      setTimeout(function () { el.style.transitionDelay = ""; }, 2800);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [], idx = sib.indexOf(el);
        if (idx > 0) { el.style.transitionDelay = Math.min(idx * 80, 480) + "ms"; setTimeout(function () { el.style.transitionDelay = ""; }, 1900); }
        show(el); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { if (heroItems.indexOf(el) < 0) io.observe(el); });
  }

  /* scroll-driven effects: header, parallax, rolling ball, timeline line */
  var px = $$("[data-parallax]"), alley = $(".alley"), ball = alley && $(".ball", alley), tl = $("[data-timeline]"), fg = tl && $(".ln-fg", tl);
  if (fg) { fg.style.strokeDasharray = "1"; fg.style.strokeDashoffset = reduce ? "0" : "1"; }
  var ticking = false;
  var frame = function () {
    var vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", window.scrollY > 60);
    if (!reduce) {
      px.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var off = Math.max(Math.min((r.top + r.height / 2 - vh / 2) * -0.08, r.height * 0.14), -r.height * 0.14);
        img.style.transform = "translateY(" + off.toFixed(1) + "px)" + (img.closest(".story-photo") ? " scale(1.12)" : "");
      });
      if (ball) {
        var a = alley.getBoundingClientRect();
        var p = Math.min(Math.max((vh - a.top) / (vh * 0.75), 0), 1);
        var travel = a.width - 140;
        ball.style.transform = "translateX(" + (p * travel).toFixed(1) + "px) rotate(" + (p * 900).toFixed(0) + "deg)";
        alley.classList.toggle("strike", p > 0.97);
      }
      if (fg) {
        var t = tl.getBoundingClientRect();
        var q = Math.min(Math.max((vh * 0.75 - t.top) / t.height, 0), 1);
        fg.style.strokeDashoffset = (1 - q).toFixed(3);
      }
    }
    ticking = false;
  };
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener("resize", frame);
  frame();
  if (reduce && alley) alley.classList.add("strike");

  /* magnetic buttons + card tilt (pointer devices only) */
  if (!reduce && hover) {
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open now (Central time). Sun 10–22, Mon–Thu 12–23, Fri 12–24, Sat 10–24 */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday"));
    var h = (+g("hour") % 24) + g("minute") / 60;
    var H = [[10, 22], [12, 23], [12, 23], [12, 23], [12, 23], [12, 24], [10, 24]];
    var label = function (x) { return x === 24 ? "midnight" : x === 12 ? "noon" : (x > 12 ? x - 12 + " pm" : x + " am"); };
    var open = day > -1 && h >= H[day][0] && h < H[day][1];
    var txt = open ? "Open now · until " + label(H[day][1]) + " tonight" : (day > -1 && h < H[day][0] ? "Closed now · opens at " + label(H[day][0]) + " today" : "Closed now · opens at " + label(H[(day + 1) % 7][0]) + " tomorrow");
    if (day > -1) {
      $$("[data-open]").forEach(function (el) { el.textContent = txt; });
      $$("[data-dot]").forEach(function (el) { el.classList.toggle("open", open); });
      $$('tr[data-day="' + day + '"]').forEach(function (tr) { tr.classList.add("today"); });
    }
  } catch (e) {}

  /* forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["topic", "Topic"], ["date", "Date"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
