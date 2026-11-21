/* PIPE PLAN d.o.o. – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && window.matchMedia("(hover:hover)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje se smanjuje + paralaksa */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.05;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* nagib kartica + magnetni gumb */
  if (!reduce && hover) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = to > 1000 ? to - 40 : 0, dur = 1400, t0 = null;
    if (reduce) { el.textContent = String(to); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = String(to);
    }
    requestAnimationFrame(step);
  }

  /* SVG cijev: duljina za crtanje */
  $$(".pipe-run path").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {}
  });

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  var heroEls = $$(".hero [data-anim], .page-hero [data-anim]");
  requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }); });
  var targets = $$("[data-anim]").filter(function (el) { return heroEls.indexOf(el) < 0; }), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* kapljica koja putuje kroz cijev */
  function startFlow() {
    window.removeEventListener("scroll", startFlow); window.removeEventListener("pointermove", startFlow);
    $$(".pipe-run").forEach(flow);
  }
  if (!reduce) { window.addEventListener("scroll", startFlow, { passive: true }); window.addEventListener("pointermove", startFlow, { passive: true }); }
  function flow(svg) {
    var path = $("path", svg), dot = $(".flow", svg), len = 0, t0 = null;
    if (!path || !dot) return;
    try { len = path.getTotalLength(); } catch (e) { return; }
    function tick(t) {
      if (!t0) t0 = t;
      var el = (t - t0) / 1000;
      if (el > 0.5) {
        var k = ((el - 0.5) % 7) / 7, pt = path.getPointAtLength(k * len);
        dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
        dot.style.opacity = k < 0.05 ? k * 20 : k > 0.95 ? (1 - k) * 20 : 1;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* prije / poslije klizač */
  $$(".ba").forEach(function (ba) {
    var r = $("input", ba);
    if (!r) return;
    function set() { ba.style.setProperty("--p", r.value + "%"); }
    r.addEventListener("input", set); set();
  });

  /* galerija – povećanje */
  var lb = $(".lb"), figs = $$(".gal figure"), curI = 0;
  function show(i) {
    curI = (i + figs.length) % figs.length;
    var im = $("img", figs[curI]);
    $("img", lb).src = im.getAttribute("src"); $("img", lb).alt = im.alt; $("p", lb).textContent = im.alt;
  }
  if (lb && figs.length) {
    figs.forEach(function (f, i) { $("button", f).addEventListener("click", function () { show(i); lb.classList.add("on"); $(".x", lb).focus(); }); });
    $(".x", lb).addEventListener("click", function () { lb.classList.remove("on"); });
    $(".pv", lb).addEventListener("click", function () { show(curI - 1); });
    $(".nx", lb).addEventListener("click", function () { show(curI + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("on"); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") lb.classList.remove("on");
      if (e.key === "ArrowLeft") show(curI - 1);
      if (e.key === "ArrowRight") show(curI + 1);
    });
  }

  /* obrazac – složi e-mail (data-mail), a bez njega SMS */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["radovi", "Radovi"], ["mjesto", "Mjesto"], ["opis", "Opis"], ["ime", "Ime"], ["tel", "Telefon"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = "Upit s web stranice\n\n" + body.join("\n");
      if (fm.dataset.mail) location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + f.get("radovi") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(text);
      else if (fm.dataset.sms) location.href = "sms:" + fm.dataset.sms + "?&body=" + encodeURIComponent(text);
      fm.classList.add("sent");
    });
  });
})();
