/* Ryan T. Anderson, DDS – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var hdr = $(".hdr");
  var onScroll = function () { if (hdr) hdr.classList.toggle("small", window.scrollY > 30); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* scroll reveal: every [data-anim] */
  /* hero headline: lines slide up from a mask on load (clipped, so not observed) */
  var heroLines = $$(".hero h1 .ln > [data-anim]");
  heroLines.forEach(function (el, i) { setTimeout(function () { el.classList.add("in"); }, reduce ? 0 : 150 + i * 120); });
  var els = $$("[data-anim]").filter(function (el) { return heroLines.indexOf(el) < 0; });
  if (reduce || !("IntersectionObserver" in window)) els.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* open / closed – office Tue–Fri 8:00–16:00, Mountain time */
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Denver", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday"));
    var h = (+g("hour") % 24) + g("minute") / 60;
    var work = day >= 2 && day <= 5, open = work && h >= 8 && h < 16;
    var nextTxt;
    if (open) nextTxt = "Open now · until 4:00 PM";
    else if (work && h < 8) nextTxt = "Closed · opens today at 8:00 AM";
    else if (day >= 1 && day <= 4) nextTxt = "Closed · opens tomorrow at 8:00 AM";
    else nextTxt = "Closed · opens Tuesday at 8:00 AM";
    $$("[data-open]").forEach(function (el) { el.textContent = nextTxt; });
    $$("[data-dot]").forEach(function (el) { el.classList.toggle("open", open); });
    $$('.week [data-d="' + day + '"], [data-hours] [data-d="' + day + '"]').forEach(function (el) { el.classList.add("today"); });
  } catch (e) {}

  if (!reduce) {
    /* parallax photo */
    var par = $$("[data-parallax]");
    if (par.length) {
      var ticking = false;
      var upd = function () {
        par.forEach(function (img) {
          var r = img.parentNode.getBoundingClientRect(), vh = window.innerHeight;
          if (r.bottom < 0 || r.top > vh) return;
          var k = (r.top + r.height / 2 - vh / 2) / vh;
          img.style.transform = "translate3d(0," + (k * -60).toFixed(1) + "px,0)";
        });
        ticking = false;
      };
      window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
      upd();
    }

    /* gentle card tilt */
    if (window.matchMedia("(hover: hover)").matches) {
      $$(".tilt").forEach(function (c) {
        c.addEventListener("mousemove", function (e) {
          var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          c.style.transform = "perspective(800px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
        });
        c.addEventListener("mouseleave", function () { c.style.transform = ""; });
      });
      /* magnetic call button */
      $$(".magnet").forEach(function (b) {
        b.addEventListener("mousemove", function (e) {
          var r = b.getBoundingClientRect();
          b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
        });
        b.addEventListener("mouseleave", function () { b.style.transform = ""; });
      });
    }
  }

  /* FAQ: one open at a time */
  $$(".qa details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".qa details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* appointment request → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Reason for visit"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var days = f.getAll("days"); if (days.length) body.push("Days that work: " + days.join(", "));
      if (f.get("message")) body.push("", f.get("message"));
      var ok = $(".ok", fm);
      if (!fm.dataset.mail) { if (ok) { ok.textContent = "Please call (719) 384-9442 to book."; ok.style.display = "block"; } return; }
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Appointment request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the website");
      if (ok) ok.style.display = "block";
    });
  });
})();
