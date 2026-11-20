/* West Mountain Inn – site script */
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

  /* header shrinks on scroll + parallax on hero / barn photos (rAF, passive) */
  var plx = $$(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (!reduce) plx.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -0.1).toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – the final value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 60 : 0, t0 = null, dur = 1800;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* SVG line lengths for the drawing animation */
  $$(".draw path.ln-draw, .tl-line path").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 10); } catch (e) {}
  });

  /* reveal on scroll with a small stagger between siblings */
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
    $$(".hero-h [data-anim], .page-hero h1 [data-anim]").forEach(function (el, i) { io.unobserve(el); el.style.transitionDuration = "1.1s"; setTimeout(function () { el.classList.add("in"); }, 150 + i * 170); });
  }

  /* gentle 3D tilt on cards + magnetic buttons (pointer devices only) */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateY(" + (x * 5).toFixed(2) + "deg) rotateX(" + (-y * 5).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* FAQ: smooth open/close */
  $$(".faq details").forEach(function (d) {
    var s = $("summary", d), a = $(".ans", d);
    if (!s || !a || reduce || !a.animate) return;
    s.addEventListener("click", function (e) {
      e.preventDefault();
      if (d.open) { var h = a.scrollHeight; a.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 320, easing: "ease" }).onfinish = function () { d.open = false; }; }
      else { d.open = true; var h2 = a.scrollHeight; a.animate([{ height: "0px", opacity: 0 }, { height: h2 + "px", opacity: 1 }], { duration: 380, easing: "ease" }); }
    });
  });

  /* rooms filter */
  var fb = $$(".filter button"), rooms = $$(".room-grid .card");
  fb.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      fb.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      rooms.forEach(function (c) {
        var show = f === "all" || (" " + (c.getAttribute("data-tags") || "") + " ").indexOf(" " + f + " ") > -1;
        c.classList.toggle("hide", !show);
        if (show && !reduce && c.animate) c.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "ease-out" });
      });
    });
  });

  /* date fields: departure can't be before arrival */
  $$("form.lead-form").forEach(function (fm) {
    var a = fm.querySelector("[name=arrival]"), d = fm.querySelector("[name=departure]");
    var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    if (a) a.min = today.toISOString().slice(0, 10);
    if (a && d) a.addEventListener("change", function () { d.min = a.value; if (d.value && d.value < a.value) d.value = ""; });
  });

  /* inquiry forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["arrival", "Arrival"], ["departure", "Departure"], ["date", "Preferred date"], ["guests", "Guests"], ["room", "Room preference"], ["type", "Type of celebration"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var subj = (fm.getAttribute("data-subject") || "Stay request") + " – " + f.get("name");
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from westmountaininn.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
