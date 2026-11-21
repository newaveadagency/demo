/* Konoba Maslina – interakcije i animacije (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("small", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* SVG crte: duljina za iscrtavanje (grana masline, vremenska crta) */
  $$(".draw path, .tl .solid").forEach(function (p) {
    try { var l = Math.ceil(p.getTotalLength()); p.style.setProperty("--len", l); } catch (e) {}
  });

  /* otkrivanje pri skrolanju */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        x.target.classList.add("in");
        io.unobserve(x.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      items.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add("in"); });
    }, 1200);
  }

  /* paralaksa slike u lučnom okviru */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var upd = function () {
      ticking = false;
      par.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var k = parseFloat(img.getAttribute("data-parallax")) || 0.08;
        var off = (r.top + r.height / 2 - innerHeight / 2) * k;
        img.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
      });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* nagib kartica i magnetni gumbi */
  if (fine && !reduce) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* pitanja: otvoreno samo jedno */
  $$(".faq details").forEach(function (d, i, all) {
    d.addEventListener("toggle", function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* rezervacija: pripremljeni e-mail (ili tekst za poziv dok konoba ne potvrdi e-adresu) */
  $$("form.lead-form").forEach(function (fm) {
    var d = fm.querySelector("[name=datum]");
    if (d) d.min = new Date().toISOString().slice(0, 10);
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime"], ["telefon", "Telefon"], ["datum", "Datum"], ["osobe", "Broj osoba"], ["prigoda", "Prigoda"], ["poruka", "Napomena"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var subj = "Rezervacija – " + (f.get("datum") || "") + ", " + (f.get("osobe") || "") + " os.";
      var ok = $(".ok", fm), mail = (fm.dataset.mail || "").trim(), tel = fm.dataset.tel || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Otvara se vaš program za e-poštu s pripremljenom porukom."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "";
        ok.appendChild(document.createTextNode("Vaš upit:\n" + body.join("\n") + "\n\nNazovite nas i pročitajte ga: "));
        var a = document.createElement("a"); a.href = "tel:" + tel; a.textContent = "020 711 720"; ok.appendChild(a);
        ok.style.display = "block";
      }
    });
  });
})();
