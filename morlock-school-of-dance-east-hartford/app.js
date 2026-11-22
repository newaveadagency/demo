/* Morlock School of Dance – site script */
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

  /* header shrinks on scroll + stage parallax (rAF, passive) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -0.15).toFixed(1) + "px,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* soft spotlight that follows the cursor on the hero photo */
  var card = $(".hero-card");
  if (card && !reduce && matchMedia("(hover: hover)").matches) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    });
  }

  /* counters (final value is already in the HTML) */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll with a gentle stagger */
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
    var tag = $(".hero-tag [data-count]"); if (tag) setTimeout(function () { count(tag); }, 700);
  }

  /* office hours status (Mon–Fri 3–5 pm, Eastern) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      el.textContent = wk && h >= 15 && h < 17 ? "Office open now · until 5:00 pm" : "Office closed now · email us anytime";
    } catch (e) {}
  });

  /* inquiry form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Parent name"], ["phone", "Phone"], ["email", "Email"], ["age", "Dancer's age"], ["class", "Interested in"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Class question: " + (f.get("class") || "dance classes") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from morlockschoolofdance.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();

/* Movement layer: dancing letters, glitter, stage curtains, marquee skew, card tilt */
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* "dance." letters sway one after another */
  $$(".hero-h .script").forEach(function (el) {
    var t = el.textContent; el.textContent = ""; el.classList.add("dance"); el.setAttribute("aria-label", t);
    t.split("").forEach(function (ch, i) { var s = document.createElement("span"); s.className = "dl"; s.style.setProperty("--i", i); s.setAttribute("aria-hidden", "true"); s.textContent = ch; el.appendChild(s); });
  });

  /* let the dancing letters move outside the reveal mask once the headline is in */
  setTimeout(function () { $$(".hero-h .ln").forEach(function (l) { if (l.querySelector(".dance")) l.style.overflow = "visible"; }); }, 1600);

  if (reduce) return;

  /* glitter like stage sequins */
  $$("[data-glitter]").forEach(function (box) {
    var n = +box.getAttribute("data-glitter") || 16;
    for (var i = 0; i < n; i++) {
      var g = document.createElement("i");
      g.style.left = (Math.random() * 100).toFixed(1) + "%";
      g.style.setProperty("--s", (3 + Math.random() * 7).toFixed(1) + "px");
      g.style.setProperty("--d", (5 + Math.random() * 7).toFixed(1) + "s");
      g.style.setProperty("--dl", (-Math.random() * 12).toFixed(1) + "s");
      g.style.setProperty("--dx", ((Math.random() - .5) * 120).toFixed(0) + "px");
      box.appendChild(g);
    }
  });

  /* stage curtains open when the section comes into view */
  var stage = document.querySelector(".stage");
  if (stage && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { stage.classList.add("open"); so.disconnect(); } }); }, { threshold: .18 });
    so.observe(stage);
  } else if (stage) stage.classList.add("open");

  /* marquees: two rows, opposite directions, lean with scroll speed */
  var rows = $$(".marq-t"), last = window.scrollY, skew = 0, x = [0, 0];
  var widths = rows.map(function (r) { return r.scrollWidth / 2; });
  rows.forEach(function (r) { r.style.animation = "none"; });
  function frame() {
    var y = window.scrollY, v = y - last; last = y;
    skew += (Math.max(-12, Math.min(12, v * .35)) - skew) * .12;
    rows.forEach(function (r, i) {
      var dir = i % 2 ? 1 : -1, w = widths[i] || 1;
      x[i] = ((x[i] || 0) + dir * (0.6 + Math.abs(v) * .25)) % w;
      var tx = dir < 0 ? x[i] : x[i] - w;
      r.style.transform = "translate3d(" + tx.toFixed(1) + "px,0,0) skewX(" + (skew * -dir).toFixed(2) + "deg)";
    });
    requestAnimationFrame(frame);
  }
  if (rows.length) requestAnimationFrame(frame);

  /* gentle 3D tilt on cards (pointer devices only) */
  if (matchMedia("(hover: hover)").matches) {
    $$(".card, .step").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        c.style.transitionDelay = "0s";
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(800px) rotateY(" + (px * 8).toFixed(2) + "deg) rotateX(" + (-py * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }
})();
