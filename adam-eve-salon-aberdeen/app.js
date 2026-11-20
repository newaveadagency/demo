/* Adam & Eve Styling Salon & Wig Center – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters */
  var count = function (el) {
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0), t0 = null, dur = 1600;
    if (reduce) { el.textContent = to; return; }
    var step = function (t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = from; requestAnimationFrame(step);
  };

  /* reveal on scroll */
  var items = $$("[data-anim]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add("in"); });

  /* hero photo parallax */
  var px = $("[data-parallax]");
  if (px && !reduce) {
    var ticking = false;
    var move = function () {
      var r = px.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) px.style.transform = "translate3d(0," + (-r.top * 0.12 - 30) + "px,0)";
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* gentle card tilt (pointer devices only) */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 6) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open / closed (Aberdeen, SD = Central time) */
  var HOURS = { 0: null, 1: [8, 20], 2: [10, 20], 3: [8, 20], 4: [10, 20], 5: [8, 20], 6: [8, 16] };
  var fmt = function (h) { return (h > 12 ? h - 12 : h) + (h >= 12 ? " PM" : " AM"); };
  try {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    var today = HOURS[day], open = today && h >= today[0] && h < today[1], msg;
    if (open) msg = "Open now · until " + fmt(today[1]);
    else if (today && h < today[0]) msg = "Closed now · opens today at " + fmt(today[0]);
    else { var n = (day + 1) % 7; while (!HOURS[n]) n = (n + 1) % 7; msg = "Closed now · opens " + ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][n] + " at " + fmt(HOURS[n][0]); }
    $$("[data-open]").forEach(function (el) { el.textContent = msg; });
    $$("[data-open-dot]").forEach(function (el) { el.classList.toggle("closed", !open); });
    $$("[data-hours] tr").forEach(function (tr) { if (+tr.getAttribute("data-d") === day) tr.classList.add("today"); });
  } catch (e) {}

  /* services page: active category chip */
  var chips = $$(".cats a");
  if (chips.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + e.target.id;
          a.classList.toggle("on", on);
          if (on && a.parentNode.scrollTo) a.parentNode.scrollTo({ left: a.offsetLeft - a.parentNode.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" });
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    $$(".menu-sec").forEach(function (s) { spy.observe(s); });
  }

  /* appointment request → prepared e-mail (if address set) or summary + call button */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), lines = [];
      [["name", "Name"], ["phone", "Phone"], ["service", "Service"], ["stylist", "Stylist"], ["day", "Preferred day"], ["time", "Time of day"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) lines.push(k[1] + ": " + f.get(k[0])); });
      var txt = "Appointment request\n" + lines.join("\n");
      var ok = $(".ok", fm);
      if (fm.dataset.mail) {
        location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Appointment request – " + f.get("service") + " – " + f.get("name")) + "&body=" + encodeURIComponent(txt + "\n\nSent from the Adam & Eve website");
        if (ok) { ok.textContent = "Your e-mail app should open with your request. If it doesn't, call us at (605) 229-1700."; ok.style.display = "block"; }
        return;
      }
      if (!ok) return;
      ok.innerHTML = "";
      var b = document.createElement("b"); b.textContent = "Your request is ready. Call the salon and we'll book it in:";
      var pre = document.createElement("pre"); pre.textContent = txt;
      var row = document.createElement("div"); row.className = "btn-row";
      var call = document.createElement("a"); call.className = "btn btn-crimson"; call.href = "tel:" + (fm.dataset.tel || "+16052291700"); call.textContent = "Call (605) 229-1700"; call.style.width = "auto"; call.style.marginTop = "0";
      var cp = document.createElement("button"); cp.type = "button"; cp.className = "btn btn-line"; cp.textContent = "Copy request"; cp.style.width = "auto"; cp.style.marginTop = "0";
      cp.addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { cp.textContent = "Copied"; }); });
      row.appendChild(call); row.appendChild(cp);
      ok.appendChild(b); ok.appendChild(pre); ok.appendChild(row); ok.style.display = "block";
    });
  });
})();
