/* KOLOPER vulkanizer – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje se smanjuje, paralaksa fotografija, guma se okreće sa skrolanjem */
  var nav = $(".nav"), par = $$("[data-parallax]"), spin = $$("[data-spin]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) {
      par.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.05;
        if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
      });
      spin.forEach(function (el) { el.style.transform = "rotate(" + (y * 0.35).toFixed(1) + "deg)"; });
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači (decimale s hrvatskim zarezom) */
  function fmt(v, dec) { return dec ? v.toFixed(dec).replace(".", ",") : String(Math.round(v)); }
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), dur = 1500, t0 = null;
    if (reduce) { el.textContent = fmt(to, dec); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e, dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to, dec);
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (fade-up, dijagonalni clip-path, SVG crtanje) */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  var heroEls = $$(".hero [data-anim], .page-hero [data-anim]");
  requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }); });
  var targets = $$("[data-anim]").filter(function (el) { return heroEls.indexOf(el) < 0; }), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = fmt(parseFloat(el.dataset.count), parseInt(el.dataset.dec || "0", 10)); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* magnetni gumb */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* radi li radiona sada – pon–pet 8–17, sub 8–13 (Europe/Zagreb) */
  try {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = +g("hour") + g("minute") / 60;
    var close = d >= 1 && d <= 5 ? 17 : d === 6 ? 13 : 0, open = close && h >= 8 && h < close;
    $$("[data-open]").forEach(function (el) {
      el.classList.toggle("open", !!open);
      el.textContent = open ? "Sada radimo · do " + close + " h" : "Sada zatvoreno · pon – pet 8 – 17, sub 8 – 13";
    });
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.dataset.day === d); });
  } catch (e) {}

  /* obrazac – složi upit: e-poruka ako postoji adresa, inače tekst za poziv/kopiranje */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["ime", "Ime"], ["telefon", "Telefon"], ["vozilo", "Vozilo"], ["usluga", "Usluga"], ["dimenzija", "Dimenzija gume"], ["poruka", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = "Dobar dan,\n\nželio/la bih termin.\n" + body.join("\n");
      if (fm.dataset.mail) {
        location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za termin: " + f.get("usluga")) + "&body=" + encodeURIComponent(text);
        return;
      }
      var ok = $(".ok", fm); if (!ok) return;
      ok.innerHTML = "";
      var t = document.createElement("strong"); t.textContent = "Vaš upit je spreman:"; ok.appendChild(t);
      var pre = document.createElement("pre"); pre.textContent = text; ok.appendChild(pre);
      var call = document.createElement("a"); call.className = "btn"; call.href = "tel:" + fm.dataset.tel; call.textContent = "Nazovi radionu"; ok.appendChild(call);
      if (navigator.clipboard) {
        var cp = document.createElement("button"); cp.type = "button"; cp.className = "btn ghost"; cp.style.marginLeft = "10px"; cp.textContent = "Kopiraj tekst";
        cp.addEventListener("click", function () { navigator.clipboard.writeText(text).then(function () { cp.textContent = "Kopirano"; }); });
        ok.appendChild(cp);
      }
      ok.style.display = "block";
    });
  });
})();
