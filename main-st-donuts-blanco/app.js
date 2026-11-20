/* Main St. Donuts & Kolaches – site script */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* scroll: shrinking header + parallax (brick wall, donut ring) */
  var nav = $(".nav"), bricks = $(".bricks-in"), ring = $(".big-ring"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("small", y > 30);
      if (!reduce) {
        if (bricks) { var r = bricks.parentNode.parentNode.getBoundingClientRect(); bricks.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) * -0.18).toFixed(1) + "px,0)"; }
        if (ring) { var q = ring.getBoundingClientRect(); ring.style.transform = "rotate(" + ((q.top - innerHeight / 2) * 0.12).toFixed(1) + "deg)"; }
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* reveal on scroll with stagger; hero words pop in one after another */
  var items = $$("[data-anim]");
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = $$("[data-anim]", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; }), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 0.09 + "s";
        el.classList.add("in"); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { if (el.getAttribute("data-anim") !== "word") io.observe(el); });
    $$('[data-anim="word"]').forEach(function (el, i) { setTimeout(function () { el.classList.add("in"); }, 120 + i * 120); });
  }

  /* playful tilt on menu cards (pointer devices) */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = "perspective(700px) rotateX(" + (-y * 8).toFixed(1) + "deg) rotateY(" + (x * 10).toFixed(1) + "deg) translateY(-6px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* open / closed status + today's row (Blanco = America/Chicago). Tue–Sun 5:30–12:00 */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
    var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    var m = (+get("hour") % 24) * 60 + (+get("minute"));
    $$('[data-hours] tr[data-d="' + d + '"]').forEach(function (el) { el.classList.add("today"); });
    var open = d !== 1 && m >= 330 && m < 720;
    var dot = $("[data-open]"), txt = $("[data-open-txt]");
    if (dot) dot.classList.toggle("open", open);
    if (txt) txt.textContent = open ? "Open now · until noon" : (d === 1 ? "Closed Mondays · back Tue 5:30 am" : (m < 330 ? "Opens today at 5:30 am" : (d === 0 ? "Closed · back Tue 5:30 am" : "Closed · back tomorrow 5:30 am")));
  } catch (e) {}

  /* big-order note → prepared e-mail if the shop's address is set, otherwise copy + call */
  $$("form.lead-form").forEach(function (fm) {
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fm.checkValidity()) { fm.reportValidity(); return; }
      var f = new FormData(fm), lines = [];
      f.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ": " + v); });
      var body = "Hello Main St. Donuts & Kolaches, I'd like to ask about a larger order.\n\n" + lines.join("\n");
      var to = fm.getAttribute("data-mail") || "", msg = $(".form-msg", fm);
      if (to) {
        location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Order question – " + (f.get("Day") || "")) + "&body=" + encodeURIComponent(body);
        if (msg) msg.textContent = "Your e-mail app should open with the note ready to send.";
      } else {
        if (navigator.clipboard) navigator.clipboard.writeText(body).catch(function () {});
        if (msg) msg.innerHTML = 'Your note is copied. Call <a href="tel:+18308333093">(830) 833-3093</a> and read it off.';
      }
    });
  });
})();
