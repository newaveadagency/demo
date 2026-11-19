/* Twin Oaks Farm – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* hero lines stagger + reveal on scroll */
  var anim = $$("[data-anim]");
  if (still || !("IntersectionObserver" in window)) anim.forEach(function (el) { el.classList.add("in"); });
  else {
    $$(".hero h1 .ln>span, .phero h1 .ln>span").forEach(function (el, i) { el.style.transitionDelay = (0.1 + i * 0.14) + "s"; });
    $$(".cards, .herd, .steps").forEach(function (g) { $$("[data-anim]", g).forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 0.12 + "s"; }); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    anim.forEach(function (el) { io.observe(el); });
  }

  /* counters */
  var counters = $$("[data-count]");
  var run = function (el) {
    var to = +el.getAttribute("data-count"), t0 = null, dur = 1500;
    var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if (!still && "IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* trail line draws itself as you scroll past it */
  var draw = $(".path .draw");
  if (draw && !still && draw.getTotalLength) {
    var len = Math.ceil(draw.getTotalLength());
    draw.style.strokeDasharray = len; draw.style.strokeDashoffset = len;
    var box = draw.closest(".path");
    var upDraw = function () {
      var r = box.getBoundingClientRect(), vh = window.innerHeight;
      var k = Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (vh * 0.6)));
      draw.style.strokeDashoffset = (len * (1 - k)).toFixed(1);
    };
    window.addEventListener("scroll", upDraw, { passive: true }); upDraw();
  } else if (draw) { draw.style.strokeDasharray = "none"; }

  /* parallax on hero photo */
  var plx = $$(".plx");
  if (!still && plx.length) {
    var tick = false;
    var upd = function () {
      plx.forEach(function (img) { var r = img.parentNode.getBoundingClientRect(), vh = window.innerHeight; if (r.bottom < 0 || r.top > vh) return; var p = (r.top + r.height / 2 - vh / 2) / vh; img.style.transform = "scale(1.12) translateY(" + (p * -30).toFixed(1) + "px)"; });
      tick = false;
    };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  }

  /* card tilt + magnetic buttons (mouse only) */
  if (!still && window.matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(800px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* question form -> prepared text message (or email, if data-mail is set) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["interest", "Interested in"], ["level", "Experience"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = "Hi Debbie, a question from the Twin Oaks Farm website.\n" + body.join("\n");
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), sms = fm.getAttribute("data-sms");
      if (mail) location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Twin Oaks Farm: " + f.get("interest")) + "&body=" + encodeURIComponent(text);
      else if (sms) location.href = "sms:" + sms + "?&body=" + encodeURIComponent(text);
      if (ok) { ok.innerHTML = "Thanks, " + String(f.get("name")).replace(/[<>&"]/g, "") + "! Your message app should open with your question ready to send. If it doesn't, call or text <a href=\"tel:+15024322623\">502-432-2623</a>."; ok.style.display = "block"; }
    });
  });
})();
