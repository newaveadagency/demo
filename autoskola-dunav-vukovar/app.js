/* Autoškola DUNAV-VUKOVAR – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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

  /* zaglavlje, paralaksa, crtanje ceste, horizontalna galerija – jedan rAF */
  var nav = $(".nav"), par = $$("[data-parallax]"), roads = $$("[data-draw]"), ticking = false;
  roads.forEach(function (p) {
    if (reduce || !p.getTotalLength) return;
    var L = p.getTotalLength();
    p.style.strokeDasharray = "28 22";
    var m = p.cloneNode(); m.removeAttribute("data-draw"); m.setAttribute("class", "mask");
    m.style.strokeDasharray = L + " " + L; m.style.strokeDashoffset = 0;
    p.parentNode.appendChild(m); p._mask = m; p._len = L;
  });
  var hs = $("[data-hscroll]"), track = hs && $(".hs-track", hs), bar = hs && $(".hs-bar i", hs), hsOn = false;
  function setupHs() {
    if (!hs) return;
    var want = !reduce && window.innerWidth > 900;
    hs.classList.toggle("pin", want); hsOn = want;
    if (want) { var dist = track.scrollWidth - window.innerWidth + 40; hs.style.height = (window.innerHeight + Math.max(dist, 0)) + "px"; hs._dist = Math.max(dist, 0); }
    else { hs.style.height = ""; track.style.transform = ""; }
  }
  function onScroll() {
    var y = window.pageYOffset, vh = window.innerHeight;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
        if (r.bottom > 0 && r.top < vh) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
      });
      roads.forEach(function (p) {
        if (!p._mask) return;
        var r = p.ownerSVGElement.getBoundingClientRect();
        var t = Math.min(Math.max((vh - r.top) / (r.height + vh * 0.4), 0), 1);
        p._mask.style.strokeDashoffset = (-p._len * t).toFixed(1);
      });
    }
    if (hsOn) {
      var hr = hs.getBoundingClientRect(), prog = Math.min(Math.max(-hr.top / (hs._dist || 1), 0), 1);
      track.style.transform = "translate3d(" + (-prog * hs._dist).toFixed(1) + "px,0,0)";
      if (bar) bar.style.transform = "scaleX(" + Math.max(prog, 0.08).toFixed(3) + ")";
    } else if (track && bar) {
      var sp = track.scrollLeft / Math.max(track.scrollWidth - track.clientWidth, 1);
      bar.style.transform = "scaleX(" + Math.max(sp, 0.08).toFixed(3) + ")";
    }
    ticking = false;
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener("scroll", req, { passive: true });
  if (track) track.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", function () { setupHs(); req(); });
  window.addEventListener("load", function () { setupHs(); req(); });
  setupHs(); onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = to > 1000 ? to - 40 : 0, dur = 1400, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.09) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
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

  /* kinetička riječ u naslovu (kategorije) */
  $$("[data-rotate]").forEach(function (el) {
    var list = el.dataset.rotate.split(","), i = list.indexOf(el.textContent.trim());
    if (reduce || list.length < 2) return;
    setInterval(function () {
      el.classList.add("out");
      setTimeout(function () { i = (i + 1) % list.length; el.textContent = list[i]; el.classList.remove("out"); }, 350);
    }, 1900);
  });

  /* magnetni gumbi i nagib kartica (samo miš) */
  if (fine && !reduce) {
    $$(".btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.removeProperty("--mx"); b.style.removeProperty("--my"); });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty("--ty", (x * 7).toFixed(2) + "deg"); c.style.setProperty("--tx", (-y * 7).toFixed(2) + "deg");
      });
      c.addEventListener("mouseleave", function () { c.style.removeProperty("--tx"); c.style.removeProperty("--ty"); });
    });
  }

  /* radimo / ne radimo – pon–pet 7–15 (Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = +g("hour") + g("minute") / 60;
      var open = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1 && h >= 7 && h < 15;
      el.classList.toggle("open", open);
      el.textContent = open ? "Ured je sada otvoren · do 15 h" : "Ured je sada zatvoren · radimo pon – pet, 7 – 15 h";
    } catch (e) {}
  });

  /* filtri vozila */
  var fbar = $(".filters");
  if (fbar) {
    var vs = $$(".veh");
    var apply = function (f) {
      $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.f === f); });
      vs.forEach(function (v) { v.hidden = !(f === "sve" || v.dataset.g === f); if (!v.hidden) v.classList.add("in"); });
    };
    $$("button", fbar).forEach(function (b) { b.addEventListener("click", function () { apply(b.dataset.f); }); });
    var h = location.hash.slice(1);
    if (h && $('button[data-f="' + h + '"]', fbar)) apply(h);
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["category", "Kategorija"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za upis – kategorija " + (f.get("category") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Autoškole DUNAV-VUKOVAR");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
