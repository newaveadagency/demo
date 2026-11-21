/* Autoservis i vučna služba Tomo – demo */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
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
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* otkrivanje pri skrolanju */
  var els = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        var el = x.target, d = parseInt(el.getAttribute("data-d") || "0", 10);
        setTimeout(function () { el.classList.add("in"); }, d * 90);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* brojači */
  var counters = $$("[data-count]");
  var runCount = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10), t0 = null, dur = 1600;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v;
      if (p < 1) requestAnimationFrame(step); else el.textContent = end;
    };
    el.textContent = "0";
    requestAnimationFrame(step);
  };
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { runCount(x.target); co.unobserve(x.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* paralaksa + cesta (SVG crtanje i kamion po putanji) */
  var par = $$("[data-parallax]");
  var path = $("#roadPath"), truck = $("#roadTruck"), road = $(".road"), len = 0;
  if (path) {
    len = path.getTotalLength();
    path.style.setProperty("--len", len);
    if (reduce) { path.style.strokeDashoffset = 0; }
  }
  var ticking = false;
  var frame = function () {
    ticking = false;
    var vh = window.innerHeight;
    par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      var off = (r.top + r.height / 2 - vh / 2) * -k;
      el.style.transform = "translateY(" + off.toFixed(1) + "px)" + (el.tagName === "IMG" && el.closest(".photo") ? " scale(1.12)" : "");
    });
    if (path && road && !reduce) {
      var rr = road.getBoundingClientRect();
      var p = Math.min(Math.max((vh - rr.top) / (vh * 0.9), 0), 1);
      path.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
      var pt = path.getPointAtLength(len * p);
      truck.setAttribute("transform", "translate(" + pt.x.toFixed(1) + "," + pt.y.toFixed(1) + ")");
    }
  };
  if (!reduce) {
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    window.addEventListener("resize", frame);
    frame();
  } else if (path && truck) {
    var end = path.getPointAtLength(len);
    truck.setAttribute("transform", "translate(" + end.x + "," + end.y + ")");
  }

  /* nagib kartica i magnetni gumbi */
  var fine = window.matchMedia && window.matchMedia("(pointer:fine)").matches;
  if (!reduce && fine) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateX(" + (-y * 8).toFixed(2) + "deg) rotateY(" + (x * 10).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = "translate(" + (x * 0.18).toFixed(1) + "px," + (y * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* otvoreno / zatvoreno (Europe/Zagreb) */
  var now = (function () {
    try {
      var s = new Date().toLocaleString("en-US", { timeZone: "Europe/Zagreb", hour12: false, weekday: "short", hour: "numeric", minute: "numeric" });
      var m = s.match(/(\w+),?\s+(\d+):(\d+)/), days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { d: days[m[1]], h: (parseInt(m[2], 10) % 24) + parseInt(m[3], 10) / 60 };
    } catch (e) { var dt = new Date(); return { d: dt.getDay(), h: dt.getHours() + dt.getMinutes() / 60 }; }
  })();
  var open = (now.d >= 1 && now.d <= 5 && now.h >= 8 && now.h < 17) || (now.d === 6 && now.h >= 8 && now.h < 14);
  $$("[data-open]").forEach(function (el) {
    el.classList.toggle("open", open);
    var t = $(".txt", el);
    if (t) t.textContent = open ? "Radionica je sada otvorena · vučna 0–24" : "Radionica je zatvorena · vučna služba radi 0–24";
  });
  $$("[data-hours] [data-day]").forEach(function (el) {
    var r = el.getAttribute("data-day").split("-"), a = +r[0], b = +(r[1] || r[0]);
    if (now.d >= a && now.d <= b) el.classList.add("now");
  });

  /* aktivni čip na stranici usluga */
  var chips = $$(".chips a");
  if (chips.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        chips.forEach(function (c) { c.classList.toggle("on", c.getAttribute("href") === "#" + x.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$(".svc[id]").forEach(function (s) { so.observe(s); });
  }

  /* obrazac -> pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["service", "Usluga"], ["vehicle", "Vozilo"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("service") || "Tomo") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
