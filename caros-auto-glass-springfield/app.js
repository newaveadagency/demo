/* Caro's Auto Glass – site script (no libraries) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + hero photo parallax (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce && y < 900) plx.style.transform = "translate3d(0," + (y * 0.08).toFixed(1) + "px,0) scale(1.08)";
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* shattered-glass lines draw out from the impact point */
  $$("[data-crack]").forEach(function (svg) {
    if (reduce) return;
    $$("path", svg).forEach(function (p, i) {
      var l = 600; try { l = Math.ceil(p.getTotalLength()) + 2; } catch (e) {}
      p.style.setProperty("--len", l);
      p.style.transitionDelay = (i < 13 ? i * 0.05 : 0.7 + (i - 13) * 0.03) + "s";
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { svg.classList.add("go"); }); });
  });

  /* counters (final value already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings; hero lines run on load */
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
        el.addEventListener("transitionend", function () { el.style.transitionDelay = ""; }, { once: true });
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero h1 [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 200 + i * 160); });
  }

  /* magnetic buttons + soft card tilt */
  if (!reduce && hover) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* FAQ: keep one open */
  $$(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".faq details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* open now (Mon–Fri 8–17, Springfield MO = America/Chicago) */
  var openEl = $("[data-open]");
  if (openEl) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var get = function (t) { var f = parts.filter(function (p) { return p.type === t; })[0]; return f ? f.value : ""; };
      var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), h = (+get("hour") % 24) + (+get("minute")) / 60;
      var open = day >= 1 && day <= 5 && h >= 8 && h < 17;
      openEl.classList.toggle("yes", open);
      $("span", openEl).textContent = open ? "Open now · until 5 PM" : "Closed now · text the cell to book";
      var row = $('tr[data-day="' + day + '"]'); if (row) row.classList.add("today");
    } catch (e) {}
  }

  /* quote form: prepared e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [], mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      [["name", "Name"], ["phone", "Phone"], ["vehicle", "Vehicle"], ["service", "Service"], ["where", "Vehicle location"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm);
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Quote request: " + f.get("service") + " – " + f.get("vehicle")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your e-mail app should open with the request ready to send. In a hurry? Call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks! Please call " + tel + " with these details:\n" + body.join("\n");
        ok.style.whiteSpace = "pre-line"; ok.style.display = "block";
      }
    });
  });
})();
