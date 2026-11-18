/* Katavić-PVC – zajednička skripta */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  var onNav = function () { if (nav) nav.classList.toggle("small", window.scrollY > 30 || ($(".menu.open") !== null)); };
  window.addEventListener("scroll", onNav, { passive: true }); onNav();

  /* izbornik na mobitelu */
  var burger = $(".burger");
  if (burger) burger.addEventListener("click", function () {
    var m = $(".menu"); m.classList.toggle("open"); burger.setAttribute("aria-expanded", m.classList.contains("open")); onNav();
  });
  $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { $(".menu").classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }); });

  /* brojači */
  var count = function (el) {
    var to = +el.dataset.count, suf = el.dataset.suffix || "", t0 = null;
    if (still || !to) { el.textContent = to + suf; return; }
    var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  /* otkrivanje pri skrolanju (riječi, fade-up, clip-path, scale, crtanje linije) */
  var reveal = function (el) { el.classList.add("in"); $$("[data-count]", el).forEach(count); };
  var targets = $$("[data-anim]");
  if (still || !("IntersectionObserver" in window)) targets.forEach(reveal);
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* reflektor koji prati kursor u heroju */
  $$(".hero, .phero").forEach(function (h) {
    if (!fine || still) return;
    h.addEventListener("pointermove", function (e) { var r = h.getBoundingClientRect(); h.style.setProperty("--mx", (e.clientX - r.left) + "px"); h.style.setProperty("--my", (e.clientY - r.top) + "px"); });
  });

  /* magnetni gumbi */
  if (fine && !still) $$(".mag").forEach(function (b) {
    b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.25) + "px," + ((e.clientY - r.top - r.height / 2) * 0.35) + "px)"; });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });

  /* nagib kartica */
  if (fine && !still) $$(".tilt").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(800px) rotateX(" + (-y * 8) + "deg) rotateY(" + (x * 10) + "deg) translateY(-4px)"; });
    c.addEventListener("pointerleave", function () { c.style.transform = ""; });
  });

  /* paralaksa + vodoravna galerija vezana uz skrolanje */
  var pars = $$(".par");
  var hs = $(".hs"), track = hs && $(".hs-track", hs), bar = hs && $(".hs-bar", hs);
  var wide = window.matchMedia("(min-width: 900px)");
  var hz = false;
  var setupHz = function () {
    hz = !!(hs && wide.matches && !still);
    root.classList.toggle("hz", hz);
    if (!hs) return;
    if (hz) { var extra = Math.max(track.scrollWidth - window.innerWidth, 0); hs.style.setProperty("--hsh", (window.innerHeight + extra) + "px"); hs._extra = extra; }
    else { hs.style.removeProperty("--hsh"); track.style.transform = ""; }
  };
  var ticking = false;
  var frame = function () {
    ticking = false;
    var vh = window.innerHeight;
    pars.forEach(function (p) { var r = p.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) p.style.translate = "0 " + ((r.top + r.height / 2 - vh / 2) * (+p.dataset.speed || -0.08)).toFixed(1) + "px"; });
    if (hz) {
      var r = hs.getBoundingClientRect(), total = hs.offsetHeight - vh, p = Math.min(Math.max(-r.top / (total || 1), 0), 1);
      track.style.transform = "translate3d(" + (-p * hs._extra).toFixed(1) + "px,0,0)";
      if (bar) bar.style.setProperty("--p", p.toFixed(3));
    }
  };
  var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  if (!still) {
    setupHz();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { setupHz(); onScroll(); });
    window.addEventListener("load", function () { setupHz(); onScroll(); });
    frame();
  }
  if (track && !hz) track.addEventListener("scroll", function () { if (bar) bar.style.setProperty("--p", (track.scrollLeft / Math.max(track.scrollWidth - track.clientWidth, 1)).toFixed(3)); }, { passive: true });

  /* reference: filter + povećanje */
  var links = $$(".gal a");
  $$(".chips [data-f]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".chips [data-f]").forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
      links.forEach(function (a) { a.hidden = !(b.dataset.f === "sve" || a.dataset.cat === b.dataset.f); if (!a.hidden) a.classList.add("in"); });
    });
  });
  if (links.length) {
    var lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Povećana fotografija");
    lb.innerHTML = '<img alt=""><button class="x" aria-label="Zatvori">×</button><button class="p" aria-label="Prethodna">‹</button><button class="n" aria-label="Sljedeća">›</button><div class="c"></div>';
    document.body.appendChild(lb);
    var cur = 0, last = null;
    var vis = function () { return links.filter(function (a) { return !a.hidden; }); };
    var show = function (i) { var v = vis(); cur = (i + v.length) % v.length; var a = v[cur]; $("img", lb).src = a.getAttribute("href"); $("img", lb).alt = $("img", a).alt; $(".c", lb).textContent = (cur + 1) + " / " + v.length; lb.classList.add("open"); $(".x", lb).focus(); };
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    links.forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); last = a; show(vis().indexOf(a)); }); });
    $(".x", lb).onclick = close; $(".p", lb).onclick = function () { show(cur - 1); }; $(".n", lb).onclick = function () { show(cur + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (!lb.classList.contains("open")) return; if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
  }

  /* upit → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["place", "Mjesto ugradnje"], ["service", "Zanima me"], ["message", "Opis i mjere"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za ponudu: " + (f.get("service") || "stolarija") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice katavic-pvc.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
