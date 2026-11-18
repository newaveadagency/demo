/* Southern Roofing & Insulating Company – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + photo parallax (one rAF loop, passive listener) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    if (nav) nav.classList.toggle("small", window.scrollY > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = "translateY(" + (p * -40).toFixed(1) + "px) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* hero headline lines + stamp: staggered entrance */
  $$(".hero h1 .ln>span[data-anim]").forEach(function (el, i) { setTimeout(function () { el.classList.add("in"); }, 120 + i * 140); });
  $$(".seal[data-anim]").forEach(function (el) { setTimeout(function () { el.classList.add("in"); }, 750); });

  /* counters */
  function count(el) {
    var to = parseInt(el.getAttribute("data-count"), 10);
    if (el.hasAttribute("data-since")) to = new Date().getFullYear() - parseInt(el.getAttribute("data-since"), 10);
    if (isNaN(to)) return;
    if (reduce) { el.textContent = to; return; }
    var from = parseInt(el.getAttribute("data-from") || "0", 10), t0 = null, dur = 1600;
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  /* reveal on scroll */
  var items = $$("[data-anim]").filter(function (el) { return !el.closest(".hero h1") && !el.classList.contains("seal"); });
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentNode ? $$(":scope > [data-anim]", el.parentNode) : [], d = Math.max(0, sib.indexOf(el)) * 90;
        setTimeout(function () { el.classList.add("in"); }, Math.min(d, 450));
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } }); }, { threshold: .6 });
    $$("[data-count]").forEach(function (el) { co.observe(el); });
  } else {
    $$("[data-anim]").forEach(function (el) { el.classList.add("in"); });
    $$("[data-count]").forEach(count);
  }

  /* open / closed (office Mon–Thu 8:30–4:30, Fri 8:30–3:00, Eastern time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60;
      var open = (["Mon", "Tue", "Wed", "Thu"].indexOf(d) > -1 && h >= 8.5 && h < 16.5) || (d === "Fri" && h >= 8.5 && h < 15);
      el.textContent = open ? "● Office open now" : "● Office closed right now";
    } catch (e) {}
  });

  /* estimate form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["address", "Address / town"], ["service", "Service needed"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Free estimate request – " + (f.get("service") || "Roofing") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from southernroofingaugusta.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
