/* Crawford Family Fence – concept site script */
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

  /* counters (final value stays in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1600;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll with sibling stagger; hero lines rise one after another */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.1 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".display [data-anim]").forEach(function (el, i) {
      io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 160);
    });
    var slat = $("[data-anim='slats']");
    if (slat) { io.unobserve(slat); setTimeout(function () { slat.classList.add("in"); }, 300); }
  }

  /* scroll loop: shrinking header, hero parallax, fence line drawing (rAF + passive) */
  var plx = $(".hero-fig .plx"), fl = $(".fence-line path"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        if (plx) plx.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)";
        if (fl) {
          var r = fl.closest("svg").getBoundingClientRect(), q = Math.min(1, Math.max(0, (vh * 0.95 - r.top) / (vh * 0.6)));
          fl.style.strokeDashoffset = (1 - q).toFixed(3);
        }
      }
      ticking = false;
    });
  }
  addEventListener("resize", function () { setNavH(); onScroll(); });
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* magnetic buttons */
  if (!reduce && hover) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* gallery filter */
  var fbtn = $$(".filters button"), figs = $$(".gal figure");
  fbtn.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      fbtn.forEach(function (x) { x.classList.toggle("on", x === b); });
      figs.forEach(function (g) { g.classList.toggle("hide", f !== "all" && g.getAttribute("data-cat") !== f); g.classList.add("in"); });
    });
  });

  /* open now / closed – Google hours: Mon–Sat 7–21, Sun 9–17 (Indiana, Eastern) */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Indiana/Indianapolis", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var open = day === 0 ? (h >= 9 && h < 17) : (h >= 7 && h < 21);
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-d") === day); });
    $$("[data-status]").forEach(function (el) {
      el.textContent = open ? "Open now · until " + (day === 0 ? "5 PM" : "9 PM") : "Closed now · opens " + (day === 6 ? "Sunday 9 AM" : day === 0 ? "Monday 7 AM" : "7 AM");
      if (el.parentNode) el.parentNode.classList.toggle("open", open);
    });
  } catch (e) {}

  /* estimate form → prepared email (or a summary to read out by phone) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["town", "Town"], ["job", "Project"], ["material", "Material"], ["length", "Approx. length"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Fence estimate: " + (f.get("job") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Questions: call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Your request is ready: " + body.join(" · ") + ". Call " + tel + " and read it out – that’s the fastest way to get your estimate.";
        ok.style.display = "block";
      }
    });
  });
})();
