/* Young Veterinary Clinic – site script */
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

  /* header shrinks on scroll + gentle photo parallax (rAF, passive listener) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top - innerHeight / 2) * -0.06 - 20).toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1900 && end < 2100 ? end - 30 : 0, t0 = null, dur = 1700;
    function fmt(n) { return end >= 1000 && end < 1900 || end > 2100 ? n.toLocaleString("en-US") : String(n); }
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(start + (end - start) * e)); if (p < 1) requestAnimationFrame(step); }
    el.textContent = fmt(start); requestAnimationFrame(step);
  }
  $$("[data-count]").forEach(function (el) { var v = +el.getAttribute("data-count"); if (v > 2100) el.textContent = v.toLocaleString("en-US"); });

  /* reveal on scroll with a soft stagger between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        if (el.getAttribute("data-anim") !== "draw") el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160); });
  }

  /* open now / emergency hours / closed (Central time, hours from the clinic's site) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, t = $(".status-t", el) || el, cls = "", msg;
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      if (wk && h >= 8 && h < 17) { cls = "st-open"; msg = "Open now · until 5:00 pm today"; }
      else if (d === "Sat" && h >= 8 && h < 12) { cls = "st-open"; msg = "Open now · until 12:00 pm today"; }
      else if ((wk && h >= 17 && h < 22) || (d === "Sat" && h >= 12 && h < 22) || (d === "Sun" && h >= 7.5 && h < 22)) { cls = "st-er"; msg = "Emergency hours · call (660) 646-7878"; }
      else {
        var early = h < 8, nxt;
        if (d === "Sun") nxt = "Monday 8:00 am";
        else if (d === "Sat") nxt = early ? "today 8:00 am" : "Monday 8:00 am";
        else if (d === "Fri") nxt = early ? "today 8:00 am" : "Saturday 8:00 am";
        else nxt = early ? "today 8:00 am" : "tomorrow 8:00 am";
        msg = "Closed now · opens " + nxt;
      }
      if (cls) el.classList.add(cls);
      t.textContent = msg;
    } catch (e) {}
  });

  /* appointment form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["animal", "Animal"], ["reason", "Reason for visit"], ["message", "Pet's name & message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Appointment request: " + (f.get("reason") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from youngvetclinic.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
