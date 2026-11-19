/* Pekara Edi – demo. Bez vanjskih biblioteka. */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var editing = document.documentElement.classList.contains("cms-edit") || /uredi\.html/.test(location.pathname);

  /* 1. zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  function onScroll() { if (nav) nav.classList.toggle("small", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* 2. otkrivanje pri skrolanju + ulazak naslova u heroju (riječ po riječ) */
  var items = $$("[data-anim]");
  var hero = $(".hero");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    if (hero) hero.classList.add("go");
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
    if (hero) setTimeout(function () { hero.classList.add("go"); }, 150);
  }

  /* 3. brojači */
  function countUp(el) {
    var end = parseInt(el.getAttribute("data-count"), 10) || 0;
    var start = end > 1000 ? end - 60 : 0, t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(start + (end - start) * e));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if (!reduce && "IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* 4. paralaksa hero fotografije + 5. vremenska crta koja se crta pri skrolanju */
  var px = $("[data-parallax]");
  var tl = $("[data-tl]"), tlPath = null, tlLen = 0;
  if (tl) {
    var svg = $("svg.line", tl);
    var base = $("path", svg);
    tlPath = base.cloneNode();
    tlPath.setAttribute("class", "draw");
    svg.appendChild(tlPath);
  }
  function sizeTl() {
    if (!tl) return;
    var h = tl.offsetHeight;
    var svg = $("svg.line", tl);
    svg.setAttribute("viewBox", "0 0 24 " + h);
    $$("path", svg).forEach(function (p) { p.setAttribute("d", "M12 0 V" + h); });
    tlLen = h;
    tlPath.style.strokeDasharray = h + " " + h;
  }
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    if (px) {
      var r = px.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) px.style.transform = "translate3d(0," + ((r.top - vh / 2) * -0.08).toFixed(1) + "px,0)";
    }
    if (tl && tlPath) {
      var b = tl.getBoundingClientRect();
      var prog = Math.min(Math.max((vh * 0.75 - b.top) / b.height, 0), 1);
      tlPath.style.strokeDashoffset = String(tlLen * (1 - prog));
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  if (!reduce && !editing) {
    sizeTl();
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", function () { sizeTl(); req(); });
    window.addEventListener("load", function () { sizeTl(); req(); });
    req();
  }

  /* 6. mrlja (sunce) iza heroja mijenja oblik */
  var blob = $("[data-morph]");
  if (blob && !reduce && !editing) {
    var pts = 8, t = 0;
    var morph = function () {
      t += 0.006;
      var d = "", cx = 300, cy = 300, i, pt = [];
      for (i = 0; i < pts; i++) {
        var a = (i / pts) * Math.PI * 2;
        var rr = 235 + Math.sin(t * 2 + i * 1.7) * 18 + Math.cos(t * 1.3 + i) * 12;
        pt.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      for (i = 0; i < pts; i++) {
        var p0 = pt[i], p1 = pt[(i + 1) % pts];
        var mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
        if (i === 0) d += "M" + ((pt[pts - 1][0] + p0[0]) / 2).toFixed(1) + "," + ((pt[pts - 1][1] + p0[1]) / 2).toFixed(1);
        d += "Q" + p0[0].toFixed(1) + "," + p0[1].toFixed(1) + " " + mx.toFixed(1) + "," + my.toFixed(1);
      }
      blob.setAttribute("d", d + "Z");
      requestAnimationFrame(morph);
    };
    requestAnimationFrame(morph);
  }

  /* 7. nagib kartice proizvoda prema kursoru */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".pcard").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* galerija – strelice */
  var strip = $(".strip");
  $$("[data-strip]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!strip) return;
      strip.scrollBy({ left: parseInt(b.getAttribute("data-strip"), 10) * Math.min(440, strip.clientWidth * 0.8), behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* filtri proizvoda */
  var fbtn = $$("[data-filter]");
  fbtn.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      fbtn.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".pcard[data-cat]").forEach(function (c) {
        var show = f === "sve" || c.getAttribute("data-cat") === f;
        c.classList.toggle("hide", !show);
        if (show) c.classList.add("in");
      });
    });
  });

  /* obrazac – složi SMS odabranoj poslovnici (pekara nema javni e-mail); s data-mail šalje e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm);
      var sel = fm.querySelector("select[name=poslovnica]");
      var where = sel ? sel.options[sel.selectedIndex].text.split(" · ")[0] : "";
      var text = "Poruka s weba (" + where + ")\n" + f.get("poruka") + "\n\n" + f.get("ime") + ", tel. " + f.get("telefon");
      var to = (sel && sel.value) || fm.getAttribute("data-sms");
      if (fm.getAttribute("data-mail")) location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Upit s weba – " + f.get("ime")) + "&body=" + encodeURIComponent(text);
      else location.href = "sms:" + to + "?&body=" + encodeURIComponent(text);
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
