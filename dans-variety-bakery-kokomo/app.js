/* Dan's Variety Bakery – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PHONE = "(765) 453-4591", TEL = "tel:+17654534591";

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header + slow parallax on big photos */
  var nav = $(".nav"), para = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      if (nav) nav.classList.toggle("small", (window.scrollY || 0) > 40);
      if (!reduce) para.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        img.style.transform = "translate3d(0," + (p * -60 - 20).toFixed(1) + "px,0) scale(1.08)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* counters */
  function count(el) {
    var to = parseFloat(el.getAttribute("data-count")), dec = +(el.getAttribute("data-dec") || 0), t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec);
    }
    requestAnimationFrame(step);
  }

  /* reveal on scroll (slow masks, staggered siblings) */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, par = el.parentNode;
        var sib = $$(":scope > [data-anim]", par), i = Math.max(0, sib.indexOf(el));
        if (el.getAttribute("data-anim") !== "line") el.style.transitionDelay = Math.min(i, 6) * 0.1 + "s";
        el.classList.add("in");
        $$("[data-count]", el).forEach(count);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    items.forEach(function (el) { if (el.getAttribute("data-anim") !== "line") io.observe(el); });
    $$('[data-anim="line"]').forEach(function (el, i) { el.style.transitionDelay = (0.15 + i * 0.16) + "s"; requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("in"); }); }); });
  }

  /* magnetic primary buttons */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".btn-red").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open/closed status + today (Kokomo = America/Indiana/Indianapolis). Tue–Sun 1:00–12:00, Mon closed */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Indiana/Indianapolis", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    var m = (+get("hour") % 24) * 60 + (+get("minute"));
    $$('[data-hours] tr[data-d="' + d + '"], [data-week] [data-d="' + d + '"]').forEach(function (el) { el.classList.add("today"); });
    var open = d !== 1 && m >= 60 && m < 720;
    var dot = $("[data-open]"), txt = $("[data-open-txt]");
    if (dot) dot.classList.toggle("open", open);
    if (txt) txt.textContent = open ? "Open now · until 12 p.m." : (d === 1 ? "Closed Mondays · open Tue at 1 a.m." : (m < 60 ? "Opens today at 1 a.m." : (d === 0 ? "Closed · open Tue at 1 a.m." : "Closed · open tomorrow at 1 a.m.")));
  } catch (e) {}

  /* menu filter chips */
  var chips = $$(".chip[data-filter]");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-filter");
      chips.forEach(function (x) { x.classList.toggle("on", x === c); x.setAttribute("aria-pressed", x === c); });
      $$("[data-group]").forEach(function (g) {
        var show = f === "all" || g.getAttribute("data-group") === f;
        g.classList.toggle("hide", !show);
        if (show && !reduce) $$("[data-anim]", g).forEach(function (el, i) { el.classList.remove("in"); el.style.transitionDelay = Math.min(i, 8) * 0.05 + "s"; requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("in"); }); }); });
      });
    });
  });

  /* order note → e-mail if an address is set, otherwise copy + call */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), lines = [];
      f.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ": " + v); });
      var body = "Order for Dan's Variety Bakery\n\n" + lines.join("\n");
      var to = fm.getAttribute("data-mail") || "", msg = $(".form-msg", fm);
      if (to) {
        location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Order – " + (f.get("Pickup day") || "")) + "&body=" + encodeURIComponent(body);
        if (msg) msg.textContent = "Your e-mail app should open with the order ready to send.";
      } else {
        if (navigator.clipboard) navigator.clipboard.writeText(body).catch(function () {});
        if (msg) msg.innerHTML = 'Your order note is copied. Call <a href="' + TEL + '">' + PHONE + '</a> before 1 a.m. and read it off.';
      }
    });
  });
})();
