/* Pri staroj vuri – skripta stranice (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* otkrivanje pri skrolanju */
  var anim = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) anim.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    anim.forEach(function (el) { io.observe(el); });
  }

  /* brojači */
  var counters = $$("[data-count]");
  var runCount = function (el) {
    var to = +el.getAttribute("data-count"), from = to > 1000 ? to - 80 : 0, t0 = null, dur = 1600;
    var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if (!reduce && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } }); }, { threshold: .6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* stara vura: kazaljke pokazuju pravo vrijeme u Samoboru */
  var hands = { h: $('[data-hand="h"]'), m: $('[data-hand="m"]'), s: $('[data-hand="s"]') };
  var zagreb = function () {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", hour: "numeric", minute: "numeric", second: "numeric", weekday: "short", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      return { h: +g("hour") % 24, m: +g("minute"), s: +g("second"), d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")) };
    } catch (e) { var n = new Date(); return { h: n.getHours(), m: n.getMinutes(), s: n.getSeconds(), d: n.getDay() }; }
  };
  if (hands.h) {
    var tick = function () {
      var t = zagreb();
      hands.h.setAttribute("transform", "rotate(" + ((t.h % 12) * 30 + t.m * .5) + " 200 200)");
      hands.m.setAttribute("transform", "rotate(" + (t.m * 6 + t.s * .1) + " 200 200)");
      hands.s.setAttribute("transform", "rotate(" + t.s * 6 + " 200 200)");
    };
    tick(); if (!reduce) setInterval(tick, 1000);
  }

  /* otvoreno sada + današnji dan u tablici */
  var now = zagreb(), hr = now.h + now.m / 60, sun = now.d === 0;
  var open = sun ? hr >= 11 && hr < 18 : hr >= 12 && hr < 23;
  $$("[data-open]").forEach(function (el) {
    el.textContent = open ? "Sada je otvoreno – danas do " + (sun ? "18" : "23") + " h" : "Sada je zatvoreno – " + (sun ? (hr < 11 ? "danas otvaramo u 11 h" : "sutra otvaramo u 12 h") : (hr < 12 ? "danas otvaramo u 12 h" : (now.d === 6 ? "sutra otvaramo u 11 h" : "sutra otvaramo u 12 h")));
  });
  $$(".hours tr[data-days]").forEach(function (tr) { if (tr.getAttribute("data-days").split(",").indexOf(String(now.d)) > -1) tr.classList.add("today"); });

  /* vremenska crta: SVG se iscrtava dok skrolate */
  var tl = $(".tl"), path = $("[data-draw]");
  if (tl && path) {
    var len = 1000;
    path.style.strokeDasharray = len; path.style.strokeDashoffset = reduce ? 0 : len;
    if (!reduce) {
      var drawing = false;
      var draw = function () {
        drawing = false;
        var r = tl.getBoundingClientRect(), vh = window.innerHeight;
        var p = Math.min(Math.max((vh * .75 - r.top) / r.height, 0), 1);
        path.style.strokeDashoffset = len * (1 - p);
      };
      window.addEventListener("scroll", function () { if (!drawing) { drawing = true; requestAnimationFrame(draw); } }, { passive: true });
      draw();
    }
  }

  /* magnetni gumbi i nagib kartica (samo miš) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * .18 + "px," + (e.clientY - r.top - r.height / 2) * .3 + "px)"; });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = "perspective(800px) rotateY(" + x * 7 + "deg) rotateX(" + -y * 7 + "deg) translateY(-4px)"; });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* jelovnik: kategorija u traci prati skrolanje + pretraga */
  var chips = $$(".chips a");
  if (chips.length && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (a) { var on = a.getAttribute("href") === "#" + e.target.id; a.classList.toggle("on", on); if (on && a.scrollIntoView) { var box = a.parentNode; box.scrollTo({ left: a.offsetLeft - box.clientWidth / 2 + a.clientWidth / 2, behavior: reduce ? "auto" : "smooth" }); } });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    $$(".mcat").forEach(function (s) { sio.observe(s); });
  }
  var q = $("#q");
  if (q) {
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); };
    q.addEventListener("input", function () {
      var v = norm(q.value.trim()), any = false;
      $$(".mcat").forEach(function (c) {
        var hit = 0;
        $$("li", c).forEach(function (li) { var ok = !v || norm(li.textContent).indexOf(v) > -1; li.hidden = !ok; if (ok) hit++; });
        c.hidden = hit === 0; if (hit) any = true;
        if (v) c.classList.add("in");
      });
      $("#empty").classList.toggle("show", !any);
    });
  }

  /* rezervacija → pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["date", "Datum"], ["time", "Vrijeme"], ["guests", "Broj osoba"], ["occasion", "Povod"], ["message", "Napomena"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Rezervacija stola – " + f.get("date") + " u " + f.get("time") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Pri staroj vuri");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
