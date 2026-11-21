/* ŠIGI, obrt za proizvodnju i usluge – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && window.matchMedia("(hover:hover)").matches;

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

  /* zaglavlje se smanjuje + paralaksa (rAF, pasivni scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.05;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0) scale(1.12)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* magnetni gumbi */
  if (!reduce && hover) {
    $$("[data-magnet]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1500, t0 = null;
    if (reduce) { el.textContent = String(to); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = String(to);
    }
    requestAnimationFrame(step);
  }

  /* SVG stepenice: duljina linije za crtanje */
  $$(".stair path").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {}
  });

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.12) + "s"; });
  var heroEls = $$(".hero [data-anim], .page-hero [data-anim]");
  requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }); });
  var plate = $(".hero .plate");
  if (plate && !reduce) setTimeout(function () { plate.classList.add("shine"); }, 1200);
  var targets = $$("[data-anim]").filter(function (el) { return heroEls.indexOf(el) < 0; }), counters = $$("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
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

  /* FAQ – otvoren je samo jedan odgovor */
  var dets = $$(".faq details");
  dets.forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) dets.forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  /* galerija – povećanje */
  var lb = $(".lb"), figs = $$(".gal figure"), curI = 0;
  function show(i) {
    curI = (i + figs.length) % figs.length;
    var im = $("img", figs[curI]);
    $("img", lb).src = im.getAttribute("src"); $("img", lb).alt = im.alt; $("p", lb).textContent = im.alt;
  }
  if (lb && figs.length) {
    figs.forEach(function (f, i) { $("button", f).addEventListener("click", function () { show(i); lb.classList.add("on"); $(".x", lb).focus(); }); });
    $(".x", lb).addEventListener("click", function () { lb.classList.remove("on"); });
    $(".pv", lb).addEventListener("click", function () { show(curI - 1); });
    $(".nx", lb).addEventListener("click", function () { show(curI + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("on"); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") lb.classList.remove("on");
      if (e.key === "ArrowLeft") show(curI - 1);
      if (e.key === "ArrowRight") show(curI + 1);
    });
  }

  /* obrazac – složi e-mail (adresa iz data-mail; dok je prazna, primatelja upisuje korisnik) */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["radovi", "Radovi"], ["mjesto", "Mjesto"], ["opis", "Opis i mjere"], ["ime", "Ime"], ["tel", "Telefon"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = "Upit s web stranice\n\n" + body.join("\n");
      location.href = "mailto:" + (fm.dataset.mail || "") + "?subject=" + encodeURIComponent("Upit: " + f.get("radovi") + " – " + f.get("ime")) + "&body=" + encodeURIComponent(text);
      fm.classList.add("sent");
    });
  });
})();
