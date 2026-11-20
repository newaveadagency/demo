/* AUTO LINE Tepih servis – skripta stranice (prijedlog) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    var close = function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* zaglavlje se smanjuje + paralaksa fotografija */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 30);
    if (!reduce) par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.08;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.14)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači (podržava decimalni zarez: data-count="4.8" data-dec="1") */
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), dur = 1600, t0 = null;
    var fmt = function (v) { return v.toFixed(dec).replace(".", ","); };
    if (reduce) { el.textContent = fmt(to); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = fmt(to); }, dur + 400);
  }

  /* otkrivanje pri skrolanju (redoslijed preko data-d) */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.12) + "s"; });
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = (+el.dataset.count).toFixed(+(el.dataset.dec || 0)).replace(".", ","); });
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

  /* radno vrijeme uživo: pon–pet 8–16 (Europe/Zagreb) */
  try {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var d = g("weekday"), h = +g("hour") + g("minute") / 60;
    var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], di = days.indexOf(d);
    var open = di > -1 && di < 5 && h >= 8 && h < 16;
    $$("[data-open]").forEach(function (el) {
      el.classList.toggle("open", open);
      el.textContent = open ? "Sada radimo · do 16 h" : (di < 4 || (di === 4 && h < 8) ? (h < 8 ? "Danas od 8 h" : "Sutra od 8 h") : "Ponovno u ponedjeljak od 8 h");
    });
    $$("[data-day]").forEach(function (li) { if (+li.dataset.day === di) li.classList.add("today"); });
  } catch (e) {}

  /* obrazac → pripremljeni SMS (tvrtka nema javni e-mail); ako se doda data-mail, otvara e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["sto", "Što"], ["kom", "Komada / veličina"], ["adresa", "Adresa za preuzimanje"], ["ime", "Ime"], ["tel", "Telefon"], ["napomena", "Napomena"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      var text = "Upit za pranje (web)\n" + body.join("\n");
      if (fm.dataset.mail) location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za pranje – " + f.get("ime")) + "&body=" + encodeURIComponent(text);
      else location.href = "sms:" + fm.dataset.sms + "?&body=" + encodeURIComponent(text);
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
