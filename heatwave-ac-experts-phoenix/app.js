/* Heatwave A/C Experts – site script */
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

  /* horizontal emergency gallery: pinned + driven by vertical scroll on wide screens */
  var hz = $(".hz"), track = hz && $(".hz-track", hz), hzDist = 0;
  function setupHz() {
    if (!hz || !track) return;
    var wide = innerWidth > 900 && !reduce;
    hz.classList.toggle("pin", wide);
    if (!wide) { track.style.transform = ""; hz.style.removeProperty("--hzh"); return; }
    hzDist = Math.max(0, track.scrollWidth - track.clientWidth + 40);
    hz.style.setProperty("--hzh", (innerHeight + hzDist) + "px");
  }

  /* header shrink + blob parallax + horizontal track (one rAF, passive listener) */
  var blobs = $$(".hero .blob, .page-hero .blob"), ticking = false;
  function frame() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("small", y > 50);
    if (!reduce) {
      blobs.forEach(function (b, i) { b.style.translate = "0 " + (y * (i % 2 ? -0.12 : 0.18)).toFixed(1) + "px"; });
      if (hz && hz.classList.contains("pin")) {
        var r = hz.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / Math.max(1, hzDist)));
        track.style.transform = "translate3d(" + (-p * hzDist).toFixed(1) + "px,0,0)";
      }
    }
    ticking = false;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  setupHz();
  addEventListener("resize", function () { setupHz(); onScroll(); });
  addEventListener("load", function () { setupHz(); onScroll(); });
  addEventListener("scroll", onScroll, { passive: true });
  frame();

  /* counters – final value already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = 0; requestAnimationFrame(step);
  }

  /* scroll reveal with stagger, hero lines in sequence */
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
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 170); });
  }

  /* cursor glow on service cards + magnetic buttons */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".svc").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open now? Mon–Sat 7:00–19:00, Phoenix time (no DST) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60;
      if (d === "Sun") el.textContent = "Sunday · emergency service available";
      else if (h >= 7 && h < 19) el.textContent = "Open now · until 7:00 PM";
      else el.textContent = "Closed now · Mon–Sat 7:00 AM – 7:00 PM";
    } catch (err) {}
  });

  /* request forms → prepared email (until an address is set: ready summary + call) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Service needed"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = (fm.getAttribute("data-mail") || "").trim();
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Service request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from heatwaveacexperts.com");
        if (ok) { ok.textContent = "Your email app should open with the request ready to send."; ok.style.display = "block"; }
      } else if (ok) {
        try { if (navigator.clipboard) navigator.clipboard.writeText(body.join("\n")); } catch (err) {}
        ok.innerHTML = "Thanks! Your request is ready. Please call <a href=\"tel:+16024203456\">602-420-3456</a> so we can schedule it.";
        ok.style.display = "block";
      }
    });
  });
})();
