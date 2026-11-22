/* Davis Memorial Mortuary – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", $(".nav-in").getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + parallax (rAF, passive listener) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (p) {
        var r = p.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) p.style.transform = "translate3d(0," + ((r.top) * -0.15).toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – final value stays in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1700, fmt = function (n) { return n.toLocaleString("en-US"); };
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(end * e)); if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll with sibling stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 180); });
  }

  /* cursor spotlight on glass cards */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".spot").forEach(function (c) {
      c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
      c.addEventListener("pointerleave", function () { c.style.setProperty("--mx", "-500px"); c.style.setProperty("--my", "-500px"); });
    });
  }

  /* only one FAQ open at a time */
  $$(".acc details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".acc details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* call-back form → prepared email (falls back to a phone call when no address is set) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["topic", "Topic"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var mail = fm.getAttribute("data-mail");
      if (!mail) { location.href = "tel:+13347565080"; return; }
      location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Call-back request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Davis Memorial Mortuary website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
