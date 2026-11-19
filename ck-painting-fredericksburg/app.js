/* C&K Painting Services – site script (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o);
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 30); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* hero words: stagger */
  $$('[data-anim="word"]').forEach(function (w, i) { w.style.transitionDelay = (0.08 + i * 0.07) + "s"; });

  /* scroll reveal + counters */
  var count = function (el) {
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0), t0 = null, d = 1400;
    if (reduce) { el.textContent = to; return; }
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / d, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var show = function (el) {
    el.classList.add("in");
    $$("[data-count]", el).forEach(count);
  };
  var items = $$("[data-anim]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el, i) {
      var sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [];
      var k = sib.indexOf(el);
      if (k > 0 && !el.style.transitionDelay) el.style.transitionDelay = Math.min(k * 0.08, 0.5) + "s";
      io.observe(el);
    });
  } else items.forEach(show);

  /* gentle parallax on hero artwork */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var upd = function () {
      var y = window.scrollY;
      par.forEach(function (el) {
        if (y < 1200) {
          $$(".splat", el).forEach(function (s, i) { s.style.transform = "translateY(" + (y * (0.08 + i * 0.05)) + "px) rotate(" + (y * (i % 2 ? -0.03 : 0.04)) + "deg)"; });
        }
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  }

  /* before / after slider */
  var stage = $("#ba-stage");
  if (stage) {
    var range = $("input", stage), bImg = $(".before", stage), aImg = $(".after", stage);
    var set = function (v) { stage.style.setProperty("--x", v + "%"); };
    range.addEventListener("input", function () { set(range.value); });
    var tabs = $$('[role="tab"]');
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); });
        var l = t.getAttribute("data-label");
        bImg.src = t.getAttribute("data-before"); bImg.alt = l + " – before";
        aImg.src = t.getAttribute("data-after"); aImg.alt = l + " – after";
        range.value = 50; set(50);
        if (!reduce) { var v = 50, dir = 1, n = 0; var sw = function () { v += dir * 2.2; if (v > 72 || v < 28) { dir *= -1; n++; } set(v); if (n < 2 || Math.abs(v - 50) > 2) requestAnimationFrame(sw); else { set(50); } }; requestAnimationFrame(sw); }
      });
      t.addEventListener("keydown", function (e) {
        var i = tabs.indexOf(t);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); tabs[(i + 1) % tabs.length].focus(); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); tabs[(i - 1 + tabs.length) % tabs.length].focus(); }
      });
    });
  }

  /* gallery filter + lightbox */
  var fbtn = $$(".filters button"), figs = $$(".gal figure");
  fbtn.forEach(function (b) {
    b.addEventListener("click", function () {
      var c = b.getAttribute("data-f");
      fbtn.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      figs.forEach(function (f) { f.hidden = !(c === "all" || (" " + f.getAttribute("data-cat") + " ").indexOf(" " + c + " ") > -1); });
    });
  });
  var lb = $(".lb");
  if (lb && figs.length) {
    var li = $("img", lb), lp = $("p", lb), cur = 0, last = null;
    var vis = function () { return figs.filter(function (f) { return !f.hidden; }); };
    var open = function (f) {
      var v = vis(); cur = v.indexOf(f); var im = $("img", f);
      li.src = im.src; li.alt = im.alt; lp.textContent = ($("figcaption", f) || {}).textContent || "";
      lb.classList.add("open"); $(".x", lb).focus();
    };
    var go = function (d) { var v = vis(); if (!v.length) return; cur = (cur + d + v.length) % v.length; open(v[cur]); };
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    figs.forEach(function (f) { var b = $("button", f); if (b) b.addEventListener("click", function () { last = b; open(f); }); });
    $(".x", lb).addEventListener("click", close);
    $(".nv.p", lb).addEventListener("click", function () { go(-1); });
    $(".nv.n", lb).addEventListener("click", function () { go(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1);
    });
  }

  /* estimate form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["address", "Street address"], ["zip", "ZIP code"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var sv = f.getAll("service"); if (sv.length) body.push("Services: " + sv.join(", "));
      if (f.get("start")) body.push("Desired start date: " + f.get("start"));
      if (f.get("end")) body.push("Desired end date: " + f.get("end"));
      if (f.get("message")) body.push("", f.get("message"));
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Estimate request – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from ckpaintingservices.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
