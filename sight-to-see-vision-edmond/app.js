/* Sight to See Vision Associates – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o);
      burger.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var hdr = $(".hdr");
  var onScroll = function () { if (hdr) hdr.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* SVG draw: measure path length */
  $$('[data-anim="draw"]').forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 2); } catch (e) {} });

  /* count-up numbers */
  var count = function (el) {
    var end = parseFloat(el.getAttribute("data-count")) || 0, t0 = null, dur = 1600;
    var step = function (t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e);
      if (k < 1) requestAnimationFrame(step); else el.textContent = end;
    };
    requestAnimationFrame(step);
  };

  /* reveal on scroll */
  var show = function (el) {
    el.classList.add("in");
    $$("[data-count]", el).forEach(function (c) { if (!c._done) { c._done = 1; if (!reduce) count(c); } });
  };
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) anims.forEach(show);
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    anims.forEach(function (el) {
      if (el.getAttribute("data-anim") === "line") requestAnimationFrame(function () { setTimeout(function () { show(el); }, 120); });
      else io.observe(el);
    });
  }

  /* hero photo parallax */
  var par = $("[data-parallax]");
  if (par && !reduce) {
    var busy = false;
    var move = function () {
      busy = false;
      var r = par.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      par.style.transform = "translate3d(0," + (-r.top * 0.1 - 30).toFixed(1) + "px,0)";
    };
    window.addEventListener("scroll", function () { if (!busy) { busy = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* card tilt + magnetic buttons (mouse only) */
  if (fine && !reduce) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$("[data-magnetic]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open / closed status, Central time: Mon–Thu 8:15–17:00, Fri 8:30–13:00 */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = g("weekday"), h = (+g("hour") % 24) + (+g("minute")) / 60;
    var idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day);
    var open = (idx >= 1 && idx <= 4 && h >= 8.25 && h < 17) || (idx === 5 && h >= 8.5 && h < 13);
    $$("[data-open]").forEach(function (el) {
      el.textContent = open ? (idx === 5 ? "Open now · until 1:00 pm today" : "Open now · until 5:00 pm today") : "Closed now · Mon–Thu 8:15–5:00 · Fri 8:30–1:00";
      var dot = el.parentNode.querySelector(".dot"); if (dot && !open) dot.classList.add("off");
    });
    $$("[data-hours] tr").forEach(function (tr) { var d = +tr.getAttribute("data-d"); if (d === idx || (d === 6 && (idx === 0 || idx === 6))) tr.classList.add("today"); });
  } catch (e) {}

  /* appointment forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["patient", "Patient"], ["service", "Reason for visit"], ["day", "Preferred day"], ["message", "Notes"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      var ok = $(".form-ok", fm), mail = (fm.getAttribute("data-mail") || "").trim();
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Appointment request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Sight to See website");
        if (ok) { ok.textContent = "Thank you! Your email app has opened with the request ready to send. You can also call 405-341-7055."; ok.style.display = "block"; }
      } else if (ok) {
        ok.innerHTML = "Thank you! To book your time, please call <a href=\"tel:+14053417055\">405-341-7055</a>.";
        ok.style.display = "block";
      }
    });
  });
})();
