/* Louisiana Family Dental – site script */
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
  var onScroll = function () { if (hdr) hdr.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* SVG paths: measure length for the draw animation */
  $$('[data-anim="draw"]').forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });

  /* reveal on scroll (hero lines run immediately) */
  var show = function (el) { el.classList.add("in"); };
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) anims.forEach(show);
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    anims.forEach(function (el) {
      if (el.getAttribute("data-anim") === "line") requestAnimationFrame(function () { setTimeout(function () { show(el); }, 120); });
      else io.observe(el);
    });
  }

  /* timeline line grows with scroll */
  var tl = $(".tl"), tlPath = $('[data-anim="tl"]');
  if (tl && tlPath && !reduce) {
    var tick = function () {
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
      tlPath.style.strokeDashoffset = (1 - p).toFixed(4);
    };
    window.addEventListener("scroll", function () { requestAnimationFrame(tick); }, { passive: true }); tick();
  }

  /* hero image parallax */
  var par = $("[data-parallax]");
  if (par && !reduce) {
    var busy = false;
    var move = function () { busy = false; var r = par.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) return; par.style.transform = "translate3d(0," + (-r.top * 0.12 - 40).toFixed(1) + "px,0)"; };
    window.addEventListener("scroll", function () { if (!busy) { busy = true; requestAnimationFrame(move); } }, { passive: true }); move();
  }

  /* gentle tilt on service cards + magnetic primary button */
  if (fine && !reduce) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(800px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$("[data-magnetic]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* open / closed status (Mon–Thu 8:00–16:00, Central time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, wk = ["Mon", "Tue", "Wed", "Thu"].indexOf(d) > -1;
      el.textContent = wk && h >= 8 && h < 16 ? "Open now · until 4pm today" : "Closed now · Mon–Thu 8am–4pm, Sat by appointment";
    } catch (e) {}
  });

  /* appointment forms → prepared email (or call prompt when no address is set) */
  var PHONE = "(225) 256-6386";
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["patient", "Patient"], ["service", "Reason for visit"], ["language", "Language"], ["day", "Preferred day"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".form-ok", fm), mail = (fm.getAttribute("data-mail") || "").trim();
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Appointment request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from louisianafamilydental.com");
        if (ok) { ok.textContent = "Thank you! Your email app has opened with the request ready to send."; ok.style.display = "block"; }
      } else if (ok) {
        ok.innerHTML = "Thank you, " + String(f.get("name")).replace(/[<>&"]/g, "") + "! To lock in your time, please call <a href=\"tel:+12252566386\">" + PHONE + "</a>.";
        ok.style.display = "block";
      }
    });
  });
})();
