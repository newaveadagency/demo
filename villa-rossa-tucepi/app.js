/* Villa Rossa 2 Tučepi – zajednička skripta (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* zaglavlje se smanjuje pri skrolanju + izbornik na mobitelu */
  var nav = $(".nav");
  var setH = function () { if (nav) document.documentElement.style.setProperty("--navh", nav.offsetHeight + "px"); };
  var onScroll = function () { if (nav) { nav.classList.toggle("small", window.scrollY > 40); setH(); } };
  window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", setH); onScroll();
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); setH(); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* brojači */
  var count = function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10) || 0, t0 = null, dur = 1600;
    if (still) { el.textContent = end; return; }
    var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    el.textContent = "0"; requestAnimationFrame(step);
  };

  /* SVG linija: duljina puta za crtanje */
  $$('[data-anim="draw"] path').forEach(function (p) {
    try { p.parentNode.style.setProperty("--len", Math.ceil(p.getTotalLength() * 1.2)); } catch (e) {}
  });

  /* otkrivanje pri skrolanju (data-anim); maskirani redovi se promatraju preko roditelja */
  var els = $$("[data-anim]");
  if ("IntersectionObserver" in window && !still) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        (e.target._anim || [e.target]).forEach(function (el, i) {
          setTimeout(function () { el.classList.add("in"); $$("[data-count]", el).forEach(count); }, i * 120);
        });
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    els.forEach(function (el) {
      var t = el;
      var k = el.getAttribute("data-anim");
      if (k === "line") t = el.closest("h1,h2") || el.parentNode;
      else if (k === "arch") t = el.parentNode;
      if (t !== el) { (t._anim = t._anim || []).push(el); if (t._anim.length > 1) return; }
      io.observe(t);
    });
  } else els.forEach(function (el) { el.classList.add("in"); });

  /* paralaksa fotografije u luku */
  var px = $$("[data-parallax]");
  if (px.length && !still) {
    var ticking = false;
    var move = function () {
      ticking = false;
      px.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect(), vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        img.style.transform = "translate3d(0," + (-8 + p * -16).toFixed(2) + "%,0)";
      });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* magnetni gumbi i lagani nagib kartica */
  if (!still && window.matchMedia("(hover:hover)").matches) {
    $$("main .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".unit").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 4).toFixed(2) + "deg) rotateY(" + (x * 5).toFixed(2) + "deg) translateY(-6px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* galerija – povećanje */
  var links = $$(".gal a, .pics a");
  if (links.length) {
    var lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Galerija");
    lb.innerHTML = '<img alt=""><button class="x" aria-label="Zatvori">×</button><button class="p" aria-label="Prethodna">‹</button><button class="n" aria-label="Sljedeća">›</button><div class="c"></div>';
    document.body.appendChild(lb);
    var cur = 0, last = null;
    var show = function (i) { cur = (i + links.length) % links.length; var a = links[cur]; $("img", lb).src = a.getAttribute("href"); $("img", lb).alt = ($("img", a) || {}).alt || ""; $(".c", lb).textContent = (cur + 1) + " / " + links.length; lb.classList.add("open"); $(".x", lb).focus(); };
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    links.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); last = a; show(i); }); });
    $(".x", lb).onclick = close;
    $(".p", lb).onclick = function () { show(cur - 1); };
    $(".n", lb).onclick = function () { show(cur + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (!lb.classList.contains("open")) return; if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
  }

  /* odabir apartmana iz poveznice (?apartman=...) */
  var q = location.search.match(/apartman=([^&]+)/);
  if (q) { var sel = $("form.lead-form [name=apartman]"); if (sel) $$("option", sel).forEach(function (o) { if (o.textContent.indexOf(decodeURIComponent(q[1])) === 0) sel.value = o.value || o.textContent; }); }

  /* upit za smještaj: pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    var a = fm.querySelector("[name=dolazak]"), o = fm.querySelector("[name=odlazak]");
    var today = new Date().toISOString().slice(0, 10);
    if (a) a.min = today;
    if (o) o.min = today;
    if (a && o) a.addEventListener("change", function () { o.min = a.value || today; if (o.value && o.value <= a.value) o.value = ""; });
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["dolazak", "Dolazak"], ["odlazak", "Odlazak"], ["odrasli", "Odrasli"], ["djeca", "Djeca"], ["apartman", "Smještaj"], ["ime", "Ime i prezime"], ["email", "E-mail"], ["telefon", "Telefon"], ["poruka", "Poruka"]].forEach(function (k) { var v = f.get(k[0]); if (v !== null && v !== "") body.push(k[1] + ": " + v); });
      var subj = "Upit za smještaj: " + f.get("dolazak") + " – " + f.get("odlazak") + ", " + f.get("odrasli") + " odr." + (f.get("djeca") > 0 ? " + " + f.get("djeca") + " djece" : "");
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
