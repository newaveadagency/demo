/* Klimatehnika d.o.o. – demo skripta */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* crtanje logotipa */
  if (!reduce) $$(".nav .logo-draw").forEach(function (s) { s.classList.add("go"); });

  /* otkrivanje (data-anim) */
  var els = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
    /* hero odmah */
    requestAnimationFrame(function () { $$(".hero [data-anim], .phero [data-anim]").forEach(function (el) { el.classList.add("in"); }); });
  }

  /* brojači */
  var counters = $$("[data-count]");
  var run = function (el) {
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0), t0 = null, dur = 1600;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!reduce && "IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* reflektor koji prati kursor + svjetlo na staklenim karticama */
  if (fine && !reduce) {
    var root = document.documentElement, raf = 0, mx = 0, my = 0;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () { root.style.setProperty("--mx", mx + "px"); root.style.setProperty("--my", my + "px"); raf = 0; });
    }, { passive: true });
    $$(".glass").forEach(function (g) {
      g.addEventListener("pointermove", function (e) {
        var r = g.getBoundingClientRect();
        g.style.setProperty("--cx", (e.clientX - r.left) + "px");
        g.style.setProperty("--cy", (e.clientY - r.top) + "px");
      });
    });
    /* nagib kartica */
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 7) + "deg) rotateY(" + (x * 9) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    /* magnetni gumb */
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* paralaksa */
  var par = $$("[data-par]");
  if (par.length && !reduce) {
    var ticking = false;
    var upd = function () {
      var vh = window.innerHeight;
      par.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var k = +img.getAttribute("data-par");
        img.style.transform = "translate3d(0," + (((r.top + r.height / 2) - vh / 2) * -k) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* harmonika (FAQ) s glatkim otvaranjem */
  $$(".faq details").forEach(function (d) {
    var s = $("summary", d), a = $(".ans", d);
    s.addEventListener("click", function (e) {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        a.style.height = a.scrollHeight + "px";
        requestAnimationFrame(function () { a.style.height = "0px"; });
        setTimeout(function () { d.open = false; a.style.height = ""; }, 450);
      } else {
        d.open = true;
        var h = a.scrollHeight; a.style.height = "0px";
        requestAnimationFrame(function () { a.style.height = h + "px"; });
        setTimeout(function () { a.style.height = ""; }, 460);
      }
    });
  });

  /* otvoreno / zatvoreno (Europe/Zagreb) */
  var hours = {
    salon: { 1: [[8, 12], [17, 20]], 2: [[8, 12], [17, 20]], 3: [[8, 12], [17, 20]], 4: [[8, 12], [17, 20]], 5: [[8, 12], [17, 20]], 6: [[8, 12]] },
    servis: { 1: [[7.5, 15.5]], 2: [[7.5, 15.5]], 3: [[7.5, 15.5]], 4: [[7.5, 15.5]], 5: [[7.5, 15.5]], 6: [[7.5, 15.5]] }
  };
  try {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = (+g("hour") % 24) + g("minute") / 60;
    $$("[data-open]").forEach(function (el) {
      var slots = hours[el.getAttribute("data-open")][day] || [], open = slots.some(function (s) { return h >= s[0] && h < s[1]; });
      el.textContent = open ? "Otvoreno" : "Zatvoreno";
      el.classList.toggle("open", open);
    });
  } catch (e) {}

  /* obrazac → pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [], svc = f.get("service") || "Upit";
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-pošta"], ["place", "Mjesto / adresa"], ["service", "Vrsta upita"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var to = svc === "Servis" && fm.dataset.mailServis ? fm.dataset.mailServis : fm.dataset.mail;
      location.href = "mailto:" + to + "?subject=" + encodeURIComponent(svc + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s klimatehnika.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
