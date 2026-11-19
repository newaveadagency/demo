/* Staklorad Osijek – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  function closeMenu() { if (menu) menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* zaglavlje se smanjuje + paralaksa (rAF, passive scroll) */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax) || 0.05;
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseFloat(el.dataset.count), dur = 1500, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju (stagger preko data-d) */
  var targets = $$("[data-anim]"), counters = $$("[data-count]");
  targets.forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    /* hero ulazi odmah (ne čeka IntersectionObserver; retci naslova su maskirani) */
    var heroEls = $$(".hero [data-anim], .phero [data-anim]");
    requestAnimationFrame(function () { setTimeout(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }, 60); });
    targets.forEach(function (el) { if (heroEls.indexOf(el) < 0) io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("in")) e.target.style.transitionDelay = ""; });

  /* nagib kartica + magnetni gumbi (samo miš) */
  if (fine && !reduce) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(800px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * .25).toFixed(1) + "px");
        b.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); });
    });
  }

  /* današnji dan u radnom vremenu (Europe/Zagreb) */
  try {
    var wd = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short" }).format(new Date());
    var n = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
    $$('.hours tr[data-day="' + n + '"]').forEach(function (tr) { tr.classList.add("today"); });
  } catch (e) {}

  /* filtri galerije */
  var fbar = $(".filters");
  if (fbar) {
    var items = $$(".masonry a");
    $$("button", fbar).forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.dataset.f;
        $$("button", fbar).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        items.forEach(function (it) { it.hidden = !(f === "sve" || it.dataset.cat === f); if (!it.hidden) it.classList.add("in"); });
      });
    });
  }

  /* lightbox */
  var lb = $(".lb");
  if (lb) {
    var lbImg = $("img", lb), lbCap = $("p", lb), lbBtn = $("button", lb), last = null;
    var close = function () { lb.classList.remove("open"); lbImg.src = "data:,"; if (last) last.focus(); };
    $$("a.zoom").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault(); last = a;
        var im = $("img", a), cap = $(".cap", a);
        lbImg.src = a.getAttribute("href"); lbImg.alt = im ? im.alt : "";
        lbCap.textContent = cap ? cap.textContent : "";
        lb.classList.add("open"); lbBtn.focus();
      });
    });
    lbBtn.addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) close(); });
  }

  /* obrasci → pripremljeni e-mail */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["service", "Usluga"], ["size", "Mjere / lokacija"], ["message", "Poruka"]].forEach(function (k) {
        if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0]));
      });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit – " + (f.get("service") || "Staklorad") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano sa staklorad.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
