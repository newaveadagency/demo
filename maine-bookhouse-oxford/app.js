/* The Maine Bookhouse – site script */
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

  /* header shrinks on scroll */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { if (nav) nav.classList.toggle("small", (window.scrollY || 0) > 40); ticking = false; });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function fmt(n, sep) { n = Math.round(n); return sep ? n.toLocaleString("en-US") : String(n); }
  function count(el) {
    var end = +el.getAttribute("data-count"), sep = el.hasAttribute("data-sep"), start = end > 1900 && end < 2100 ? end - 40 : 0, t0 = null, dur = 1700;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(start + (end - start) * e, sep); if (p < 1) requestAnimationFrame(step); }
    el.textContent = fmt(start, sep); requestAnimationFrame(step);
  }

  /* SVG route: measure the path so the line can draw itself */
  $$(".route path.draw").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });

  /* reveal on scroll with a small stagger between siblings */
  var items = $$("[data-anim], .route");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.07 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: words rise one after another */
    $$(".hero h1 [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 120); });
  }

  /* open now / closed (Thu–Sat 10–17, Sun 12–16, Eastern time) + highlight today's row */
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var open = (d >= 4 && h >= 10 && h < 17) || (d === 0 && h >= 12 && h < 16);
    $$("[data-open]").forEach(function (el) {
      var t = $(".st-txt", el);
      if (open) { if (t) t.textContent = "Open now · until " + (d === 0 ? "4:00 pm" : "5:00 pm"); }
      else { el.classList.add("closed"); if (t) t.textContent = "Closed now · open Thu–Sat 10–5, Sun 12–4"; }
    });
    $$(".hours tr[data-day]").forEach(function (tr) { if (tr.getAttribute("data-day").split(",").indexOf(String(d)) > -1) tr.classList.add("today"); });
  } catch (e) {}

  /* book search form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["service", "Request"], ["title", "Title"], ["author", "Author"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("service") || "Book request") + (f.get("title") ? ": " + f.get("title") : "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from themainebookhouse.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
