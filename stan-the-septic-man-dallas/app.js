/* Stan the Septic Man – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* word-by-word light-up for the big statement (spans added at runtime only) */
  var words = $$('[data-anim="words"]');
  if (!reduce) {
    words.forEach(function (p) {
      var txt = p.textContent.trim().split(/\s+/);
      p.textContent = "";
      txt.forEach(function (w, i) { var s = document.createElement("span"); s.className = "w"; s.textContent = w; p.appendChild(s); if (i < txt.length - 1) p.appendChild(document.createTextNode(" ")); });
    });
  }

  /* scroll: shrinking header, parallax, badge spin, word light-up (rAF + passive) */
  var plx = $$(".plx"), spin = $(".hero-badge .spin"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        plx.forEach(function (im) {
          var r = im.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < vh) im.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -0.07).toFixed(1) + "px,0) scale(1.14)";
        });
        if (spin) spin.style.transform = "rotate(" + (y * 0.2).toFixed(1) + "deg)";
        words.forEach(function (p) {
          var r = p.getBoundingClientRect(), ws = $$(".w", p);
          var prog = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
          var n = Math.round(prog * ws.length);
          ws.forEach(function (w, i) { w.classList.toggle("lit", i < n); });
        });
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  /* counters (final value already in HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1600;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* svg line length for drawing */
  $$(".pipe path.flow").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.1 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 200 + i * 160); });
  }
  onScroll();

  /* magnetic buttons (desktop pointer only) */
  if (!reduce && fine) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* FAQ: one open at a time */
  $$(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".faq details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* request form: email if an address is set, otherwise show a call summary */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["town", "Town"], ["service", "Service"], ["message", "Details"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Septic request: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the request filled in. For emergencies call " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Have this handy and call Stan at " + tel + ":\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
