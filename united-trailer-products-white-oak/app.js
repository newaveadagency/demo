/* United Trailer Products – site script */
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

  /* scroll: shrinking header, hero parallax, rotating seal, road line drawing (one rAF, passive) */
  var plx = $(".plx"), seal = $(".s-rot"), road = $(".road-line"), roadLen = 0, ticking = false;
  if (road && road.getTotalLength) { roadLen = road.getTotalLength(); }
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 60);
      if (!reduce) {
        if (plx) {
          var r = plx.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < vh) plx.style.transform = "translate3d(0," + ((r.top - vh / 2) * -0.08 - 20).toFixed(1) + "px,0)";
        }
        if (seal) seal.style.transform = "rotate(" + (y * 0.25).toFixed(1) + "deg)";
        if (road && roadLen) {
          var rr = road.ownerSVGElement.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh - rr.top) / (vh * 0.9)));
          road.style.strokeDashoffset = "0";
          road.style.clipPath = "inset(0 " + ((1 - p) * 100).toFixed(1) + "% 0 0)";
        }
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* counters (final value already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end > 1000 ? end - 43 : 0, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll with a small stagger */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 5) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 130); });
  }

  /* card tilt */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, yy = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(800px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-yy * 6).toFixed(2) + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* shop open / closed (Mon–Fri 8:00–17:00, Central time) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60, open = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1 && h >= 8 && h < 17;
      el.textContent = open ? "Shop open now · until 5:00 pm" : "Shop closed now · open Mon–Fri, 8:00 am – 5:00 pm";
      if (open && el.parentNode) el.parentNode.classList.add("is-open");
    } catch (e) {}
  });

  /* gallery filter + lightbox */
  var chips = $$(".chip"), gItems = $$(".g-item");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (x) { x.classList.toggle("on", x === c); });
      var f = c.getAttribute("data-f");
      gItems.forEach(function (g) { var show = f === "all" || g.getAttribute("data-cat") === f; g.classList.toggle("hide", !show); if (show) g.classList.add("in"); });
    });
  });
  var lb = $(".lb");
  if (lb) {
    var lbImg = $("img", lb), lbCap = $("figcaption", lb), cur = 0, last = null;
    var vis = function () { return gItems.filter(function (g) { return !g.classList.contains("hide"); }); };
    var show = function (i) { var v = vis(); cur = (i + v.length) % v.length; var im = $("img", v[cur]); lbImg.src = im.src; lbImg.alt = im.alt; lbCap.textContent = im.alt; };
    var close = function () { lb.hidden = true; document.body.style.overflow = ""; if (last) last.focus(); };
    gItems.forEach(function (g) { $(".g-btn", g).addEventListener("click", function () { last = this; show(vis().indexOf(g)); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lb-x", lb).focus(); }); });
    $(".lb-x", lb).addEventListener("click", close);
    $(".lb-p", lb).addEventListener("click", function () { show(cur - 1); });
    $(".lb-n", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    addEventListener("keydown", function (e) { if (lb.hidden) return; if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
  }

  /* forms → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [], apply = fm.getAttribute("data-kind") === "apply";
      [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["trailer", "Trailer type"], ["service", "Service"], ["haul", "Hauls"], ["message", apply ? "Experience" : "Problem"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var subj = apply ? "Application: Mechanic / Welder – " + f.get("name") : "Repair request: " + (f.get("trailer") || "") + " trailer – " + f.get("name");
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n") + (apply ? "\n\n(Resume attached)" : ""));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
