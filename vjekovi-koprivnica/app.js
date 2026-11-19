/* Vjekovi d.o.o. – zajednička skripta */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 30); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* duljina SVG linija za crtanje */
  $$("[data-anim='draw'] path, [data-anim='draw'] line").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
  });

  /* otkrivanje pri skrolanju */
  var items = $$("[data-anim]");
  if (still || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
    /* sigurnosna mreža: ništa ne smije ostati skriveno */
    setTimeout(function () { items.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight) el.classList.add("in"); }); }, 2500);
  }

  /* spora paralaksa fotografija */
  var par = $$("[data-parallax]");
  if (par.length && !still) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      par.forEach(function (img) {
        var box = img.parentElement.getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        var k = parseFloat(img.getAttribute("data-parallax")) || 0.1;
        var extra = Math.max(0, img.offsetHeight - box.height);
        var t = -extra / 2 + (box.top + box.height / 2 - vh / 2) * -k;
        t = Math.min(0, Math.max(-extra, t));
        img.style.transform = "translate3d(0," + t.toFixed(1) + "px,0)";
      });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update); update();
  }

  /* galerija – povećanje */
  var links = $$(".gal a");
  if (links.length) {
    var lb = document.createElement("div");
    lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Fotografija");
    lb.innerHTML = '<img alt=""><button class="x" aria-label="Zatvori">×</button><button class="p" aria-label="Prethodna">‹</button><button class="n" aria-label="Sljedeća">›</button><div class="c"></div>';
    document.body.appendChild(lb);
    var cur = 0, last = null;
    var show = function (i) {
      cur = (i + links.length) % links.length;
      var a = links[cur], im = $("img", a);
      $("img", lb).src = a.getAttribute("href"); $("img", lb).alt = im ? im.alt : "";
      $(".c", lb).textContent = (cur + 1) + " / " + links.length;
      if (!lb.classList.contains("open")) { last = document.activeElement; lb.classList.add("open"); $(".x", lb).focus(); }
    };
    var close = function () { lb.classList.remove("open"); if (last) last.focus(); };
    links.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); show(i); }); });
    $(".x", lb).onclick = close;
    $(".p", lb).onclick = function () { show(cur - 1); };
    $(".n", lb).onclick = function () { show(cur + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* upit: pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime i prezime"], ["telefon", "Telefon"], ["tema", "Tema"], ["poruka", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent((f.get("tema") || "Upit") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(body.join("\n"));
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
