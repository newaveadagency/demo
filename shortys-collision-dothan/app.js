/* Shorty's Collision Center – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* scroll: shrinking header + photo parallax (rAF, passive listener) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) var off = (r.top + r.height / 2 - innerHeight / 2) * -0.06; off = Math.max(-r.height * 0.06, Math.min(r.height * 0.06, off)); im.style.transform = "translate3d(0," + off.toFixed(1) + "px,0) scale(1.15)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* reveal on scroll, staggered between siblings; SVG lines draw when in view */
  var items = $$("[data-anim]"), lines = $$(".flow-line");
  if (reduce || !("IntersectionObserver" in window)) {
    items.concat(lines).forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.concat(lines).forEach(function (el) { io.observe(el); });
    /* headline lines rise out of their masks one after another */
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 180); });
    $$(".hero-fig [data-anim]").forEach(function (el) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 200); });
  }

  /* magnetic buttons (mouse only) */
  if (!reduce && fine) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* photo rail: arrows + mouse drag */
  var rail = $(".rail");
  if (rail) {
    var stepW = function () { var f = $("figure", rail); return f ? f.getBoundingClientRect().width + 18 : 300; };
    var pv = $(".rail-nav .prev"), nx = $(".rail-nav .next");
    if (pv) pv.addEventListener("click", function () { rail.scrollBy({ left: -stepW(), behavior: reduce ? "auto" : "smooth" }); });
    if (nx) nx.addEventListener("click", function () { rail.scrollBy({ left: stepW(), behavior: reduce ? "auto" : "smooth" }); });
    var down = false, sx = 0, sl = 0;
    rail.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add("drag"); });
    addEventListener("pointermove", function (e) { if (down) rail.scrollLeft = sl - (e.clientX - sx); });
    addEventListener("pointerup", function () { if (!down) return; down = false; rail.classList.remove("drag"); });
    rail.addEventListener("dragstart", function (e) { e.preventDefault(); });
  }

  /* today's hours */
  var hrs = $("[data-hours]");
  if (hrs) { var li = $('[data-d="' + new Date().getDay() + '"]', hrs); if (li) { li.classList.add("today"); if (li.nextElementSibling) li.nextElementSibling.classList.add("today"); } }

  /* FAQ: one open at a time */
  $$(".faq details").forEach(function (dt) {
    dt.addEventListener("toggle", function () { if (dt.open) $$(".faq details").forEach(function (o) { if (o !== dt) o.open = false; }); });
  });

  /* repair request: prepared email if an address is set, otherwise a summary to read out on the phone */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["vehicle", "Vehicle"], ["claim", "Insurance"], ["message", "Damage"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Repair estimate: " + (f.get("vehicle") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the details filled in. Faster? Call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Call Shorty's at " + tel + " (Mon–Thu 7:30–5) and give them this:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
