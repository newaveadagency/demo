/* XForm fitness centar – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje pri skrolanju */
  var hdr = $(".hdr");
  function onHdr() { if (hdr) hdr.classList.toggle("small", window.scrollY > 40); }
  onHdr();

  /* naslov: riječi jedna za drugom */
  $$(".hero h1 [data-anim], .phero h1 [data-anim]").forEach(function (w, i) {
    if (reduce) { w.classList.add("in"); return; }
    w.style.transitionDelay = (0.12 + i * 0.09) + "s";
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add("in"); }); });
  });

  /* otkrivanje pri skrolanju */
  var items = $$("[data-anim]").filter(function (el) { return !el.closest("h1"); });
  if (reduce || !("IntersectionObserver" in window)) items.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [el];
        el.style.transitionDelay = Math.min(sib.indexOf(el), 5) * 0.08 + "s";
        el.classList.add("in"); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* brojači */
  var counters = $$("[data-count]");
  function runCount(el) {
    var to = +el.dataset.count, t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }
  if (!reduce && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* paralaksa + vodoravna galerija (jedan rAF) */
  var par = $("[data-parallax]"), hg = $(".hgal"), track = hg && $(".hgal-track", hg), ticking = false;
  function setupGal() {
    if (!hg || !track || reduce) return;
    var wide = window.innerWidth > 900;
    hg.classList.toggle("pinned", wide);
    if (!wide) { track.style.transform = ""; return; }
    var dist = Math.max(0, track.scrollWidth - window.innerWidth + 40);
    hg.dataset.dist = dist;
    hg.style.setProperty("--hh", (window.innerHeight + dist) + "px");
  }
  function frame() {
    ticking = false; onHdr();
    var y = window.scrollY;
    if (par && !reduce && y < window.innerHeight * 1.2) par.style.transform = "translate3d(0," + (y * 0.28) + "px,0) scale(1.06)";
    if (hg && hg.classList.contains("pinned")) {
      var r = hg.getBoundingClientRect(), dist = +hg.dataset.dist || 0;
      var p = Math.min(Math.max(-r.top / Math.max(1, r.height - window.innerHeight), 0), 1);
      track.style.transform = "translate3d(" + (-p * dist) + "px,0,0)";
    }
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener("resize", function () { setupGal(); frame(); });
  window.addEventListener("load", function () { setupGal(); frame(); });
  setupGal(); frame();

  /* magnetni gumbi i nagib kartica (samo miš) */
  if (fine && !reduce) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3) + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateY(" + (x * 7) + "deg) rotateX(" + (-y * 7) + "deg)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* otvoreno sada (Pon–Pet 07:30–22, Sub 09–21, Ned 17–21, vrijeme u Hrvatskoj) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = +g("hour") + g("minute") / 60;
      var o = d === "Sat" ? [9, 21] : d === "Sun" ? [17, 21] : [7.5, 22];
      el.textContent = h >= o[0] && h < o[1] ? "Sada otvoreno, do " + o[1] + ":00" : "Trenutno zatvoreno";
    } catch (e) {}
  });

  /* kartice rasporeda */
  var tabs = $$('[role="tab"]');
  function sel(t) {
    tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; var p = document.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !on; });
  }
  if (tabs.length) {
    sel(tabs[0]);
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(t); });
      t.addEventListener("keydown", function (e) { var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (n) { var k = tabs[(i + n + tabs.length) % tabs.length]; sel(k); k.focus(); } });
    });
  }

  /* obrazac → pripremljena e-pošta */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime"], ["phone", "Telefon"], ["email", "E-mail"], ["service", "Zanima me"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + (f.get("service") || "XForm") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice XForm fitness centra");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
