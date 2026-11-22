/* Pacos Painting LLC – concept site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* counters – the final number is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
    setTimeout(function () { el.textContent = end; }, dur + 400);
  }

  /* reveal on scroll with sibling stagger */
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
    $$(".hero-h [data-anim], .phero h1 [data-anim]").forEach(function (el, i) {
      io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 200 + i * 170);
    });
    setTimeout(function () { items.forEach(function (el) { el.classList.add("in"); }); }, 9000);
  }

  /* kinetic word in the hero */
  $$("[data-rotate]").forEach(function (w) {
    if (reduce) return;
    var words = w.getAttribute("data-rotate").split(","), i = 0, b = $("b", w);
    if (!b || !b.animate) return;
    setInterval(function () {
      i = (i + 1) % words.length;
      b.animate([{ transform: "none", opacity: 1, filter: "blur(0)" }, { transform: "translateY(-60%) rotate(-4deg)", opacity: 0, filter: "blur(6px)" }], { duration: 260, easing: "ease-in" }).onfinish = function () {
        b.textContent = words[i];
        b.animate([{ transform: "translateY(60%) rotate(4deg)", opacity: 0, filter: "blur(6px)" }, { transform: "none", opacity: 1, filter: "blur(0)" }], { duration: 360, easing: "cubic-bezier(.2,.8,.2,1)" });
      };
    }, 2200);
  });

  /* before / after sliders */
  $$(".ba").forEach(function (ba) {
    var r = $(".ba-range", ba);
    if (!r) return;
    var set = function () { ba.style.setProperty("--p", r.value + "%"); };
    r.addEventListener("input", set); set();
    if (!reduce && "IntersectionObserver" in window) {
      var seen = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; seen.disconnect();
        var t0 = null;
        (function sweep(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1600, 1), v = 50 + Math.sin(p * Math.PI * 2) * 28; if (r.dataset.touched) return; r.value = v; set(); if (p < 1) requestAnimationFrame(sweep); else { r.value = 50; set(); } })(performance.now());
      }, { threshold: 0.6 });
      seen.observe(ba);
      r.addEventListener("pointerdown", function () { r.dataset.touched = 1; });
    }
  });

  /* horizontal gallery pinned to vertical scroll (desktop only) */
  var hs = $(".hscroll"), track = hs && $(".hs-track", hs), sticky = hs && $(".hs-sticky", hs);
  var pinOn = false;
  function setupPin() {
    if (!hs) return;
    var want = !reduce && innerWidth > 820;
    hs.classList.toggle("pin", want); pinOn = want;
    if (want) { var dist = track.scrollWidth - innerWidth; hs.style.setProperty("--hs-h", (innerHeight + Math.max(dist, 0)) + "px"); }
    else { track.style.transform = ""; hs.style.removeProperty("--hs-h"); }
  }

  /* step line */
  var line = $(".steps svg.line path");

  /* scroll loop: shrinking header, parallax, gallery, step line */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        if (y < vh * 1.3) plx.forEach(function (f) { f.style.translate = "0 " + (y * -0.08).toFixed(1) + "px"; });
        if (pinOn) {
          var b = hs.getBoundingClientRect(), dist = track.scrollWidth - innerWidth, q = Math.min(1, Math.max(0, -b.top / Math.max(1, b.height - vh)));
          track.style.transform = "translateX(" + (-dist * q).toFixed(1) + "px)";
        }
        if (line) {
          var s = line.closest(".steps").getBoundingClientRect(), k = Math.min(1, Math.max(0, (vh * 0.85 - s.top) / (s.height * 0.9)));
          line.style.strokeDashoffset = (1 - k).toFixed(3);
        }
      }
      ticking = false;
    });
  }
  setupPin();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", function () { setupPin(); onScroll(); });
  addEventListener("load", function () { setupPin(); onScroll(); });
  onScroll();

  /* tilt cards + magnetic buttons */
  if (hover && !reduce) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(800px) rotateX(" + (-y * 8) + "deg) rotateY(" + (x * 10) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".mag").forEach(function (m) {
      m.addEventListener("mousemove", function (e) { var r = m.getBoundingClientRect(); m.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .18) + "px," + ((e.clientY - r.top - r.height / 2) * .25) + "px)"; });
      m.addEventListener("mouseleave", function () { m.style.transform = ""; });
    });
  }

  /* open / closed now (Wilmington = America/New_York), Mon–Sat 8:00–17:30 */
  var st = $("[data-status]");
  if (st) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
      var day = g("weekday"), mins = (+g("hour") % 24) * 60 + +g("minute");
      var open = day !== "Sun" && mins >= 480 && mins < 1050;
      st.textContent = open ? "Open now" : "Closed now – text anytime";
      st.className = open ? "open" : "closed";
    } catch (e) {}
  }

  /* estimate form → prepared text message */
  $$("form.lead-form").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(f), num = f.getAttribute("data-sms");
      var body = "Hi Pacos Painting, I'd like an estimate.\n" +
        "Name: " + (d.get("name") || "") + "\nPhone: " + (d.get("phone") || "") +
        (d.get("area") ? "\nAddress/area: " + d.get("area") : "") +
        "\nJob: " + (d.get("type") || "") + (d.get("msg") ? "\nDetails: " + d.get("msg") : "");
      location.href = "sms:" + num + "?body=" + encodeURIComponent(body);
    });
  });
})();
