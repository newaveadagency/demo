/* Glacier Run Outfitters – concept site script */
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
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); if (nav) nav.classList.toggle("solid", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* open / closed status in Alaska time: daily 6 AM – 9 PM */
  function akNow() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Anchorage", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      return (+o.hour % 24) * 60 + (+o.minute);
    } catch (e) { var n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
  }
  var m = akNow(), open = m >= 360 && m < 1260;
  $$("[data-status]").forEach(function (st) {
    st.textContent = open ? "Open now · until 9 PM (Alaska time)" : (m < 360 ? "Closed now · opens at 6 AM" : "Closed now · opens tomorrow 6 AM");
  });
  $$("[data-status-dot]").forEach(function (d) { if (open) d.classList.add("open"); });

  /* shrinking header + hero parallax (one rAF loop on scroll) */
  var layers = $$(".layer[data-depth]"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce && y < 1200) layers.forEach(function (l) { l.style.transform = "translate3d(0," + (y * +l.getAttribute("data-depth")).toFixed(1) + "px,0)"; });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = 0; requestAnimationFrame(step);
  }

  /* reveal on scroll (staggered), river line draw, hero sequence */
  var items = $$("[data-anim]"), line = $(".flow-line");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    if (line) line.classList.add("in");
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el === line) { el.classList.add("in"); io.unobserve(el); return; }
        var sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.1 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    if (line) io.observe(line);
    var heroSeq = $$(".hero-in [data-anim], .sub-hero [data-anim]");
    heroSeq.forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.style.transitionDelay = "0s"; el.classList.add("in"); }, 150 + i * 140); });
  }

  /* magnetic buttons, card tilt (fine pointer only) */
  if (!reduce && fine) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg) translateY(-6px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* trip request: email if an address is set, otherwise show a summary to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Interested in"], ["people", "People"], ["when", "Dates"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Trip request: " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. You can also call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Call Zac at " + tel + " (daily 6 AM – 9 PM Alaska time) with these details:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
