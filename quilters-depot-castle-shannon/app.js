/* Quilters Depot – site script */
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

  /* header shrinks on scroll + hero photo parallax (rAF, passive) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "scale(1.08) translate3d(0," + (r.top * -0.08).toFixed(1) + "px,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* quilt blocks pop in one by one (diagonal order) */
  $$(".quilt span").forEach(function (s, i) { s.style.transitionDelay = (0.5 + ((i % 4) + Math.floor(i / 4)) * 0.09).toFixed(2) + "s"; });

  /* reveal on scroll with stagger between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (!el.style.transitionDelay) {
          var sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
          el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        }
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* headline words, one after another */
    $$("h1 [data-anim='word']").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 100 + i * 110); });
  }

  /* open / closed now (Tue–Fri 10–17, Sat 9–15, Eastern) + today's row */
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], now = null;
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    now = { d: DAYS.indexOf(g("weekday")), h: (+g("hour") % 24) + g("minute") / 60 };
  } catch (e) {}
  if (now && now.d > -1) {
    var hrs = { 2: [10, 17], 3: [10, 17], 4: [10, 17], 5: [10, 17], 6: [9, 15] }, cur = hrs[now.d], open = !!(cur && now.h >= cur[0] && now.h < cur[1]);
    $$("[data-open]").forEach(function (el) {
      if (open) { el.textContent = "Open now · until " + (cur[1] - 12) + "pm today"; return; }
      for (var k = 0; k < 8; k++) {
        var d = (now.d + k) % 7;
        if (hrs[d] && (k > 0 || now.h < hrs[d][0])) { el.textContent = "Closed now · opens " + (k === 0 ? "today" : DAYS[d]) + " at " + hrs[d][0] + "am"; break; }
      }
    });
    $$("[data-status]").forEach(function (el) { el.classList.toggle("open", open); });
    $$("[data-hours] tr").forEach(function (tr) { if ((tr.getAttribute("data-d") || "").split(",").indexOf(String(now.d)) > -1) tr.classList.add("today"); });
  }

  /* longarm estimate */
  var calc = $("[data-calc]");
  if (calc) {
    var upd = function () {
      var w = Math.max(0, +$("#w", calc).value || 0), h = Math.max(0, +$("#h", calc).value || 0), r = +$("#st", calc).value, t = +$("#th", calc).value, sq = w * h, tot = sq * r + (sq ? t : 0);
      $("[data-out]", calc).innerHTML = "<b>$" + tot.toFixed(2) + "</b>" + sq.toLocaleString("en-US") + " sq in · basic quilting before binding" + (Math.min(w, h) >= 104 ? "<br>Note: quilts must be smaller than 104\" on one side." : "");
    };
    $$("input,select", calc).forEach(function (el) { el.addEventListener("input", upd); el.addEventListener("change", upd); });
    upd();
  }

  /* forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["topic", "Topic"], ["size", "Quilt size"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((fm.dataset.subject || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from quiltersdepotpa.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
