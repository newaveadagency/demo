/* Autoservis AK Marsonia – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); burger.setAttribute("aria-expanded", menu.classList.contains("open")); });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* brojači */
  function count(el) {
    var end = +el.getAttribute("data-count"), i = 0, n = 28;
    if (reduce || !end) { el.textContent = end; return; }
    var iv = setInterval(function () {
      i++;
      var k = i / n, e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e);
      if (i >= n) { clearInterval(iv); el.textContent = end; }
    }, 45);
  }

  /* otkrivanje pri skrolanju (fade-up, maska, clip-path, crtanje ceste, pop) */
  var els = $$("[data-anim]");
  var counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
  } else {
    var wait = [];
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        wait.forEach(function (w) { if (w.t === e.target) setTimeout(function () { w.el.classList.add("in"); }, (+w.el.getAttribute("data-d") || 0) * 120); });
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    els.forEach(function (el) {
      /* element skriven clip-pathom nema vidljivu površinu, pa promatramo roditelja */
      var t = el.getAttribute("data-anim") === "wipe" ? el.parentNode : el;
      wait.push({ el: el, t: t });
      io.observe(t);
    });
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io2.unobserve(e.target); count(e.target); } });
    }, { threshold: 0.2 });
    counters.forEach(function (c) { io2.observe(c); });
  }

  /* zaglavlje se smanjuje + paralaksa fotografija */
  var nav = $(".nav"), pars = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) pars.forEach(function (im) {
      var box = im.parentNode, r = box.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        var k = (innerHeight - r.top) / (innerHeight + r.height);
        im.style.transform = "translate3d(0," + ((k - 0.5) * -0.16 * r.height).toFixed(1) + "px,0)";
      }
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* nagib kartica usluga prema mišu */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".svc li, .card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(700px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* natpis OTVORENO / ZATVORENO (pon–pet 8–16, sub 8–13, Europe/Zagreb) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var h = +g("hour") + g("minute") / 60, d = g("weekday");
      var wk = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(d) > -1;
      var open = (wk && h >= 8 && h < 16) || (d === "Sat" && h >= 8 && h < 13);
      el.classList.add(open ? "open" : "shut");
      el.innerHTML = "<i></i>" + (open ? "Servis je sada otvoren · do " + (d === "Sat" ? "13" : "16") + " h" : "Servis je sada zatvoren · pomoć na cesti 0–24");
    } catch (err) {}
  });

  /* obrazac → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["car", "Vozilo"], ["service", "Usluga"], ["member", "Član HAK-a"], ["message", "Opis i željeni termin"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za termin: " + (f.get("service") || "servis") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice Autoservisa AK Marsonia");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
