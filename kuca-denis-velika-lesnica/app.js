/* Kuća za odmor Denis, Velika Lešnica – skripta stranice (demo) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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

  /* zaglavlje se smanjuje + paralaksa zimske fotografije */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom > 0 && r.top < vh) el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -0.14).toFixed(1) + "px,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači (decimale s hrvatskim zarezom) */
  function fmt(v, dec) { return dec ? v.toFixed(dec).replace(".", ",") : String(Math.round(v)); }
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), dur = 1400, t0 = null, from = dec ? Math.max(0, to - 1.5) : 0;
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

  /* duljine SVG putanja za crtanje (krovna linija, vremenska crta) */
  $$(".timeline svg.path path").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength() * 1.05)); } catch (e) {}
  });

  /* otkrivanje pri skrolanju */
  $$("[data-anim]").forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = (el.dataset.d * 0.1) + "s"; });
  var heroEls = $$(".hero [data-anim], .page-hero [data-anim]");
  requestAnimationFrame(function () { requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add("in"); }); }); });
  var targets = $$("[data-anim], [data-tl]").filter(function (el) { return heroEls.indexOf(el) < 0; }), counters = $$("[data-count]");
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

  /* snijeg u zimskoj sekciji */
  if (!reduce) $$(".snow").forEach(function (box) {
    for (var i = 0; i < 46; i++) {
      var f = document.createElement("i"), s = 2 + Math.random() * 5;
      f.style.left = (Math.random() * 100) + "%";
      f.style.width = f.style.height = s + "px";
      f.style.opacity = (0.35 + Math.random() * 0.55).toFixed(2);
      f.style.animationDuration = (7 + Math.random() * 9).toFixed(1) + "s";
      f.style.animationDelay = (-Math.random() * 14).toFixed(1) + "s";
      box.appendChild(f);
    }
  });

  /* magnetni gumbi i nagib kartica (samo miš) */
  if (fine && !reduce) {
    $$(".magnet").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* galerija – povećanje fotografije */
  var lb = $(".lb");
  if (lb) {
    var lbImg = $("img", lb), lbCap = $("p", lb), list = [], idx = 0, last = null;
    function show(i) {
      idx = (i + list.length) % list.length;
      var a = list[idx], im = $("img", a);
      lbImg.src = a.getAttribute("href"); lbImg.alt = im ? im.alt : "";
      lbCap.textContent = im ? im.alt : "";
    }
    function close() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; if (last) last.focus(); }
    $$("[data-lightbox]").forEach(function (g) {
      var links = $$("a[href$='.jpg']", g);
      links.forEach(function (a) {
        a.addEventListener("click", function (e) {
          if (document.documentElement.classList.contains("cms-edit")) return;
          e.preventDefault(); list = links; last = a; show(links.indexOf(a));
          lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; $(".x", lb).focus();
        });
      });
    });
    $(".x", lb).addEventListener("click", close);
    $(".pv", lb).addEventListener("click", function () { show(idx - 1); });
    $(".nx", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(idx - 1); else if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* obrazac: ako postoji data-mail, otvara e-mail; inače pripremi tekst upita i ponudi poziv */
  function hrDate(v) { if (!v) return ""; var p = v.split("-"); return p.length === 3 ? (+p[2]) + ". " + (+p[1]) + ". " + p[0] + "." : v; }
  $$("form.lead-form").forEach(function (fm) {
    var a = fm.querySelector("[name=dolazak]"), b = fm.querySelector("[name=odlazak]");
    if (a && b) a.addEventListener("change", function () { b.min = a.value; });
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm);
      var text = "Dobar dan, zanima me Kuća za odmor Denis.\nDolazak: " + hrDate(f.get("dolazak")) + "\nOdlazak: " + hrDate(f.get("odlazak")) + "\nBroj gostiju: " + f.get("gosti") + "\nIme: " + f.get("ime");
      if (f.get("telefon")) text += "\nTelefon: " + f.get("telefon");
      if (f.get("poruka")) text += "\nPoruka: " + f.get("poruka");
      if (fm.dataset.mail) { location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za boravak") + "&body=" + encodeURIComponent(text); return; }
      var ok = $(".ok", fm);
      if (!ok) return;
      ok.innerHTML = "";
      var p1 = document.createElement("strong"); p1.textContent = "Vaš upit je spreman (kopiran u međuspremnik):";
      var pre = document.createElement("pre"); pre.textContent = text;
      var call = document.createElement("a"); call.className = "btn"; call.href = "tel:+385" + fm.dataset.tel.replace(/^0/, ""); call.textContent = "Nazovite 099 597 4803";
      ok.appendChild(p1); ok.appendChild(pre); ok.appendChild(call);
      ok.style.display = "block";
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    });
  });
})();
