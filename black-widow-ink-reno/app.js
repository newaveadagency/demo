/* Black Widow Ink – site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover: hover)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* shrinking header + panorama parallax (rAF, passive scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          plx.style.transform = "translate3d(" + (p * -40).toFixed(1) + "px,0,0) scale(1.12)";
        }
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* reveal on scroll with stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 160); });
  }

  /* magnetic primary buttons */
  if (!reduce && hover) {
    $$(".btn-red").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* hero web follows the cursor slightly */
  var hero = $(".hero"), web = $(".web");
  if (hero && web && hover && !reduce) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      web.style.transform = "translate(" + (x * -24).toFixed(1) + "px," + (y * -18).toFixed(1) + "px) rotate(" + (x * 4).toFixed(2) + "deg)";
    });
  }

  /* portfolio filter */
  var fbtn = $$(".filters button");
  fbtn.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      fbtn.forEach(function (x) { x.classList.toggle("on", x === b); });
      $$(".gal-full .tile").forEach(function (t) {
        var show = f === "all" || t.getAttribute("data-cat") === f;
        t.classList.toggle("hide", !show);
        if (show) { t.classList.add("in"); t.classList.remove("pop"); t.getBoundingClientRect(); if (!reduce) t.classList.add("pop"); }
      });
    });
  });

  /* lightbox */
  var lb = $(".lb");
  if (lb) {
    var lbImg = $("img", lb), last = null;
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    $$(".gal a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (document.documentElement.classList.contains("cms-edit")) return;
        e.preventDefault(); last = a;
        var im = $("img", a); lbImg.src = a.getAttribute("href"); lbImg.alt = im ? im.alt : "";
        lb.classList.add("open"); $("button", lb).focus();
      });
    });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "BUTTON") close(); });
    addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) close(); });
  }

  /* open / closed status (listed hours, Pacific time) */
  var H = { Sun: [11.5, 18], Wed: [11.5, 22], Thu: [11.5, 22], Fri: [11, 22], Sat: [11, 22] };
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, s = H[d];
      var open = !!s && h >= s[0] && h < s[1];
      el.textContent = open ? "Open now · until " + (s[1] === 22 ? "10 pm" : "6 pm") : "Closed now · send a request";
      el.classList.toggle("open", open); el.classList.toggle("closed", !open);
    } catch (e) {}
  });

  /* tattoo request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["placement", "Placement"], ["size", "Approx. size"], ["style", "Style"], ["idea", "Idea"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Tattoo request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Black Widow Ink website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
