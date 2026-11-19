/* Muzički Atelje – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { if (menu) menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o);
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje, traka napretka, vodoravna galerija */
  var nav = $(".nav"), bar = $(".progress"), hs = $(".hs"), track = hs ? $(".track", hs) : null, ticking = false;
  var pinned = false;
  function setupPin() {
    if (!hs || !track) return;
    pinned = !reduce && window.innerWidth > 900;
    hs.classList.toggle("pin", pinned);
    if (pinned) {
      var extra = track.scrollWidth - window.innerWidth;
      hs.style.height = (window.innerHeight + Math.max(extra, 0)) + "px";
    } else { hs.style.height = ""; track.style.transform = ""; }
  }
  function onScroll() {
    var y = window.pageYOffset, h = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0).toFixed(4) + ")";
    if (pinned) {
      var r = hs.getBoundingClientRect(), max = hs.offsetHeight - innerHeight;
      var p = Math.min(Math.max(-r.top / (max || 1), 0), 1);
      track.style.transform = "translate3d(" + (-(track.scrollWidth - innerWidth) * p).toFixed(1) + "px,0,0)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", function () { setupPin(); onScroll(); });
  window.addEventListener("load", function () { setupPin(); onScroll(); });
  setupPin(); onScroll();

  /* kinetička riječ u naslovu */
  $$("[data-rotate]").forEach(function (el) {
    var words = $$("span", el);
    if (words.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      words[i].classList.remove("cur");
      i = (i + 1) % words.length;
      el.classList.remove("go"); void el.offsetWidth; el.classList.add("go");
      words[i].classList.add("cur");
    }, 2200);
  });

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1500, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.08) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
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
    counters.forEach(function (el) { el.textContent = "0"; co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* magnetni gumbi + sjaj koji prati kursor na karticama */
  if (fine && !reduce) {
    $$(".btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
    $$(".path,.inst").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
        c.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
        if (c.classList.contains("path")) c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 7).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 9).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* cjenik: kartice */
  var tabs = $(".tabs");
  if (tabs) {
    var groups = $$("[data-group]");
    function show(k) {
      $$("button", tabs).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.t === k); });
      groups.forEach(function (g) { g.hidden = !(k === "sve" || g.dataset.group === k); });
    }
    $$("button", tabs).forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.t); }); });
    var h = location.hash.slice(1);
    if (h && $('button[data-t="' + h + '"]', tabs)) show(h);
  }

  /* obrazac za upis → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["who", "Polaznik"], ["instrument", "Instrument / predmet"], ["program", "Program"], ["location", "Lokacija"], ["message", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za upis – " + (f.get("instrument") || "Muzički Atelje") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s muzickiatelje.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
