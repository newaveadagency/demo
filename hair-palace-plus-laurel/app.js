/* The Hair Palace Plus – site script */
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
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* crown outline: measure stroke for the drawing animation */
  $$(".crown-draw path").forEach(function (p) {
    try { p.parentNode.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 4); } catch (e) {}
  });

  /* shrinking header + parallax on the hero sign (rAF, passive scroll) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 30);
      if (!reduce) plx.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        img.style.transform = "translate3d(0," + (p * -12).toFixed(2) + "%,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if (fine && !reduce) {
    /* playful tilt on cards */
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    /* blobs drift a little with the pointer */
    var hero = $(".hero"), blobs = $$(".hero .blob");
    if (hero) hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      blobs.forEach(function (b, i) { var k = i ? -26 : 34; b.style.translate = (x * k).toFixed(1) + "px " + (y * k).toFixed(1) + "px"; });
    });
  }

  /* counters (final value already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1200;
    el.textContent = "0";
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: words pop up one by one */
    $$(".hero-h .w > [data-anim]").forEach(function (el, i) {
      io.unobserve(el);
      setTimeout(function () { el.classList.add("in"); }, 120 + i * 85);
    });
  }

  /* open-now status + today's row (shop time: America/Chicago) */
  var HOURS = { 3: [8, 17], 4: [8, 17], 5: [8, 18], 6: [7, 12] };
  var now;
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var get = function (t) { return (parts.filter(function (p) { return p.type === t; })[0] || {}).value; };
    now = { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), h: (+get("hour") % 24) + (+get("minute")) / 60 };
  } catch (e) { var dt = new Date(); now = { d: dt.getDay(), h: dt.getHours() + dt.getMinutes() / 60 }; }
  function fmt(h) { return h === 12 ? "12 PM" : h > 12 ? (h - 12) + " PM" : h + " AM"; }
  var today = HOURS[now.d], msg, open = false;
  if (today && now.h >= today[0] && now.h < today[1]) { open = true; msg = "<b>Open now</b> · until " + fmt(today[1]); }
  else {
    var nd = now.d, add = 0;
    if (!(today && now.h < today[0])) { do { nd = (nd + 1) % 7; add++; } while (!HOURS[nd] && add < 8); }
    var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    msg = "<b>Closed now</b> · opens " + (add === 0 ? "today" : add === 1 ? "tomorrow" : names[nd]) + " at " + fmt(HOURS[nd][0]);
  }
  $$("[data-status]").forEach(function (s) { s.classList.toggle("open", open); $("span", s).innerHTML = msg; });
  $$("[data-hours] tr").forEach(function (tr) {
    var d = +tr.getAttribute("data-day");
    if (d === now.d || (d === 0 && (now.d === 1 || now.d === 2))) tr.classList.add("today");
  });

  /* FAQ: one open at a time */
  $$(".q-list details").forEach(function (d, _, all) {
    d.addEventListener("toggle", function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* visit form: e-mail if an address is set, otherwise a note to call in with */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Service"], ["day", "Preferred day"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Visit request: " + f.get("service") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Or call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.innerHTML = "";
        ok.appendChild(document.createTextNode("Thanks, " + f.get("name") + ". Call " + tel + " and mention:\n" + body.slice(2).join("\n") + "\n\n"));
        var a = document.createElement("a"); a.href = "tel:+16013425949"; a.className = "btn btn-pink"; a.textContent = "Call " + tel; ok.appendChild(a);
        ok.style.display = "block";
      }
    });
  });
})();
