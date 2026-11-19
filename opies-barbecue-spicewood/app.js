/* Opie's Barbecue – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters */
  var count = function (el) {
    var end = +el.getAttribute("data-count"), start = end > 100 ? end - 60 : 0, t0 = null, dur = 1400;
    if (reduce) { el.textContent = end; return; }
    var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  /* SVG rope drawing */
  $$("[data-draw]").forEach(function (p) {
    try { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = reduce ? 0 : L; p.style.transition = "stroke-dashoffset 1.8s ease"; } catch (e) {}
  });

  /* reveal on scroll */
  var reveal = function (el) {
    el.classList.add("in");
    if (el.hasAttribute("data-count")) count(el);
    $$("[data-count]", el).forEach(count);
  };
  /* hero lines sit inside overflow:hidden masks, so IntersectionObserver never sees them: reveal on load */
  var lines = $$('[data-anim="line"]');
  requestAnimationFrame(function () { setTimeout(function () { lines.forEach(function (el) { el.classList.add("in"); }); }, 120); });
  var targets = $$("[data-anim]").filter(function (el) { return lines.indexOf(el) < 0; }).concat($$("[data-draw]"), $$(".tally [data-count]").filter(function (e) { return !e.closest("[data-anim]"); }));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (e.target.hasAttribute("data-draw")) e.target.style.strokeDashoffset = 0; else reveal(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    $$("[data-anim]").forEach(function (el) { el.classList.add("in"); });
  }

  /* parallax */
  var px = $$("[data-parallax]");
  if (px.length && !reduce) {
    var ticking = false;
    var run = function () {
      px.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        img.style.transform = "translate3d(0," + (-r.top * +img.getAttribute("data-parallax")) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* card tilt */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open / closed (Central time): Mon–Thu 11–16, Fri–Sat 11–19, Sun 11–17 */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var close = [17, 16, 16, 16, 16, 19, 19][day], label = { 16: "4 pm", 17: "5 pm", 19: "7 pm" };
    var open = h >= 11 && h < close;
    $$("[data-open]").forEach(function (el) {
      el.textContent = open ? "Open now until " + label[close] + " · or until the meat runs out" : (h < 11 ? "Opening today at 11 am · Call (830) 693-8660" : "Closed for today · We open at 11 am");
    });
    $$("[data-open-dot]").forEach(function (d) { d.classList.toggle("off", !open); });
    $$("[data-hours] tr").forEach(function (tr) { if (tr.getAttribute("data-days").split(",").indexOf(String(day)) > -1) tr.classList.add("today"); });
  } catch (e) {}

  /* menu page jump-link highlight */
  var jl = $$(".jump a");
  if (jl.length && "IntersectionObserver" in window) {
    var jo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) jl.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    jl.forEach(function (a) { var t = $(a.getAttribute("href")); if (t) jo.observe(t); });
  }

  /* catering form → prepared email (falls back to Opie's official request form if no address is set) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["company", "Company"], ["phone", "Phone"], ["email", "Email"], ["date", "Event date"], ["time", "Event time"], ["guests", "Estimated guests"], ["service", "Service"], ["address", "Event address"], ["message", "Event details / menu"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm);
      if (fm.dataset.mail) {
        location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Catering request – " + f.get("name") + (f.get("date") ? " – " + f.get("date") : "")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from opiesbarbecue.com");
        if (ok) ok.style.display = "block";
      } else {
        if (ok) { ok.textContent = "Opening Opie's catering request form in a new tab. You can also call (830) 693-8660."; ok.style.display = "block"; }
        window.open(fm.dataset.fallback || "https://form.jotform.com/252785465602059", "_blank", "noopener");
      }
    });
  });
})();
