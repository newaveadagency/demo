/* Trent's Trick Upholstery – concept site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px");
      var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o);
    });
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
        if (r.bottom > 0 && r.top < innerHeight) {
          var p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
          plx.style.transform = "translate3d(0," + ((p - 0.5) * 0.16 * r.height).toFixed(1) + "px,0)";
        }
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* counters – the final value is already in the HTML */
  function count(el) {
    var end = parseFloat(el.getAttribute("data-count")), dec = +(el.getAttribute("data-dec") || 0);
    var start = end > 1000 ? end - 30 : 0, t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (start + (end - start) * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; });
        if (!el.classList.contains("stitch") && !el.classList.contains("tl-line"))
          el.style.transitionDelay = Math.min(Math.max(0, sib.indexOf(el)), 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        if (el.hasAttribute("data-count")) count(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) {
      io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 170);
    });
  }

  /* magnetic buttons + review card tilt (fine pointers only) */
  if (!reduce && fine) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* FAQ: keep one answer open at a time */
  $$(".acc details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".acc details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* open / closed by Baltimore, OH time (Eastern), hours from the Google listing */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var H = { 1: [9, 21], 2: [9, 17.5], 3: [9, 21], 4: [9, 17.5], 5: [9, 15.5], 6: [9.5, 17.5] };
    var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var fmt = function (x) { var hh = Math.floor(x), mm = x % 1 ? ":30" : ":00"; return (hh > 12 ? hh - 12 : hh) + mm + (hh >= 12 ? " PM" : " AM"); };
    var today = H[day], isOpen = today && h >= today[0] && h < today[1], txt;
    if (isOpen) txt = "Open now · until " + fmt(today[1]);
    else if (today && h < today[0]) txt = "Closed · opens today " + fmt(today[0]);
    else if (day === 0) txt = "Sunday · call ahead";
    else { var n = (day + 1) % 7; while (!H[n]) n = (n + 1) % 7; txt = "Closed · opens " + names[n] + " " + fmt(H[n][0]); }
    $$(".status").forEach(function (s) { s.classList.toggle("open", !!isOpen); var t = $(".status-t", s); if (t) t.textContent = txt; });
    $$(".status-t2").forEach(function (s) { s.textContent = txt; });
    $$(".hours tr").forEach(function (tr) { if (+tr.getAttribute("data-d") === day) tr.classList.add("today"); });
  } catch (e) {}

  /* project form: prepared email if an address is set, otherwise a summary to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["vehicle", "Vehicle"], ["job", "Type of job"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Upholstery project: " + (f.get("job") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Questions: call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Your request is ready: " + body.join(" · ") + ". Call " + tel + " and read it out – that's the quickest way to talk it through with Trent.";
        ok.style.display = "block";
      }
    });
  });
})();
