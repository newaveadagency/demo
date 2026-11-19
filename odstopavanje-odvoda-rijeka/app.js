/* ACCY · Odštopavanje odvoda Rijeka i okolica – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nav = $(".nav");

  /* mobilni izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje + paralaksa slike (rAF, pasivni scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (r.top * -0.12).toFixed(1) + "px,0) scale(1.14)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* brojači (konačna vrijednost već je u HTML-u) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), i = 0, n = 26;
    var iv = setInterval(function () {
      i++;
      var e = 1 - Math.pow(1 - i / n, 3);
      el.textContent = i >= n ? end : Math.round(end * e);
      if (i >= n) clearInterval(iv);
    }, 50);
  }

  /* otkrivanje pri skrolanju (redom, s malim zakašnjenjem) */
  /* hero: ulazak redom odmah pri učitavanju (riječi naslova izlaze iz maske) */
  var heroItems = $$(".hero [data-anim], .phero [data-anim]");
  heroItems.forEach(function (el, i) { setTimeout(function () { el.classList.add("in"); }, reduce ? 0 : 120 + i * 130); });
  var items = $$("[data-anim]").filter(function (el) { return heroItems.indexOf(el) < 0; });
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        setTimeout(function () {
          el.classList.add("in");
          $$("[data-count]", el).forEach(count);
        }, Math.min(k++, 6) * 110);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* magnetni gumbi */
  if (fine && !reduce) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* otvoreno / zatvoreno uživo (Europe/Zagreb, svaki dan 07–23) */
  var now;
  try {
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false }).formatToParts(new Date());
    var get = function (t) { return (parts.filter(function (p) { return p.type === t; })[0] || {}).value; };
    now = { h: +get("hour") % 24, d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")) };
  } catch (e) { var dd = new Date(); now = { h: dd.getHours(), d: dd.getDay() }; }
  var open = now.h >= 7 && now.h < 23;
  $$("[data-open]").forEach(function (el) {
    el.classList.toggle("off", !open);
    var b = $("b", el); if (b) b.textContent = open ? "Sada otvoreno · do 23 h" : "Zatvoreno · javljamo se od 7 h";
  });
  $$(".hours tr").forEach(function (tr) { if (+tr.getAttribute("data-day") === now.d) tr.classList.add("today"); });

  /* obrazac: pripremljeni e-mail ili sažetak za poziv */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime"], ["phone", "Telefon"], ["town", "Mjesto"], ["service", "Začepljeno"], ["message", "Opis"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Upit: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Otvara se vaš program za e-poštu s pripremljenim upitom. Za hitno nazovite " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Hvala, " + f.get("name") + ". Nazovite " + tel + " i recite:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
