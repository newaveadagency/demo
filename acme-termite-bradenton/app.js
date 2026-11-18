/* ACME Termite & Pest Control – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
  $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { if (menu) menu.classList.remove("open"); }); });

  /* reveal on scroll (hero headline lines are staggered) */
  var anims = $$("[data-anim]");
  $$(".hero h1 [data-anim], .phead h1 [data-anim]").forEach(function (el, i) { el.style.transitionDelay = (0.12 + i * 0.13) + "s"; });
  /* headline words sit inside overflow:hidden lines, so reveal them on load instead of via the observer */
  var heads = $$(".hero h1 [data-anim], .phead h1 [data-anim]");
  setTimeout(function () { heads.forEach(function (el) { el.classList.add("in"); }); }, 60);
  anims = anims.filter(function (el) { return heads.indexOf(el) < 0; });
  if (reduce || !("IntersectionObserver" in window)) anims.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    anims.forEach(function (el) { io.observe(el); });
  }

  /* counters */
  var counters = $$("[data-count]");
  function runCount(el) {
    var end = +el.getAttribute("data-count"), t0 = null;
    if (reduce) { el.textContent = end; return; }
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1600, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
    setTimeout(function () { el.textContent = end; }, 2200);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* kinetic word in hero */
  var kin = $(".kin");
  if (kin && !reduce) {
    var words = $$("span", kin), k = 0;
    setInterval(function () {
      var cur = words[k]; k = (k + 1) % words.length; var nx = words[k];
      cur.classList.remove("on"); cur.classList.add("out");
      nx.classList.remove("out"); nx.classList.add("on");
      setTimeout(function () { cur.classList.remove("out"); }, 500);
    }, 2200);
  }

  /* header shrink + progress + parallax + horizontal gallery (one rAF loop) */
  var nav = $(".nav"), bar = $(".progress"), par = $$("[data-parallax]");
  var gal = $(".hgal"), pin = gal && $(".pin", gal), rail = gal && $(".rail", gal), vp = gal && $(".viewport", gal);
  var galOn = false;
  function setupGallery() {
    if (!gal || !rail) return;
    galOn = !reduce && window.innerWidth > 900;
    gal.classList.toggle("is-pinned", galOn);
    if (galOn) {
      var extra = Math.max(rail.scrollWidth - window.innerWidth + 48, 0);
      pin.style.height = (window.innerHeight + extra) + "px";
    } else { pin.style.height = ""; rail.style.transform = ""; vp.style.overflowX = "auto"; }
    if (galOn) vp.style.overflowX = "";
  }
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset, h = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (bar) bar.style.setProperty("--p", h > 0 ? (y / h).toFixed(4) : 0);
    if (!reduce) par.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var c = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = "translate3d(0," + (c * -9).toFixed(2) + "%,0) scale(1.04)";
    });
    if (galOn) {
      var pr = pin.getBoundingClientRect(), total = pin.offsetHeight - window.innerHeight;
      var p = Math.min(Math.max(-pr.top / (total || 1), 0), 1);
      var max = rail.scrollWidth - window.innerWidth + 48;
      rail.style.transform = "translate3d(" + (-p * max).toFixed(1) + "px,0,0)";
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { setupGallery(); onScroll(); });
  window.addEventListener("load", function () { setupGallery(); onScroll(); });
  setupGallery(); frame();

  /* card tilt + magnetic buttons (mouse only) */
  if (fine && !reduce) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, yy = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateX(" + (-yy * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["service", "Service needed"], ["address", "Property address"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("service") || "Website message") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from the ACME Termite & Pest Control website");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
