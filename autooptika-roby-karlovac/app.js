/* Auto-optika Roby – skripta stranice */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* izbornik */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje + paralaksa hero slike */
  var nav = $(".nav"), par = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("small", y > 40);
    if (!reduce) par.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) img.style.transform = "translate3d(0," + (-(r.top) * 0.18 - 20).toFixed(1) + "px,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), start = end > 1000 ? end - 60 : 0, t0 = null, dur = 1400;
    if (reduce || isNaN(end)) { el.textContent = end; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = end; }, dur + 150);
  }

  /* otkrivanje pri skrolanju */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    $$(".geo-svg .draw").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target._targets || [e.target]).forEach(function (t) { t.classList.add("in"); $$("[data-count]", t).forEach(count); });
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    /* maskirani ili odrezani elementi promatraju se preko roditelja */
    items.forEach(function (el) {
      var a = el.getAttribute("data-anim"), trg = a === "line" || a === "wipe" ? el.parentNode : el;
      (trg._targets = trg._targets || []).push(el);
      if (trg._targets.length === 1) io.observe(trg);
    });
  }

  /* magnetni gumbi i nagib kartica (samo miš) */
  if (fine && !reduce) {
    $$(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2) + "deg");
        c.style.setProperty("--rx", ((0.5 - (e.clientY - r.top) / r.height) * 8).toFixed(2) + "deg");
      });
      c.addEventListener("mouseleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
  }

  /* simptomi – kartice */
  var tabs = $$('.sym-list [role="tab"]');
  function show(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab, p = document.getElementById(t.getAttribute("aria-controls"));
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      if (p) { p.hidden = !on; if (on && !reduce) { p.classList.remove("fade"); void p.offsetWidth; p.classList.add("fade"); } }
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { show(t); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowDown" || k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (k === "ArrowUp" || k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === "Home") n = tabs[0];
      if (k === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); show(n, true); }
    });
  });

  /* otvoreno / zatvoreno (Pon–Pet 8–16, Sub 8–13, Europe/Zagreb) */
  try {
    var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), h = +g("hour") + g("minute") / 60;
    var close = day >= 1 && day <= 5 ? 16 : day === 6 ? 13 : 0, open = close && h >= 8 && h < close;
    $$("[data-open]").forEach(function (el) {
      var txt = $("span:last-child", el);
      el.classList.toggle("open", !!open);
      if (txt) txt.textContent = open ? "Sada otvoreno · do " + close + " h" : "Sada zatvoreno · Pon–Pet 8–16, Sub 8–13";
    });
    $$(".hours tr").forEach(function (tr) { if (+tr.getAttribute("data-day") === day) tr.classList.add("today"); });
  } catch (e) {}

  /* obrazac → e-mail (ako je adresa poznata) ili pripremljeni tekst za poziv */
  $$("form.lead-form").forEach(function (fm) {
    var prep = $(".prep", fm), pre = prep && $("pre", prep), cp = prep && $(".copy", prep);
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Ime"], ["phone", "Telefon"], ["car", "Vozilo"], ["service", "Usluga"], ["message", "Napomena"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      var text = body.join("\n");
      if (fm.dataset.mail) {
        location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Upit za termin – " + (f.get("service") || "") + " – " + f.get("name")) + "&body=" + encodeURIComponent(text);
      }
      if (prep) { pre.textContent = text; prep.classList.add("show"); }
    });
    if (cp) cp.addEventListener("click", function () {
      var t = pre.textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { cp.textContent = "Kopirano"; });
    });
  });
})();
