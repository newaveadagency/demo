/* Done Right Electrical – site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
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

  /* horizontal gallery: vertical scroll drives the track (desktop), native swipe on small screens */
  var hg = $(".hg"), track = hg && $(".hg-track", hg), bar = hg && $(".hg-bar", hg), dist = 0;
  function sizeHG() {
    if (!hg) return;
    var small = innerWidth < 900 || reduce;
    hg.classList.toggle("static", small);
    if (small) { hg.style.height = ""; track.style.transform = ""; return; }
    dist = Math.max(0, track.scrollWidth - innerWidth + 40);
    hg.style.height = (innerHeight + dist) + "px";
  }

  /* scroll: header shrink, hero parallax, gallery */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) var pr = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height))); plx.style.transform = "translate3d(0," + ((0.5 - pr) * 0.22 * r.height).toFixed(1) + "px,0)";
      }
      if (hg && !hg.classList.contains("static")) {
        var top = hg.getBoundingClientRect().top, p = Math.min(1, Math.max(0, -top / (dist || 1)));
        track.style.transform = "translate3d(" + (-p * dist).toFixed(1) + "px,0,0)";
        if (bar) bar.style.setProperty("--p", p.toFixed(3));
      }
      ticking = false;
    });
  }
  sizeHG();
  addEventListener("resize", function () { sizeHG(); onScroll(); });
  addEventListener("load", function () { sizeHG(); onScroll(); });
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (hg && track) track.addEventListener("scroll", function () {
    if (!hg.classList.contains("static") || !bar) return;
    var m = track.scrollWidth - track.clientWidth; bar.style.setProperty("--p", m > 0 ? (track.scrollLeft / m).toFixed(3) : 1);
  }, { passive: true });

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = parseFloat(el.getAttribute("data-count")), dec = +(el.getAttribute("data-dec") || 0);
    var start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (start + (end - start) * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; });
        el.style.transitionDelay = Math.min(Math.max(0, sib.indexOf(el)), 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) {
      io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 160);
    });
  }

  /* kinetic rotating word in the hero */
  var rot = $(".rot");
  if (rot && !reduce) {
    var words = $$("b", rot), cur = 0;
    rot.classList.add("ready");
    setInterval(function () {
      var prev = words[cur]; cur = (cur + 1) % words.length;
      prev.classList.remove("cur"); prev.classList.add("out");
      words[cur].classList.remove("out"); words[cur].classList.add("cur");
      setTimeout(function () { prev.classList.remove("out"); }, 750);
    }, 2200);
  }

  /* cursor glow in the hero, magnetic buttons, card tilt */
  if (!reduce && fine) {
    var hero = $(".hero");
    if (hero) hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", (e.clientX - r.left) + "px"); hero.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open / closed by Lawrenceburg time (Central): Mon, Tue, Thu, Fri 7–19, Wed 7–15 */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var close = { 1: 19, 2: 19, 3: 15, 4: 19, 5: 19 }, isOpen = close[day] && h >= 7 && h < close[day];
    var fmt = function (x) { return x > 12 ? (x - 12) + ":00 PM" : x + ":00 AM"; };
    var nextTxt = function () { for (var i = 1; i <= 7; i++) { var d = (day + i) % 7; if (close[d]) return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d]; } return ""; };
    var txt = isOpen ? "Open now · until " + fmt(close[day]) : (close[day] && h < 7 ? "Closed · opens today 7:00 AM" : "Closed · opens " + nextTxt() + " 7:00 AM");
    $$(".status").forEach(function (s) { s.classList.toggle("open", !!isOpen); var t = $(".status-t", s); if (t) t.textContent = txt; });
    $$(".status-t2").forEach(function (s) { s.textContent = txt; });
    $$(".hours tr").forEach(function (tr) { if (+tr.getAttribute("data-d") === day) tr.classList.add("today"); });
  } catch (e) {}

  /* quote form: prepared email if an address is set, otherwise a summary to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["town", "Town"], ["job", "Type of job"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Quote request: " + (f.get("job") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. Questions: call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Your request is ready: " + body.join(" · ") + ". Call " + tel + " and read it out – that’s the fastest way to get it booked.";
        ok.style.display = "block";
      }
    });
  });
})();
