/* Beauty Moments by Nina – interakcije i animacije */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* zaglavlje se smanjuje pri skrolanju */
  var nav = $(".nav");
  function onScroll() { if (nav) nav.classList.toggle("small", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* brojači */
  function count(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), start = end > 1000 ? end - 40 : 0, t0 = null, dur = 1600;
    if (reduce) { el.textContent = end; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, sib = el.parentElement ? $$(":scope > [data-anim]", el.parentElement) : [el];
        var i = Math.max(0, sib.indexOf(el));
        setTimeout(function () { el.classList.add("in"); }, Math.min(i, 6) * 90);
        $$("[data-count]", el).forEach(count);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }
  if (reduce || !("IntersectionObserver" in window)) $$("[data-count]").forEach(function (el) { el.textContent = el.getAttribute("data-count"); });

  /* paralaksa slika */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var upd = function () {
      var vh = window.innerHeight;
      par.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var k = parseFloat(img.getAttribute("data-parallax")) || 0.08;
        var off = (r.top + r.height / 2 - vh / 2) * -k;
        img.style.transform = "translate3d(0," + (off - r.height * 0.08).toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* nagib kartica */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
    /* magnetni gumbi */
    $$(".btn-gold").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* otvoreno / zatvoreno (Europe/Zagreb) */
  var H = { 1: [13, 20], 2: [8, 15], 3: [13, 20], 4: [8, 15], 5: [13, 20], 6: [8, 14], 0: null };
  var DN = ["u nedjelju", "u ponedjeljak", "u utorak", "u srijedu", "u četvrtak", "u petak", "u subotu"];
  function zg() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: parseInt(o.hour, 10) % 24 + parseInt(o.minute, 10) / 60 };
    } catch (e) { var n = new Date(); return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  var now = zg();
  $$(".hours tr").forEach(function (tr) { if (+tr.getAttribute("data-d") === now.d) tr.classList.add("today"); });
  $$(".chip[data-open]").forEach(function (c) {
    var t = H[now.d], dot = $(".dot", c), txt = $(".open-txt", c), msg;
    if (t && now.h >= t[0] && now.h < t[1]) { dot.classList.add("open"); msg = "Sada otvoreno, do " + t[1] + ":00"; }
    else {
      var nd = now.d, add = 0;
      if (t && now.h < t[0]) msg = "Otvaramo danas u " + t[0] + ":00";
      else {
        do { nd = (nd + 1) % 7; add++; } while (!H[nd] && add < 7);
        msg = "Zatvoreno · otvaramo " + (add === 1 ? "sutra" : DN[nd]) + " u " + H[nd][0] + ":00";
      }
    }
    txt.textContent = msg;
  });

  /* kartice na stranici usluga: aktivna kategorija */
  var tabs = $$(".tabs a");
  if (tabs.length && "IntersectionObserver" in window) {
    var tio = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        tabs.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + en.target.id;
          a.classList.toggle("act", on);
          if (on && a.scrollIntoView && window.innerWidth < 900) a.parentElement.scrollTo({ left: a.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$(".det").forEach(function (s) { tio.observe(s); });
  }

  /* cjenik: filtar i pretraga */
  var groups = $$(".pl-group"), search = $("#trazi"), fbtn = $$(".filters button"), empty = $(".empty"), cat = "sve";
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); }
  function apply() {
    var q = search ? norm(search.value.trim()) : "", any = false;
    groups.forEach(function (g) {
      var vis = 0, okCat = cat === "sve" || g.getAttribute("data-cat") === cat;
      $$("tbody tr", g).forEach(function (tr) {
        var ok = okCat && (!q || norm(tr.cells[0].textContent).indexOf(q) > -1);
        tr.hidden = !ok; if (ok) vis++;
      });
      g.hidden = vis === 0; if (vis) any = true;
    });
    if (empty) empty.style.display = any ? "none" : "block";
  }
  if (groups.length) {
    fbtn.forEach(function (b) {
      b.addEventListener("click", function () {
        cat = b.getAttribute("data-f");
        fbtn.forEach(function (x) { x.classList.toggle("act", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);
    var h = location.hash.replace("#c-", "");
    if (h && h !== location.hash) { var fb = $('.filters button[data-f="' + h + '"]'); if (fb) fb.click(); }
  }

  /* obrazac -> pripremljena e-poruka */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime i prezime"], ["phone", "Telefon"], ["email", "E-pošta"], ["service", "Usluga"], ["day", "Željeni dan"], ["message", "Poruka"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za termin: " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nPoslano s web stranice beautymoments.hr");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
