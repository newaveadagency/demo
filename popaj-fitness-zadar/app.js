/* Popaj Fitness – demo: animacije, izbornik, radno vrijeme, raspored, obrazac */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje */
  var nav = $(".nav");
  function onScrollNav() { if (nav) nav.classList.toggle("small", window.scrollY > 40); }
  window.addEventListener("scroll", onScrollNav, { passive: true }); onScrollNav();

  /* otkrivanje pri skrolanju */
  var anims = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    anims.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, d = parseInt(el.getAttribute("data-d") || "0", 10);
        setTimeout(function () { el.classList.add("in"); }, d * 110);
        io.unobserve(el);
        if (el.querySelector("[data-count]") || el.hasAttribute("data-count")) count(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    anims.forEach(function (el) { io.observe(el); });
    setTimeout(function () { anims.forEach(function (el) { el.classList.add("in"); }); }, 4000); // sigurnost
  }

  /* brojači */
  function count(root) {
    $$("[data-count]", root).forEach(function (el) {
      var to = parseInt(el.getAttribute("data-count"), 10), t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(step);
      }
      el.textContent = "0"; requestAnimationFrame(step);
    });
  }

  /* paralaksa hero slike */
  var px = $("[data-parallax]");
  if (px && !reduce) {
    var tick = false;
    window.addEventListener("scroll", function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        px.style.transform = "translate3d(0," + (y * 0.25) + "px,0)";
        tick = false;
      });
    }, { passive: true });
  }

  /* magnetni gumbi */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    /* nagib kartica */
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* vodoravna galerija: na širokom ekranu vezana uz vertikalni skrol */
  var hg = $(".hgal");
  if (hg) {
    var track = $(".track", hg), vp = $(".viewport", hg), bar = $(".bar i", hg);
    var pinned = false;
    function setup() {
      var want = !reduce && window.innerWidth > 900;
      if (want !== pinned) { pinned = want; hg.classList.toggle("pin", want); if (!want) { hg.style.height = ""; track.style.transform = ""; } }
      if (pinned) hg.style.height = (track.scrollWidth - window.innerWidth + window.innerHeight) + "px";
      upd();
    }
    function upd() {
      var p;
      if (pinned) {
        var r = hg.getBoundingClientRect(), max = hg.offsetHeight - window.innerHeight;
        p = Math.max(0, Math.min(1, -r.top / (max || 1)));
        track.style.transform = "translate3d(" + (-(track.scrollWidth - window.innerWidth) * p) + "px,0,0)";
      } else {
        p = vp.scrollLeft / Math.max(1, vp.scrollWidth - vp.clientWidth);
      }
      if (bar) bar.style.transform = "translateX(" + (p * 400) + "%)";
    }
    window.addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true });
    vp.addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener("resize", setup);
    window.addEventListener("load", setup);
    setup();
  }

  /* radno vrijeme uživo (Europe/Zagreb) */
  function zagrebNow() {
    try {
      var f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; f.forEach(function (p) { o[p.type] = p.value; });
      var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday];
      return { d: wd, m: parseInt(o.hour, 10) % 24 * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  var now = zagrebNow();
  var openH = { 1: [420, 1320], 2: [420, 1320], 3: [420, 1320], 4: [420, 1320], 5: [420, 1320], 6: [480, 1260] };
  var isOpen = openH[now.d] && now.m >= openH[now.d][0] && now.m < openH[now.d][1];
  $$("[data-open]").forEach(function (el) {
    el.classList.toggle("is-open", !!isOpen);
    var s = el.querySelector("span");
    if (s) s.textContent = (isOpen ? "Sada otvoreno · " : "Trenutno zatvoreno · ") + "Franje Petrića 3, Zadar";
  });
  $$("[data-hours] [data-h]").forEach(function (row) {
    var h = row.getAttribute("data-h"), hit = h === "1-5" ? (now.d >= 1 && now.d <= 5) : parseInt(h, 10) === now.d;
    if (hit) row.classList.add("now");
  });
  /* današnji dan u rasporedu */
  $$("[data-day='" + now.d + "']").forEach(function (el) {
    el.classList.add("today");
    var h = el.querySelector("h3");
    if (h && !h.querySelector("em")) { var em = document.createElement("em"); em.textContent = "Danas"; h.appendChild(em); }
  });

  /* obrazac → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-mail"], ["interest", "Zanima me"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Upit – " + (f.get("interest") || "Popaj Fitness") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s popajfitness.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
