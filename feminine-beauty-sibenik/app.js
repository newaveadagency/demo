/* Feminine Beauty, Šibenik – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer:fine)").matches;

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

  /* zaglavlje se smanjuje + paralaksa (rAF, passive) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = "scale(1.06) translate3d(0," + (p * -3).toFixed(2) + "%,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači (decimalni zarez) */
  function fmt(v, dec) { return dec ? v.toFixed(dec).replace(".", ",") : String(Math.round(v)); }
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), dur = 1400, t0 = null;
    var from = to < 10 ? to - 2 : 0;
    if (reduce) { el.textContent = fmt(to, dec); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e, dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to, dec);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = fmt(to, dec); }, dur + 300);
  }

  /* duljine SVG putanja za crtanje */
  $$('[data-anim="draw"] path').forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 2); } catch (e) {}
  });

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.12) + "s"; });
  var heroEls = $$(".hero [data-anim], .page-hero [data-anim]");
  requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }); });
  var targets = $$("[data-anim]").filter(function (el) { return heroEls.indexOf(el) < 0; }), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.concat(heroEls).forEach(function (el) { el.classList.add("in"); });
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

  /* magnetni gumbi i nagib kartica (samo miš) */
  if (!reduce && fine) {
    $$(".hero .btn, .band .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* filtar galerije */
  var fbtn = $$("[data-filter]");
  fbtn.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.dataset.filter;
      fbtn.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".gal figure[data-cat]").forEach(function (fig) {
        var show = f === "sve" || fig.dataset.cat === f;
        fig.classList.toggle("hide", !show);
        if (show) fig.classList.add("in");
      });
    });
  });

  /* radi li salon sada: pon–sub 8–21 (Europe/Zagreb) */
  try {
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = +g("hour") + g("minute") / 60;
    var slot = day >= 1 && day <= 6 ? [8, 21] : null;
    var open = slot && h >= slot[0] && h < slot[1];
    $$("[data-open]").forEach(function (el) {
      el.classList.toggle("open", !!open);
      el.textContent = open ? "Sada radimo · do " + slot[1] + " h" : slot && h < slot[0] ? "Otvaramo danas u " + slot[0] + " h" : "Trenutno zatvoreno";
    });
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("today", +tr.dataset.day === day); });
  } catch (e) {}

  /* obrazac: s data-mail otvara e-mail; bez njega složi poruku za poziv ili Instagram */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["usluga", "Usluga"], ["dan", "Željeni dan"], ["opis", "Napomena"], ["ime", "Ime"], ["telefon", "Tel"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = "Upit za termin – Feminine Beauty\n" + body.join("\n");
      if (fm.dataset.mail) { location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Termin: " + f.get("usluga")) + "&body=" + encodeURIComponent(text); return; }
      var ok = $(".ok", fm);
      if (!ok) return;
      ok.innerHTML = "";
      var p1 = document.createElement("strong"); p1.textContent = "Vaša poruka je spremna (kopirana je i u međuspremnik):";
      var pre = document.createElement("pre"); pre.textContent = text;
      var acts = document.createElement("div"); acts.className = "acts";
      var a = document.createElement("a"); a.className = "btn"; a.href = "tel:+385" + fm.dataset.tel.replace(/^0/, ""); a.textContent = "Nazovite 099 522 4477";
      var b = document.createElement("a"); b.className = "btn btn-ghost"; b.href = "https://ig.me/m/feminine_beauty_sibenik"; b.target = "_blank"; b.rel = "noopener"; b.textContent = "Pošaljite na Instagramu";
      acts.appendChild(a); acts.appendChild(b);
      ok.appendChild(p1); ok.appendChild(pre); ok.appendChild(acts);
      ok.style.display = "block";
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    });
  });
})();
