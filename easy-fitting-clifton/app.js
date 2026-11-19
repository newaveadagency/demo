/* Easy Fitting – site script */
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

  /* scroll: shrinking header, hero parallax, rotating tape badge (rAF + passive) */
  var plx = $(".plx"), spin = $(".tape .spin"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) {
        if (plx) {
          var r = plx.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (r.top * -0.12).toFixed(1) + "px,0) scale(1.1)";
        }
        if (spin) spin.setAttribute("transform", "rotate(" + (y * 0.2).toFixed(1) + " 60 60)");
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* tape-measure counters: count down from "before" to "after" (final value already in HTML) */
  function fmt(v, dec) { return dec ? v.toFixed(1).replace(/\.0$/, "") : String(Math.round(v)); }
  function measure(box) {
    var el = $("[data-count]", box), bar = $(".bar i", box);
    if (!el) return;
    var to = parseFloat(el.getAttribute("data-count")), from = parseFloat(el.getAttribute("data-from")), dec = String(to).indexOf(".") > -1;
    if (bar) { bar.style.transition = "none"; bar.style.width = "100%"; }
    if (reduce) { if (bar) bar.style.width = (to / from * 100) + "%"; return; }
    var t0 = null, dur = 1800;
    el.textContent = fmt(from, dec);
    requestAnimationFrame(function () { if (bar) { bar.style.transition = ""; bar.style.width = (to / from * 100).toFixed(1) + "%"; } });
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(from + (to - from) * e, dec); if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to, dec); }
    requestAnimationFrame(step);
  }

  /* reveal on scroll, staggered between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); $$(".ms").forEach(measure); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.1 + "s";
        el.classList.add("in"); io.unobserve(el);
        if (el.classList.contains("ms")) setTimeout(function () { measure(el); }, Math.min(i, 6) * 100);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    /* hero lines rise through their mask one after another */
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 120 + i * 170); });
    $$(".hero-fig [data-anim]").forEach(function (el) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 250); });
  }

  /* magnetic buttons (desktop pointer only) */
  if (!reduce && fine) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* gallery rail: arrows + drag to scroll */
  var rail = $(".rail");
  if (rail) {
    var step = function () { var f = $("figure", rail); return f ? f.getBoundingClientRect().width + 18 : 300; };
    var pv = $(".rail-nav .prev"), nx = $(".rail-nav .next");
    if (pv) pv.addEventListener("click", function () { rail.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); });
    if (nx) nx.addEventListener("click", function () { rail.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); });
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add("drag"); });
    addEventListener("pointermove", function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; rail.scrollLeft = sl - dx; });
    addEventListener("pointerup", function () { if (!down) return; down = false; rail.classList.remove("drag"); });
    rail.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener("dragstart", function (e) { e.preventDefault(); });
  }

  /* highlight today's hours */
  var hrs = $("[data-hours]");
  if (hrs) { var d = new Date().getDay(), li = $('[data-d="' + d + '"]', hrs); if (li) { li.classList.add("today"); if (li.nextElementSibling) li.nextElementSibling.classList.add("today"); } }

  /* FAQ: one open at a time */
  $$(".faq details").forEach(function (dt) {
    dt.addEventListener("toggle", function () { if (dt.open) $$(".faq details").forEach(function (o) { if (o !== dt) o.open = false; }); });
  });

  /* request form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["garment", "Garment"], ["date", "Needed by"], ["message", "What should change"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Alteration request: " + (f.get("garment") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Your email app should open with the details filled in. In a hurry? Call or text " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Thanks, " + f.get("name") + ". Call or text Rutika at " + tel + " with these details:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
