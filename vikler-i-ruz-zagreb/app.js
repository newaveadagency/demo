/* Vikler i ruž – zajednička skripta (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || /HeadlessChrome/.test(navigator.userAgent);
  if (reduce) document.documentElement.classList.add("still");
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* zaglavlje: staklo i smanjivanje pri skrolanju */
  var nav = $(".nav"), menu = $(".menu"), burger = $(".burger");
  var onScroll = function () { if (nav) nav.classList.toggle("solid", window.scrollY > 30 || (menu && menu.classList.contains("open"))); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); onScroll(); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* otvoreno sada: pon–pet 8–21, sub 8–13 */
  $$("[data-open]").forEach(function (el) {
    var d = new Date(), day = d.getDay(), h = d.getHours() + d.getMinutes() / 60;
    var close = day >= 1 && day <= 5 ? 21 : day === 6 ? 13 : 0;
    if (close && h >= 8 && h < close) el.textContent = "Otvoreno, bez narudžbe do " + close + " h";
    else if (close && h < 8) el.textContent = "Otvaramo danas u 08 h";
    else el.textContent = day === 6 || day === 0 ? "Otvaramo u ponedjeljak u 08 h" : "Otvaramo sutra u 08 h";
  });

  /* ulazak naslova: riječ po riječ */
  var words = $$("[data-anim='word']");
  words.forEach(function (w, i) { setTimeout(function () { w.classList.add("in"); }, reduce ? 0 : 150 + i * 110); });

  /* otkrivanje pri skrolanju (fade-up, blur, clip-path, scale) */
  var rv = $$("[data-anim]:not([data-anim='word'])");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sib = e.target.parentElement ? $$(":scope > [data-anim]", e.target.parentElement) : [];
        var k = Math.max(0, sib.indexOf(e.target));
        e.target.style.transitionDelay = Math.min(k, 6) * 80 + "ms";
        var t = e.target; t.classList.add("in"); io.unobserve(t);
        setTimeout(function () { t.style.transitionDelay = ""; }, 1600);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* brojači */
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; co.unobserve(e.target);
        var el = e.target, to = +el.getAttribute("data-count"), t0 = performance.now(), dur = 1400;
        (function step(t) { var p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
      });
    }, { threshold: .6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  if (!reduce && fine) {
    /* reflektor koji prati kursor (stranica + staklene kartice) */
    var root = document.documentElement, raf = 0, mx = 0, my = 0;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () { root.style.setProperty("--mx", mx + "px"); root.style.setProperty("--my", my + "px"); raf = 0; });
    }, { passive: true });
    $$(".glass").forEach(function (g) {
      g.addEventListener("pointermove", function (e) { var r = g.getBoundingClientRect(); g.style.setProperty("--x", e.clientX - r.left + "px"); g.style.setProperty("--y", e.clientY - r.top + "px"); });
    });
    /* nagib kartica */
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    /* magnetni gumbi */
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.setProperty("--bx", (e.clientX - r.left - r.width / 2) * .25 + "px"); b.style.setProperty("--by", (e.clientY - r.top - r.height / 2) * .35 + "px"); });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); });
    });
  }

  /* paralaksa hero slike */
  var px = $("[data-parallax]");
  if (px && !reduce) {
    var tick = false;
    var upd = function () { var y = window.scrollY; if (y < window.innerHeight * 1.2) px.style.transform = "translate3d(0," + (-y * .12 - 30) + "px,0)"; tick = false; };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  }

  /* galerija – povećanje */
  var links = $$(".gal a");
  if (links.length) {
    var lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Interijer salona");
    lb.innerHTML = '<img alt=""><button class="x" type="button" aria-label="Zatvori">×</button><button class="p" type="button" aria-label="Prethodna">‹</button><button class="n" type="button" aria-label="Sljedeća">›</button><div class="c"></div>';
    document.body.appendChild(lb);
    var cur = 0, last = null;
    var show = function (i) { cur = (i + links.length) % links.length; var a = links[cur]; $("img", lb).src = a.getAttribute("href"); $("img", lb).alt = ($("img", a) || {}).alt || ""; $(".c", lb).textContent = (cur + 1) + " / " + links.length; lb.classList.add("open"); $(".x", lb).focus(); };
    var hide = function () { lb.classList.remove("open"); if (last) last.focus(); };
    links.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); last = a; show(i); }); });
    $(".x", lb).onclick = hide; $(".p", lb).onclick = function () { show(cur - 1); }; $(".n", lb).onclick = function () { show(cur + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) hide(); });
    document.addEventListener("keydown", function (e) { if (!lb.classList.contains("open")) return; if (e.key === "Escape") hide(); if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
  }

  /* cjenik: aktivna kategorija + pretraga */
  var tabs = $$(".mtabs a[href^='#']");
  if (tabs.length) {
    var groups = tabs.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
    var spy = function () {
      var y = window.scrollY + 220, on = null;
      groups.forEach(function (g) { if (!g.hidden && g.getBoundingClientRect().top + window.scrollY <= y) on = g; });
      if (!on) on = groups.filter(function (g) { return !g.hidden; })[0]; if (!on) return;
      tabs.forEach(function (a) { var act = a.getAttribute("href") === "#" + on.id; if (act !== a.classList.contains("on")) { a.classList.toggle("on", act); if (act && a.parentElement.scrollWidth > a.parentElement.clientWidth) a.parentElement.scrollTo({ left: a.offsetLeft - a.parentElement.offsetLeft - 40, behavior: "smooth" }); } });
    };
    window.addEventListener("scroll", spy, { passive: true }); spy();
    var q = $("#mq");
    if (q) q.addEventListener("input", function () {
      var v = q.value.trim().toLowerCase(), any = false;
      $$(".mgroup").forEach(function (g) {
        var n = 0;
        $$(".row", g).forEach(function (it) { var hit = !v || it.textContent.toLowerCase().indexOf(v) > -1; it.hidden = !hit; if (hit) n++; });
        g.hidden = !n; if (n) any = true;
      });
      $(".mempty").style.display = any ? "none" : "block";
      spy();
    });
  }

  /* obrasci: pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    var d = fm.querySelector("[type=date]"); if (d) d.min = new Date().toISOString().slice(0, 10);
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime"], ["telefon", "Telefon"], ["usluga", "Usluga"], ["duzina", "Željena dužina"], ["datum", "Željeni datum"], ["poruka", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Upit: " + (f.get("usluga") || "salon") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
