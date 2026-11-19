/* Wag'en Tail Ranch – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().bottom + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrink + hero photo parallax (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 50);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) { var k = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height))); plx.style.transform = "translate3d(0," + (-k * 15).toFixed(2) + "%,0)"; }
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – the final number is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    if (document.hidden) return; requestAnimationFrame(step);
  }

  /* reveal on scroll (fade-up, clip-path, trail drawing) */
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
    /* hero words land like rubber stamps, one after another */
    $$("h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 260); });
  }

  /* lodging cards tilt toward the cursor */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".lodge").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* boarding office open / closed (Central time) */
  var today = null;
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    today = d;
    var slots = d === 0 ? [[16, 19]] : d === 6 ? [[8, 13]] : [[8, 13], [16, 19]];
    var open = slots.filter(function (s) { return h >= s[0] && h < s[1]; })[0];
    var next = slots.filter(function (s) { return h < s[0]; })[0];
    var fmt = function (x) { return (x > 12 ? x - 12 : x) + (x >= 12 ? " pm" : " am"); };
    $$("[data-open]").forEach(function (el) {
      el.textContent = open ? "Boarding office open now · until " + fmt(open[1])
        : next ? "Boarding office opens today at " + fmt(next[0])
        : "Boarding office closed now · request a stay online";
    });
  } catch (e) {}
  if (today !== null) $$(".hours tr[data-day]").forEach(function (tr) { if (tr.getAttribute("data-day").split(" ").indexOf(String(today)) > -1) tr.classList.add("today"); });

  /* rate picker: highlight the column for the number of dogs */
  var pick = $$(".picker button");
  function setDogs(n) {
    pick.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-dogs") === n ? "true" : "false"); });
    $$(".rates [data-n]").forEach(function (c) { c.classList.toggle("hl", c.getAttribute("data-n") === n); });
  }
  if (pick.length) { pick.forEach(function (b) { b.addEventListener("click", function () { setDogs(b.getAttribute("data-dogs")); }); }); setDogs("1"); }

  /* stay request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["from", "Drop-off"], ["to", "Pick-up"], ["dogs", "Number of dogs"], ["suite", "Stay in"], ["message", "About my dog(s)"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Stay request: " + (f.get("suite") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from wagentail.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
