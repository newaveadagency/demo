/* Kookē – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* squiggle under the headline: measure so the dash covers the whole path */
  $$(".squig path").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 2); } catch (e) {}
  });

  /* shrinking header + floating sprinkles parallax (rAF, passive scroll) */
  var spr = $$(".sprinkles i"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 30);
      if (!reduce && y < 1400) spr.forEach(function (s, i) {
        var k = (i % 3 + 1) * 0.12 * (i % 2 ? 1 : -1);
        s.style.translate = "0 " + (y * k).toFixed(1) + "px";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* reveal on scroll, staggered between siblings; hero words pop in one by one */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ""; }, 1800);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".hero h1 .w, .page-hero h1 .w").forEach(function (w, i) { w.style.transitionDelay = (0.12 + i * 0.09) + "s"; });
    items.forEach(function (el) { io.observe(el); });
  }

  /* card tilt that follows the pointer (desktop only) */
  if (!reduce && matchMedia("(hover:hover)").matches) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transition = "transform .15s ease-out"; c.style.transform = "perspective(800px) rotateX(" + (-y * 7).toFixed(2) + "deg) rotateY(" + (x * 9).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transition = ""; c.style.transform = ""; });
    });
  }

  /* FAQ: one answer open at a time */
  $$(".faq details").forEach(function (d, _, all) {
    d.addEventListener("toggle", function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* order form: opens a prepared e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["item", "Order"], ["date", "Date"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Order request: " + (f.get("item") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the order filled in. For same-day orders, call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Please call " + tel + " with these details:\n" + body.join("\n"); ok.style.display = "block";
      }
    });
  });
})();
