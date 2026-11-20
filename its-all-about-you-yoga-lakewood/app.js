/* It's All About You, Yoga Studio – site script */
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

  /* lotus line drawing: dash length = path length */
  $$(".lotus-draw path").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 4); } catch (e) {}
  });

  /* horizontal gallery pinned to vertical scroll (desktop only) */
  var gal = $(".hgal"), track = gal && $(".hgal-track", gal), bar = gal && $(".bar", gal), galOn = false, galDist = 0;
  function setupGal() {
    if (!gal || !track) return;
    var want = !reduce && innerWidth > 900;
    gal.classList.toggle("pin", want); galOn = want;
    track.style.transform = "";
    if (!want) { gal.style.removeProperty("--hh"); return; }
    galDist = Math.max(0, track.scrollWidth - innerWidth + Math.max(20, (innerWidth - 1180) / 2) + 40);
    gal.style.setProperty("--hh", (innerHeight + galDist) + "px");
  }
  setupGal();
  addEventListener("resize", function () { setupGal(); onScroll(); });

  /* scroll: shrinking header, gallery progress */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (galOn) {
        var r = gal.getBoundingClientRect(), tot = r.height - innerHeight;
        var p = tot > 0 ? Math.min(1, Math.max(0, -r.top / tot)) : 0;
        track.style.transform = "translate3d(" + (-p * galDist).toFixed(1) + "px,0,0)";
        if (bar) bar.style.setProperty("--p", p.toFixed(3));
      } else if (gal && bar) {
        var v = $(".hgal-view", gal), m = v.scrollWidth - v.clientWidth;
        bar.style.setProperty("--p", m > 0 ? (v.scrollLeft / m).toFixed(3) : 0);
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (gal) $(".hgal-view", gal).addEventListener("scroll", onScroll, { passive: true });

  /* counters (final value already in HTML) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1200;
    if (end < 2) return;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); else el.textContent = end; }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll with stagger; hero words one after another */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$(":scope > [data-anim]", el.parentNode), i = Math.max(0, sib.indexOf(el));
        if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".kin .w > span[data-anim]").forEach(function (el, i) { el.style.transitionDelay = (0.15 + i * 0.12) + "s"; });
    items.forEach(function (el) { io.observe(el); });
  }

  /* magnetic buttons + tilt cards (pointer devices only) */
  if (!reduce && matchMedia("(hover:hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .25).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* FAQ: one open at a time */
  $$(".q-list details").forEach(function (d, _, all) {
    d.addEventListener("toggle", function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* booking form: e-mail if an address is set, otherwise a prepared text message */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), lines = ["Hi! I'd like to join a class.", "Name: " + f.get("name"), "Class: " + f.get("cls")];
      if (f.get("date")) lines.push("Date: " + f.get("date"));
      if (f.get("msg")) lines.push("Note: " + f.get("msg"));
      var body = lines.join("\n"), mail = fm.getAttribute("data-mail"), sms = fm.getAttribute("data-sms") || "", ok = $(".ok", fm);
      ok.textContent = ""; ok.style.display = "block";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Class request – " + f.get("name")) + "&body=" + encodeURIComponent(body);
        ok.textContent = "Your email app should open with the request filled in.";
      } else {
        var a = document.createElement("a");
        a.href = "sms:" + sms + "?&body=" + encodeURIComponent(body);
        a.className = "btn btn-grad"; a.textContent = "Open my text message";
        ok.appendChild(document.createTextNode("Thanks, " + f.get("name") + "! Your message is ready:\n\n" + body + "\n\n"));
        ok.appendChild(a);
        location.href = a.href;
      }
    });
  });
})();
