/* Eckert Signs, Inc. – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
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

  /* header shrinks on scroll */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { if (nav) nav.classList.toggle("small", (window.scrollY || 0) > 40); ticking = false; });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* neon tube + timeline line: measure path length for the draw effect */
  $$(".tube path").forEach(function (p) { try { p.parentNode.style.setProperty("--len", Math.ceil(p.getTotalLength() + 2)); } catch (e) {} });

  /* counters – final value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll (fade-up, clip-path, neon flicker) with a small stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        if (["neon", "draw"].indexOf(el.getAttribute("data-anim")) < 0) el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero neon words switch on one after another */
    $$(".hero-h [data-anim='neon'], .page-hero h1 [data-anim='neon']").forEach(function (el, i) {
      io.unobserve(el); el.style.animationDelay = (0.25 + i * 0.55) + "s"; el.classList.add("in");
    });
  }

  /* cursor spotlight in the hero + glass cards */
  if (hover && !reduce) {
    $$(".hero, .page-hero").forEach(function (h) {
      var s = $(".spot", h); if (!s) return;
      h.addEventListener("mousemove", function (e) { var r = h.getBoundingClientRect(); s.style.setProperty("--mx", (e.clientX - r.left) + "px"); s.style.setProperty("--my", (e.clientY - r.top) + "px"); });
    });
    $$(".glass").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty("--cx", x + "px"); c.style.setProperty("--cy", y + "px");
        if (c.classList.contains("tilt")) c.style.transform = "perspective(900px) rotateX(" + ((y / r.height - 0.5) * -6).toFixed(2) + "deg) rotateY(" + ((x / r.width - 0.5) * 6).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open now? Mon–Thu 7:30–16:30, Fri 7:30–16:00 (Eastern) */
  $$("[data-open]").forEach(function (dot) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60;
      var close = ["Mon", "Tue", "Wed", "Thu"].indexOf(d) > -1 ? 16.5 : d === "Fri" ? 16 : 0;
      var open = close && h >= 7.5 && h < close, txt = dot.parentNode.querySelector("[data-open-txt]");
      dot.classList.toggle("live", !!open);
      if (txt) txt.textContent = open ? "Shop open now · until " + (close === 16 ? "4:00" : "4:30") + " pm" : "Shop closed now · Mon–Thu 7:30–4:30 · Fri 7:30–4:00";
    } catch (e) {}
  });

  /* gallery filter */
  $$(".filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".filters button").forEach(function (x) { x.classList.toggle("on", x === b); });
      var f = b.getAttribute("data-f");
      $$("#gal figure").forEach(function (fig) { fig.classList.toggle("hide", f !== "all" && fig.getAttribute("data-cat") !== f); fig.classList.add("in"); });
    });
  });

  /* sign request form → prepared email, or a ready-to-read summary if no address is set */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["company", "Business"], ["service", "Need"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = (fm.getAttribute("data-mail") || "").trim();
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Sign request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app is opening with the request filled in."; ok.style.display = "block"; }
      } else {
        var txt = body.join("\n");
        try { navigator.clipboard && navigator.clipboard.writeText(txt); } catch (err) {}
        if (ok) { ok.textContent = "Your request is ready (copied to clipboard):\n\n" + txt + "\n\nCall 717-733-4601 and we’ll go through it with you."; ok.style.display = "block"; }
      }
    });
  });
})();
