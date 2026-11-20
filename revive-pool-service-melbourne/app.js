/* Revive Pool Service – concept site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* stop the SVG water-light animation for reduced motion */
  if (reduce) { $$("svg").forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); }); }

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header + hero image parallax (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + ((r.top - innerHeight / 3) * -0.07).toFixed(1) + "px,0) scale(1.1)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$('[data-anim="line"]').forEach(function (el, i) { io.unobserve(el); el.style.transitionDelay = "0s"; setTimeout(function () { el.classList.add("in"); }, 120 + i * 140); });
  }

  /* service finder (services page) */
  var answers = {
    routine: ["Weekly or monthly pool service", "Brushing, vacuuming, skimmers and leaf traps, chemical testing and water treatment, on a schedule that fits your pool."],
    green: ["Green to clean", "Revive brings algae-green water back to clear, then keeps algae away with algae prevention and regular treatment."],
    salt: ["Salt pool maintenance", "Salt pool service and salt cell cleaning, together with chemical testing and balancing."],
    equip: ["Filters, valves & pumps", "Filter cleaning, check valves and variable speed pump programming."],
    above: ["Above ground pools", "Revive services above ground pools too: cleaning, testing and treatment."]
  };
  var fa = $(".finder-a");
  $$(".finder-q button").forEach(function (b) {
    b.addEventListener("click", function () {
      var a = answers[b.getAttribute("data-k")]; if (!a || !fa) return;
      $$(".finder-q button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $('[data-f="title"]', fa).textContent = a[0];
      $('[data-f="text"]', fa).textContent = a[1];
      if (!reduce) { fa.classList.remove("fa-anim"); void fa.offsetWidth; fa.classList.add("fa-anim"); }
    });
  });

  /* request form: builds an email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["town", "Town"], ["service", "Service"], ["message", "About the pool"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Pool service request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Prefer to talk? Call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Call " + tel + " with these details:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
