/* Pretty Pets Canine Camp – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(pointer:fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* leash line on the tour: length for stroke drawing */
  var leash = $(".leash path"), tour = $(".tour"), len = 0;
  if (leash) { try { len = Math.ceil(leash.getTotalLength()) + 4; } catch (e) { len = 1100; } leash.style.setProperty("--len", len); }
  if (leash && reduce) $(".leash").classList.add("done");

  /* shrinking header + parallax + leash drawing (rAF, passive scroll) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        plx.forEach(function (img) {
          var r = img.parentNode.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
          img.style.transform = "translate3d(0," + (-8 + p * -16).toFixed(2) + "%,0)";
        });
        if (leash && tour) {
          var t = tour.getBoundingClientRect();
          var prog = Math.min(1, Math.max(0, (vh * 0.75 - t.top) / t.height));
          leash.style.strokeDashoffset = (len * (1 - prog)).toFixed(1);
        }
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* magnetic buttons + card tilt (fine pointers only) */
  if (fine && !reduce) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
    $$(".quote").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* counters (final value already in HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1300;
    el.textContent = "0";
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered among siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero headline: line by line out of a mask */
    $$(".hero-h .l > [data-anim]").forEach(function (el, i) {
      io.unobserve(el);
      setTimeout(function () { el.classList.add("in"); }, 120 + i * 140);
    });
  }

  /* open-now status + today's row (camp time: America/Chicago, open daily 7–21) */
  var OPEN = 7, CLOSE = 21, now;
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var get = function (t) { return (parts.filter(function (p) { return p.type === t; })[0] || {}).value; };
    now = { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), h: (+get("hour") % 24) + (+get("minute")) / 60 };
  } catch (e) { var dt = new Date(); now = { d: dt.getDay(), h: dt.getHours() + dt.getMinutes() / 60 }; }
  var open = now.h >= OPEN && now.h < CLOSE;
  var msg = open ? "<b>Open now</b> · until 9 PM today" : "<b>Closed now</b> · opens " + (now.h < OPEN ? "today" : "tomorrow") + " at 7 AM";
  $$("[data-status]").forEach(function (s) { s.classList.toggle("open", open); var sp = $("span", s); if (sp) sp.innerHTML = msg; });
  $$("[data-hours] tr").forEach(function (tr) { if (+tr.getAttribute("data-day") === now.d) tr.classList.add("today"); });

  /* FAQ: one open at a time */
  $$(".q-list details").forEach(function (d, _, all) {
    d.addEventListener("toggle", function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* stay form: e-mail when an address is set, otherwise a summary to call in with */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["dog", "Dog"], ["count", "Number of dogs"], ["from", "Drop-off"], ["to", "Pick-up"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "", telHref = fm.getAttribute("data-tel") || "";
      if (!ok) return;
      ok.innerHTML = "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Boarding request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        ok.appendChild(document.createTextNode("Your email app should open with the request filled in. Or call " + tel + "."));
      } else {
        ok.appendChild(document.createTextNode("Thanks, " + f.get("name") + "! Call " + tel + " and have this ready:\n" + body.slice(2).join("\n") + "\n"));
        var a = document.createElement("a"); a.href = "tel:" + telHref; a.className = "btn btn-red"; a.textContent = "Call " + tel; ok.appendChild(a);
      }
      ok.style.display = "block";
    });
  });
})();
