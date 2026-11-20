/* Palomino Motel – site script */
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

  /* SVG line drawing: measure each path so the dash covers its length */
  $$(".sign-arc path, .road .dr").forEach(function (p) {
    try { var l = Math.ceil(p.getTotalLength()) + 4; p.style.setProperty("--len", l); } catch (e) {}
  });

  /* shrinking header + parallax on photos (rAF, passive scroll) */
  var plx = $$(".plx, .plx2"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          var k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          im.style.transform = "translate3d(0," + (k * -8).toFixed(2) + "%,0) scale(1.12)";
        }
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1100;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.max(1, Math.round(end * e)); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    el.textContent = "1"; requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero sign: neon letters flicker on one after another */
    $$(".sign-word [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 250 + i * 110); });
    $$(".page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 150); });
  }

  /* room cards: gentle 3D tilt that follows the pointer */
  if (!reduce && matchMedia("(hover:hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* FAQ: keep one answer open at a time */
  $$(".q-list details").forEach(function (d, _, all) {
    d.addEventListener("toggle", function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* room request form: e-mail if an address is set, otherwise a summary + call button */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["arrive", "Arriving"], ["nights", "Nights"], ["guests", "Guests"], ["beds", "Beds"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "", telHref = fm.getAttribute("data-tel") || "";
      ok.textContent = "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Room request: " + f.get("arrive") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        ok.appendChild(document.createTextNode("Your email app should open with the request filled in. Or call " + tel + "."));
      } else {
        ok.appendChild(document.createTextNode("Thanks, " + f.get("name") + ". Call the front office with these details:\n" + body.join("\n") + "\n\n"));
        var a = document.createElement("a"); a.href = "tel:" + telHref; a.textContent = "Call " + tel; ok.appendChild(a);
      }
      ok.style.display = "block";
    });
  });
})();
