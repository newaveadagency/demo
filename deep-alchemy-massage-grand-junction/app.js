/* Deep Alchemy Massage – concept site script */
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

  /* twinkling star field (projector-style), generated so the HTML stays clean */
  if (!reduce) {
    $$(".stars").forEach(function (box) {
      var n = innerWidth < 700 ? 40 : 90, frag = document.createDocumentFragment();
      for (var i = 0; i < n; i++) {
        var b = document.createElement("b");
        b.style.left = (Math.random() * 100).toFixed(2) + "%";
        b.style.top = (Math.random() * 100).toFixed(2) + "%";
        b.style.animationDelay = (-Math.random() * 4).toFixed(2) + "s";
        b.style.animationDuration = (2.5 + Math.random() * 4).toFixed(2) + "s";
        if (Math.random() < 0.15) { b.style.width = b.style.height = "3px"; }
        frag.appendChild(b);
      }
      box.appendChild(frag);
    });
  }

  /* counters (final value already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings; hero words rise one after another */
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
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim]").forEach(function (el, i) {
      io.unobserve(el); el.style.transitionDuration = "1.1s";
      setTimeout(function () { el.classList.add("in"); }, 200 + i * 140);
    });
  }

  /* cursor spotlight on glass panels and hero (like the studio's projector light) */
  if (!reduce && hover) {
    document.addEventListener("pointermove", function (e) {
      var t = e.target && e.target.closest ? e.target.closest(".spot") : null;
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
      t.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
    }, { passive: true });

    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* scroll loop: shrinking header, hero parallax, step line drawing (rAF, passive) */
  var plx = $(".hero-fig .plx"), trail = $(".trail path"), ticking = false;
  if (trail && !reduce) trail.style.strokeDashoffset = "1";
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 30);
      if (!reduce) {
        if (plx && y < vh * 1.2) plx.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)";
        if (trail) {
          var s = trail.closest(".steps").getBoundingClientRect(), q = Math.min(1, Math.max(0, (vh * 0.7 - s.top) / s.height));
          trail.style.strokeDashoffset = (1 - q).toFixed(3);
        }
      }
      ticking = false;
    });
  }
  addEventListener("resize", function () { setNavH(); onScroll(); });
  addEventListener("scroll", onScroll, { passive: true }); onScroll(); setNavH();

  /* open now / closed (Tue–Sat 9:00–20:00, Mountain time) + today's row */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Denver", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var open = day >= 2 && day <= 6 && h >= 9 && h < 20;
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-d") === day); });
    $$("[data-status]").forEach(function (el) { el.classList.toggle("open", open); el.textContent = open ? "Open now · until 8 PM" : "Closed now · opens Tue–Sat 9 AM"; });
  } catch (e) {}

  /* booking request: prepared e-mail when an address is set, otherwise a summary + call button */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Session"], ["areas", "Areas of concern"], ["day", "Preferred day"], ["time", "Time of day"], ["first", "First massage"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = body.join("\n"), ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone");
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Massage request: " + f.get("name")) + "&body=" + encodeURIComponent(text);
        if (ok) { ok.textContent = "Your e-mail app should open with the request ready to send."; ok.style.display = "block"; }
        return;
      }
      if (!ok) return;
      ok.innerHTML = "";
      var p = document.createElement("strong"); p.textContent = "Your request is ready:"; ok.appendChild(p);
      var pre = document.createElement("pre"); pre.textContent = text; ok.appendChild(pre);
      var call = document.createElement("a"); call.className = "btn btn-glow"; call.href = "tel:" + tel; call.textContent = "Call to book"; ok.appendChild(call);
      if (navigator.clipboard) {
        var cp = document.createElement("button"); cp.type = "button"; cp.className = "btn btn-ghost"; cp.textContent = "Copy request";
        cp.addEventListener("click", function () { navigator.clipboard.writeText(text).then(function () { cp.textContent = "Copied"; }); });
        ok.appendChild(cp);
      }
      ok.style.display = "block";
    });
  });
})();
