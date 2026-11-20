/* Pete's Cafe – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement, nav = $(".nav");

  /* red or green? – accent colour switch, remembered per visitor */
  function setChile(c) {
    root.classList.toggle("chile-green", c === "green");
    $$("[data-chile]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-chile") === c ? "true" : "false"); });
    try { localStorage.setItem("petes-chile", c); } catch (e) {}
  }
  try { if (localStorage.getItem("petes-chile") === "green") setChile("green"); } catch (e) {}
  $$("[data-chile]").forEach(function (b) { b.addEventListener("click", function () { setChile(b.getAttribute("data-chile")); }); });

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) root.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* scroll: shrinking header, hero parallax, timeline line drawing, menu index */
  var plx = $(".plx"), tl = $(".tl-wrap"), tlPath = $(".tl-line path"), idx = $$(".m-index a"), secs = $$(".m-sec"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, vh = innerHeight;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) plx.style.transform = "scale(1.08) translate3d(0," + (r.top * -0.08).toFixed(1) + "px,0)";
      }
      if (tl && tlPath && !reduce) {
        var t = tl.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh * 0.75 - t.top) / t.height));
        tlPath.style.setProperty("--draw", (1 - p).toFixed(3));
      }
      if (idx.length) {
        var cur = null;
        secs.forEach(function (s) { if (s.getBoundingClientRect().top < vh * 0.35) cur = s.id; });
        idx.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + cur); });
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* counters (final value is already in the HTML) */
  function count(el) {
    var end = +el.getAttribute("data-count"), start = end - 40, t0 = null, dur = 1500;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (end - start) * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = start; requestAnimationFrame(step);
  }

  /* reveal on scroll, small stagger between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.07 + "s";
        el.classList.add("in"); io.unobserve(el);
        if (!reduce) $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$(".hero-h [data-anim]").forEach(function (el, i) { io.unobserve(el); setTimeout(function () { el.classList.add("in"); }, 150 + i * 140); });
  }

  /* open now? (Mountain time: Tue–Thu 11–19, Fri–Sat 11–20, Sun 11–15, Mon closed) */
  $$("[data-open]").forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Denver", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var g = function (t) { return (p.filter(function (x) { return x.type === t; })[0] || {}).value; };
      var d = g("weekday"), h = (+g("hour") % 24) + g("minute") / 60;
      var close = { Tue: 19, Wed: 19, Thu: 19, Fri: 20, Sat: 20, Sun: 15 }[d], lbl = { 19: "7:00 pm", 20: "8:00 pm", 15: "3:00 pm" };
      var open = close && h >= 11 && h < close, next;
      if (close && h < 11) next = "today";
      else next = (d === "Sun" || d === "Mon") ? "Tuesday" : "tomorrow";
      el.textContent = open ? "Open now · until " + lbl[close] : "Closed now · opens 11:00 am " + next;
      if (open) el.parentNode.classList.add("open");
    } catch (e) {}
  });

  /* large party / question form → prepared email */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["name", "Name"], ["phone", "Phone"], ["guests", "Guests"], ["when", "Date & time"], ["message", "Message"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Party / question – " + f.get("name")) + "&body=" + encodeURIComponent(body.join("\n") + "\n\nSent from petescafenewmexico.com");
      var ok = $(".ok", fm); if (ok) ok.style.display = "block";
    });
  });
})();
