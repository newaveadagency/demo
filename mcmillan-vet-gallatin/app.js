/* McMillan Veterinary Clinic – site script (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var hdr = $(".hdr");
  var onScroll = function () { if (hdr) hdr.classList.toggle("small", window.scrollY > 30); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* SVG underline: measure path length for the draw animation */
  $$('[data-anim="draw"]').forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });

  /* count-up numbers (final value is already in the HTML) */
  var count = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10), t0 = null, dur = 1300;
    if (reduce || isNaN(end)) return;
    var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(end * e); if (k < 1) requestAnimationFrame(step); };
    el.textContent = "0"; requestAnimationFrame(step);
  };

  /* reveal on scroll; hero words pop in right away */
  var show = function (el) { el.classList.add("in"); $$("[data-count]", el).forEach(count); };
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) anims.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    anims.forEach(function (el) {
      if (el.closest(".hero h1")) setTimeout(function () { show(el); }, 150);
      else io.observe(el);
    });
  }

  /* playful tilt on cards + magnetic call buttons */
  if (fine && !reduce) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(700px) rotateX(" + (-y * 7).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-6px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$("[data-magnetic]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* hero blob drifts gently with scroll */
  var art = $(".hero-art .blob-img");
  if (art && !reduce) {
    var busy = false;
    window.addEventListener("scroll", function () {
      if (busy) return; busy = true;
      requestAnimationFrame(function () { busy = false; var y = Math.min(window.scrollY, 700); art.style.transform = "translate3d(0," + (y * 0.07).toFixed(1) + "px,0) rotate(" + (y * 0.006).toFixed(2) + "deg)"; });
    }, { passive: true });
  }

  /* open / closed (Mon–Fri 7:00–17:30, Central time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      el.textContent = wk && h >= 7 && h < 17.5 ? "Open now · until 5:30 pm today" : "Closed now · Mon–Fri 7:00 am – 5:30 pm";
    } catch (e) {}
  });

  /* appointment form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["pet", "Pet's name"], ["species", "Species"], ["service", "Reason for visit"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Appointment request – " + (f.get("pet") || "") + " (" + (f.get("name") || "") + ")") + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the McMillan Veterinary Clinic website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
