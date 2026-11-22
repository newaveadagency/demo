/* Arnie's Place – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + hero parallax (rAF, passive listener) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (-8 + (r.top / innerHeight) * 8).toFixed(2) + "%,0)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll (fade-up, clip-path images, SVG line) with a small stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 140); });
  }

  /* season status (Eastern time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date());
      var g = function (t) { return +((p.filter(function (x) { return x.type === t; })[0] || {}).value); };
      var y = g("year"), m = g("month"), d = g("day");
      var first = new Date(y, 10, 1).getDay(), tg = 1 + ((4 - first + 7) % 7) + 21; /* 4th Thursday of November */
      var txt;
      if ((m >= 4 && m <= 9) || (m === 10 && d <= 15)) txt = "Open for the season · see hours below";
      else if (m === 11 && d < tg) txt = "Ice cream season is over · Christmas trees from Thanksgiving, Nov " + tg;
      else if ((m === 11 && d >= tg) || (m === 12 && d <= 24)) txt = "Christmas trees & wreaths · daily 10 am – 8 pm";
      else txt = "Closed for the season · back in early April";
      el.textContent = txt;
    } catch (e) {}
  });

  /* flavor list: search + category filter */
  var q = $("#q"), chips = $$(".chip[data-f]"), fls = $$(".fl"), cat = "all";
  function filter() {
    var t = (q && q.value || "").trim().toLowerCase();
    fls.forEach(function (f) {
      var okC = cat === "all" || f.getAttribute("data-cat") === cat, okT = !t || f.textContent.toLowerCase().indexOf(t) > -1;
      f.hidden = !(okC && okT);
    });
  }
  if (q) q.addEventListener("input", filter);
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      cat = c.getAttribute("data-f");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      filter();
    });
  });

  /* gentle tilt on gallery photos */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".gal figure, .spec figure").forEach(function (f) {
      f.addEventListener("mousemove", function (e) { var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, yy = (e.clientY - r.top) / r.height - 0.5; f.style.transform = "perspective(900px) rotateY(" + (x * 4).toFixed(2) + "deg) rotateX(" + (-yy * 4).toFixed(2) + "deg)"; });
      f.addEventListener("mouseleave", function () { f.style.transform = ""; });
    });
  }

  /* catering / cake form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["topic", "About"], ["date", "Date"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("topic") || "Question") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the Arnie's Place website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
