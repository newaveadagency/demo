/* Veterinarska stanica Požega – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer:fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { if (menu) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } }
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
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.06;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || 0), dur = 1500, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = from;
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  function reveal(el) {
    var d = parseFloat(el.dataset.d || 0), isDot = el.tagName.toLowerCase() === "circle";
    setTimeout(function () {
      el.classList.add("in");
      $$("[data-count]", el).forEach(count);
      if (el.hasAttribute("data-count")) count(el);
    }, d * (isDot ? 70 : 110));
  }
  /* naslov heroja: redovi su u maski (overflow:hidden), pa ih ne promatramo nego otkrivamo odmah */
  var heroLines = $$(".hero h1 .ln>span[data-anim]");
  heroLines.forEach(function (el) { setTimeout(function () { el.classList.add("in"); }, 150 + parseFloat(el.dataset.d || 0) * 140); });
  var anims = $$("[data-anim]").filter(function (el) { return heroLines.indexOf(el) < 0; });
  var steps = $$(".steps");
  steps.forEach(function (s) {
    var p = $("path", s); if (p && p.getTotalLength) s.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 10);
  });
  if (!("IntersectionObserver" in window) || reduce) {
    anims.forEach(function (el) { el.classList.add("in"); });
    steps.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    anims.forEach(function (el) { io.observe(el); });
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io2.unobserve(e.target); } });
    }, { threshold: 0.3 });
    steps.forEach(function (el) { io2.observe(el); });
  }

  /* reflektor koji prati kursor (heroj i kartice) + nagib */
  if (fine && !reduce) {
    var hero = $(".hero");
    if (hero) hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", (e.clientX - r.left) + "px");
      hero.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
    $$(".card,.loc,.svc li").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty("--x", x + "px"); c.style.setProperty("--y", y + "px");
        if (c.hasAttribute("data-tilt")) c.style.transform = "perspective(800px) rotateX(" + ((y / r.height - 0.5) * -5).toFixed(2) + "deg) rotateY(" + ((x / r.width - 0.5) * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    /* magnetni gumbi */
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* radno vrijeme uživo (Europe/Zagreb) */
  function zagrebNow() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var days = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
      return { d: days[o.weekday], m: parseInt(o.hour, 10) % 24 * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function toMin(s) { var a = s.split(":"); return +a[0] * 60 + +a[1]; }
  function parseHours(str) {
    var map = {};
    str.split(";").forEach(function (part) {
      var bits = part.trim().split(" "), days = bits[0].split("-"), t = bits[1].split("-");
      var a = +days[0], b = +(days[1] || days[0]);
      for (var d = a; d <= b; d++) map[d] = [toMin(t[0]), toMin(t[1])];
    });
    return map;
  }
  var DAYS = ["nedjelju", "ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu"];
  function statusText(map, now) {
    var t = map[now.d];
    if (t && now.m >= t[0] && now.m < t[1]) return { open: true, txt: "Sada otvoreno · do " + Math.floor(t[1] / 60) + " h" };
    if (t && now.m < t[0]) return { open: false, txt: "Zatvoreno · otvaramo danas u " + Math.floor(t[0] / 60) + " h" };
    for (var i = 1; i <= 7; i++) {
      var d = (now.d + i) % 7;
      if (map[d]) return { open: false, txt: "Zatvoreno · otvaramo " + (i === 1 ? "sutra" : "u " + DAYS[d]) + " u " + Math.floor(map[d][0] / 60) + " h" };
    }
    return { open: false, txt: "Zatvoreno" };
  }
  var now = zagrebNow();
  $$("[data-hours]").forEach(function (box) {
    var st = $("[data-loc-status]", box); if (!st) return;
    var s = statusText(parseHours(box.dataset.hours), now);
    st.textContent = s.open ? "Sada otvoreno" : s.txt.replace(" · ", ", ");
    st.classList.toggle("open", s.open);
  });
  var heroStatus = $("[data-open]");
  if (heroStatus) {
    var s0 = statusText(parseHours("1-5 07:00-16:00;6 07:00-13:00"), now);
    heroStatus.textContent = "Požega: " + s0.txt;
    heroStatus.classList.toggle("open", s0.open);
  }

  /* galerija s povećanjem */
  var lb = $(".lb"), shots = $$(".gal button"), cur = 0;
  function show(i) {
    cur = (i + shots.length) % shots.length;
    var img = $("img", shots[cur]);
    $("img", lb).src = img.currentSrc || img.src; $("img", lb).alt = img.alt;
    $("p", lb).textContent = shots[cur].dataset.cap || "";
  }
  if (lb && shots.length) {
    shots.forEach(function (b, i) { b.addEventListener("click", function () { show(i); lb.classList.add("open"); $(".x", lb).focus(); }); });
    $(".x", lb).addEventListener("click", function () { lb.classList.remove("open"); shots[cur].focus(); });
    $(".prev", lb).addEventListener("click", function () { show(cur - 1); });
    $(".next", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") lb.classList.remove("open");
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* obrazac -> pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime"], ["phone", "Telefon"], ["email", "E-pošta"], ["pet", "Ljubimac"], ["service", "Usluga"], ["loc", "Ambulanta"], ["message", "Upit"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
