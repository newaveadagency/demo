/* Park St. Nails – site script (no libraries) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(pointer:fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o);
      burger.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* eucalyptus sprigs: measure each stroke so it can draw itself */
  $$(".draw path").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 2); } catch (e) {}
  });

  /* shrinking header + hero parallax (rAF, passive listener) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 24);
      if (!reduce) plx.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        img.style.transform = "scale(1.1) translate3d(0," + (p * -6).toFixed(2) + "%,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* magnetic buttons (mouse only) */
  if (fine && !reduce) {
    $$(".magnet").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = "translate(" + (x * 0.18).toFixed(1) + "px," + (y * 0.28).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* counters (final numbers are already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    el.textContent = "0";
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered by position among siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -7% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero: headline lines rise out of their masks, grid lines drop in */
    $$(".hero-h .line-mask > [data-anim], .page-hero h1 .line-mask > [data-anim]").forEach(function (el, i) {
      io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 140);
    });
    $$(".grid-lines span[data-anim]").forEach(function (el, i) {
      io.unobserve(el); el.style.transitionDelay = (i * 0.12) + "s"; requestAnimationFrame(function () { el.classList.add("in"); });
    });
  }

  /* open-now badge + today's row (salon time: America/New_York) */
  var HOURS = { 0: [10, 15], 4: [10, 18], 5: [10, 18], 6: [10, 18] };
  var now;
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var get = function (t) { return (parts.filter(function (p) { return p.type === t; })[0] || {}).value; };
    now = { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), h: (+get("hour") % 24) + (+get("minute")) / 60 };
  } catch (e) { var dt = new Date(); now = { d: dt.getDay(), h: dt.getHours() + dt.getMinutes() / 60 }; }
  function fmt(h) { return h === 12 ? "12 PM" : h > 12 ? (h - 12) + " PM" : h + " AM"; }
  var today = HOURS[now.d], msg, open = false;
  if (today && now.h >= today[0] && now.h < today[1]) { open = true; msg = "Open now · until " + fmt(today[1]); }
  else {
    var nd = now.d, add = 0;
    if (!(today && now.h < today[0])) { do { nd = (nd + 1) % 7; add++; } while (!HOURS[nd] && add < 8); }
    var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    msg = "Closed now · opens " + (add === 0 ? "today" : add === 1 ? "tomorrow" : names[nd]) + " " + fmt(HOURS[nd][0]);
  }
  $$("[data-status]").forEach(function (s) { s.classList.toggle("open", open); $("span", s).textContent = msg; });
  $$("[data-hours] tr").forEach(function (tr) { if (+tr.getAttribute("data-day") === now.d) tr.classList.add("today"); });

  /* FAQ: one answer open at a time */
  $$(".faq details").forEach(function (d, _, all) {
    d.addEventListener("toggle", function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* visit form: e-mail when an address is set, otherwise a ready-to-read call note */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Service"], ["day", "Preferred day"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (!ok) return;
      ok.innerHTML = "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Nail visit: " + f.get("service") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        ok.appendChild(document.createTextNode("Your email app should open with the request filled in. Or call " + tel + "."));
      } else {
        ok.appendChild(document.createTextNode("Thanks, " + f.get("name") + ". Call " + tel + " and mention:\n" + body.slice(2).join("\n") + "\n"));
        var a = document.createElement("a"); a.href = "tel:+18636232498"; a.className = "btn"; a.textContent = "Call " + tel; ok.appendChild(a);
      }
      ok.style.display = "block";
    });
  });
})();
