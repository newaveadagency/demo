/* D & S Tow, Inc. – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* counters */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1500;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* scroll reveal (fade-up, clip-path, kinetic lines) */
  var revealAll = function () { $$("[data-anim]").forEach(function (el) { el.classList.add("in"); }); };
  if (reduce || !("IntersectionObserver" in window)) revealAll();
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [], i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i * 90, 450) + "ms";
        el.classList.add("in");
        $$("[data-count]", el).concat(el.hasAttribute("data-count") ? [el] : []).forEach(count);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    /* hero: kinetic entrance on load (lines rise one after another, then copy) */
    var heroEls = $$(".hero [data-anim], .phero [data-anim]");
    heroEls.forEach(function (el, i) { el.style.transitionDelay = (120 + i * 130) + "ms"; });
    requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }); });
    $$("[data-anim]").forEach(function (el) { if (heroEls.indexOf(el) < 0) io.observe(el); });
  }

  /* rotating word */
  var rw = $(".rot-w");
  if (rw && !reduce) {
    var words = $$("span", rw), cur = 0;
    rw.classList.add("on"); words[0].classList.add("cur");
    setInterval(function () {
      var prev = words[cur]; prev.classList.remove("cur"); prev.classList.add("out");
      setTimeout(function () { prev.classList.remove("out"); }, 460);
      cur = (cur + 1) % words.length; words[cur].classList.add("cur");
    }, 2100);
  }

  /* shrinking header + pinned horizontal gallery (rAF, passive scroll) */
  var nav = $(".nav"), hg = $(".hgal"), track = hg && $(".hgal-track", hg), ticking = false, pinned = false;
  function setupPin() {
    if (!hg || !track) return;
    var want = !reduce && window.innerWidth > 760;
    if (want) {
      hg.classList.add("pin");
      var dist = track.scrollWidth - window.innerWidth;
      hg.style.setProperty("--h", (window.innerHeight + Math.max(dist, 0)) + "px");
      pinned = dist > 0;
    } else { hg.classList.remove("pin"); hg.style.removeProperty("--h"); track.style.transform = ""; pinned = false; }
  }
  function onScroll() {
    var y = window.pageYOffset || 0;
    if (nav) nav.classList.toggle("small", y > 40);
    if (pinned) {
      var r = hg.getBoundingClientRect(), total = hg.offsetHeight - window.innerHeight;
      var p = Math.min(Math.max(-r.top / total, 0), 1);
      track.style.transform = "translate3d(" + (-p * (track.scrollWidth - window.innerWidth)) + "px,0,0)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", function () { setupPin(); onScroll(); });
  window.addEventListener("load", function () { setupPin(); onScroll(); });
  setupPin(); onScroll();

  /* magnetic buttons + card tilt (desktop pointers only) */
  if (fine && !reduce) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .18) + "px," + ((e.clientY - r.top - r.height / 2) * .28) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(800px) rotateY(" + (x * 10) + "deg) rotateX(" + (-y * 10) + "deg) translateY(-6px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["position", "Position"], ["license", "Driver license"], ["message", "About me"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Application: " + (f.get("position") || "D & S Tow") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from dstow.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
