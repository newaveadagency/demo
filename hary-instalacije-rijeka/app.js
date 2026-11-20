/* HARY dom i instalacije – skripta stranice (prijedlog) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");

  /* mobilni izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje + paralaksa hero fotografije (rAF, pasivni scroll) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) plx.style.transform = "translate3d(0," + (r.top * -0.1).toFixed(1) + "px,0) scale(1.12)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* brojači (konačna vrijednost već stoji u HTML-u) */
  function count(el) {
    if (reduce) return;
    var end = +el.getAttribute("data-count"), i = 0, n = 34;
    var iv = setInterval(function () {
      i++;
      var e = 1 - Math.pow(1 - i / n, 3);
      el.textContent = i >= n ? end : Math.round(end * e);
      if (i >= n) clearInterval(iv);
    }, 45);
  }

  /* SVG cijev: crtanje linije kad uđe u pogled */
  var pipe = $(".pipe");
  if (pipe && !reduce && "IntersectionObserver" in window) {
    pipe.classList.add("ready");
    var po = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { pipe.classList.add("in"); po.disconnect(); } });
    }, { threshold: 0.4 });
    po.observe(pipe);
  }

  /* hero: redovi naslova izlaze iz maske jedan za drugim, zatim ostalo */
  var heroItems = $$(".hero [data-anim], .phero [data-anim]").filter(function (el) { return !el.closest(".band"); });
  heroItems.forEach(function (el, i) { setTimeout(function () { el.classList.add("in"); }, reduce ? 0 : 150 + i * 160); });

  /* otkrivanje pri skrolanju (redom, s malim zakašnjenjem) */
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
        }, Math.min(k++, 6) * 120);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* današnji dan u tablici radnog vremena (Europe/Zagreb) */
  var d;
  try {
    var wd = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short" }).format(new Date());
    d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  } catch (e) { d = new Date().getDay(); }
  $$(".hours tr").forEach(function (tr) { if (+tr.getAttribute("data-day") === d) tr.classList.add("today"); });

  /* obrazac: pripremljeni e-mail (ako je upisana adresa) ili sažetak za poziv */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime"], ["phone", "Telefon"], ["town", "Mjesto"], ["service", "Područje"], ["message", "Opis"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var ok = $(".ok", fm), mail = fm.getAttribute("data-mail"), tel = fm.getAttribute("data-phone") || "";
      if (mail) {
        location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Upit: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n"));
        if (ok) { ok.textContent = "Otvara se vaš program za e-poštu s pripremljenim upitom. Možete i nazvati " + tel + "."; ok.style.display = "block"; }
      } else if (ok) {
        ok.textContent = "Hvala, " + f.get("name") + ". Nazovite " + tel + " i recite:\n" + body.join("\n");
        ok.style.display = "block";
      }
    });
  });
})();
