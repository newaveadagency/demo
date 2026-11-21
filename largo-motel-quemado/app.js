/* Largo Motel – site script (no dependencies) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = $(".nav");
  var RATE = 118, PHONE = "575-773-4262";

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  function setNavH() { if (nav) document.documentElement.style.setProperty("--navh", nav.getBoundingClientRect().height + "px"); }
  if (burger && menu) {
    burger.addEventListener("click", function () { setNavH(); var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* header shrinks on scroll + gentle hero parallax (rAF, passive) */
  var plx = $(".plx"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 40);
      if (plx && !reduce) {
        var r = plx.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          var p = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
          plx.style.transform = "translate3d(0," + (-p * plx.offsetHeight * 0.13).toFixed(1) + "px,0)";
        }
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* counters – the final value is already in the HTML */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }

  /* reveal on scroll, small stagger between siblings */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        if (el.getAttribute("data-anim") !== "line") el.style.transitionDelay = Math.min(i, 6) * 0.07 + "s";
        el.classList.add("in"); io.unobserve(el);
        $$("[data-count]", el).forEach(count);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$("h1 [data-anim='line']").forEach(function (el, i) { io.unobserve(el); el.style.transitionDelay = (0.1 + i * 0.14) + "s"; requestAnimationFrame(function () { el.classList.add("in"); }); });
  }

  /* booking form: nights × posted rate, then prepared email (or a ready-to-read summary) */
  $$("form.lead-form").forEach(function (fm) {
    var fin = $("[name=checkin]", fm), fout = $("[name=checkout]", fm), nightsEl = $("[data-nights]", fm), totalEl = $("[data-total]", fm);
    var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    var iso = today.toISOString().slice(0, 10);
    if (fin) fin.min = iso;
    function nights() {
      if (!fin.value || !fout.value) return 0;
      var n = Math.round((new Date(fout.value) - new Date(fin.value)) / 864e5);
      return n > 0 ? n : 0;
    }
    function upd() {
      if (fin.value && fout) { fout.min = fin.value; }
      var n = nights();
      if (nightsEl) nightsEl.textContent = n ? n + (n === 1 ? " night" : " nights") + " × $" + RATE : "Choose your dates";
      if (totalEl) totalEl.textContent = n ? "$" + (n * RATE) : "–";
    }
    [fin, fout].forEach(function (x) { if (x) x.addEventListener("change", upd); });
    upd();

    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (nights() < 1 && fout) fout.setCustomValidity("Check-out must be after check-in"); else if (fout) fout.setCustomValidity("");
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), body = [];
      [["checkin", "Check in"], ["checkout", "Check out"], ["room", "Room"], ["guests", "Guests"], ["pets", "Pets"], ["name", "Name"], ["phone", "Phone"], ["message", "Notes"]].forEach(function (k) { if (f.get(k[0])) body.push(k[1] + ": " + f.get(k[0])); });
      body.push("Nights: " + nights() + " (posted rate $" + RATE + " incl. tax)");
      var text = body.join("\n");
      var ok = $(".ok", fm), msg = $("[data-ok-msg]", fm), sum = $("[data-summary]", fm);
      if (fm.dataset.mail) {
        location.href = "mailto:" + fm.dataset.mail + "?subject=" + encodeURIComponent("Room request " + f.get("checkin") + " – " + f.get("name")) + "&body=" + encodeURIComponent(text + "\n\nSent from the Largo Motel website");
        if (msg) msg.textContent = "Your email app should open with the details. We will call you back to confirm with card information.";
      } else {
        if (msg) msg.textContent = "Reservations are confirmed by phone: call " + PHONE + " and read out these details.";
        if (sum) sum.textContent = text;
      }
      if (ok) ok.style.display = "block";
    });
  });
})();
