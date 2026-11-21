/* Ordinacije Prpić – demo: animacije, "tko radi danas", cjenik, galerija */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* zaglavlje koje se smanjuje */
  var hdr = $(".hdr");
  function onScroll() { if (hdr) hdr.classList.toggle("small", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* mobilni izbornik */
  var burger = $(".burger"), nav = $("#nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var o = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* otkrivanje pri skrolanju (+ redovi naslova jedan za drugim) */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    $$(".hero h1 .ln > span[data-anim]").forEach(function (el, i) { el.style.transitionDelay = (0.15 + i * 0.14) + "s"; });
    var heroLines = $$(".hero h1 .ln > span[data-anim]");
    setTimeout(function () { heroLines.forEach(function (el) { el.classList.add("in"); }); }, 80);
    items = items.filter(function (el) { return heroLines.indexOf(el) < 0; });
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [];
        var k = sib.indexOf(el);
        if (k > 0 && !el.style.transitionDelay) el.style.transitionDelay = Math.min(k * 0.08, 0.5) + "s";
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* brojači */
  var counters = $$("[data-count]");
  function runCount(el) {
    var to = parseInt(el.getAttribute("data-count"), 10), from = parseInt(el.getAttribute("data-from") || "0", 10);
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* reflektor na staklenim karticama + sjaj u heroju */
  if (fine && !reduce) {
    document.addEventListener("pointermove", function (ev) {
      var g = ev.target.closest && ev.target.closest(".glass");
      if (g) {
        var r = g.getBoundingClientRect();
        g.style.setProperty("--x", (ev.clientX - r.left) + "px");
        g.style.setProperty("--y", (ev.clientY - r.top) + "px");
      }
    }, { passive: true });
    $$(".hero, .phero").forEach(function (h) {
      var glow = $(".hero-glow", h);
      h.addEventListener("pointermove", function (ev) {
        var r = h.getBoundingClientRect();
        glow.style.setProperty("--gx", ((ev.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        glow.style.setProperty("--gy", ((ev.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      }, { passive: true });
    });
    /* magnetni gumbi */
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (ev) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((ev.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
        b.style.setProperty("--my", ((ev.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
    /* nagib kartica usluga */
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (ev) {
        var r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* paralaksa hero fotografije */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var upd = function () {
      par.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        var off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.08;
        img.style.transform = "translate3d(0," + (off - r.height * 0.07).toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* tko radi danas – izmjene po parnim/neparnim datumima, petkom oboje ujutro */
  var list = $("[data-today-list]"), dEl = $("[data-today-date]");
  if (list && dEl) {
    var now = new Date();
    try { now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Zagreb" })); } catch (e) {}
    var day = new Date(now), note = "Danas";
    if (day.getDay() === 6 || day.getDay() === 0) {
      while (day.getDay() !== 1) day.setDate(day.getDate() + 1);
      note = "Sljedeći radni dan";
    }
    var dani = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];
    var mj = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
    var even = day.getDate() % 2 === 0, fri = day.getDay() === 5;
    var am = "7:00–14:30", pm = "13:00–20:30";
    var j = fri ? am : (even ? pm : am), l = fri ? am : (even ? am : pm);
    dEl.textContent = note + ": " + dani[day.getDay()] + ", " + day.getDate() + ". " + mj[day.getMonth()] + (fri ? "" : (even ? " (parni datum)" : " (neparni datum)"));
    list.innerHTML = '<li><span>Dr. Josip Prpić</span><b>' + j + '</b></li><li><span>Dr. Lidija Prpić</span><b>' + l + '</b></li>';
  }

  /* cjenik: pretraga i filtri */
  var q = $("#plq");
  if (q) {
    var cur = "sve";
    var apply = function () {
      var term = q.value.trim().toLowerCase(), any = false;
      $$(".pl-group").forEach(function (g) {
        var show = cur === "sve" || g.getAttribute("data-cat") === cur, n = 0;
        $$("tr", g).forEach(function (tr) {
          var ok = show && (!term || tr.getAttribute("data-q").indexOf(term) > -1);
          tr.style.display = ok ? "" : "none"; if (ok) n++;
        });
        g.style.display = n ? "" : "none"; if (n) any = true;
      });
      $("#plEmpty").style.display = any ? "none" : "block";
    };
    q.addEventListener("input", apply);
    $$(".chip").forEach(function (c) {
      c.addEventListener("click", function () {
        $$(".chip").forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on"); cur = c.getAttribute("data-f"); apply();
      });
    });
  }

  /* galerija: uvećanje */
  var lb = $("#lb");
  if (lb) {
    var lbImg = $("img", lb);
    var close = function () { lb.classList.remove("open"); };
    $$(".gal figure").forEach(function (f) {
      f.tabIndex = 0;
      var open = function () { var i = $("img", f); lbImg.src = i.src; lbImg.alt = i.alt; lb.classList.add("open"); $("button", lb).focus(); };
      f.addEventListener("click", open);
      f.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
    });
    lb.addEventListener("click", function (e) { if (e.target !== lbImg) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }
})();
