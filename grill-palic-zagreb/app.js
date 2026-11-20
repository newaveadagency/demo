/* Grill Palić — app.js (bez vanjskih biblioteka) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var eur = function (c) { return (c / 100).toFixed(2).replace(".", ",") + " €"; };

  /* izbornik na mobitelu */
  var burger = $(".burger"), menu = $("#izbornik");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* zaglavlje se smanjuje + paralaksa */
  var nav = $(".nav"), par = $("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.pageYOffset || 0;
    if (nav) nav.classList.toggle("small", y > 40);
    if (par && !reduce) {
      var r = par.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) par.style.transform = "translate3d(0," + (-r.top * 0.12 - 30).toFixed(1) + "px,0)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* brojači */
  function count(el) {
    var to = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1100;
    el.textContent = "0";
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* otkrivanje pri skrolanju */
  var grid = $(".grid-bg");
  if (grid) requestAnimationFrame(function () { grid.classList.add("in"); });
  var targets = $$("[data-anim], .draw, [data-comp]");
  if (!("IntersectionObserver" in window) || reduce) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add("in");
        if (el.hasAttribute("data-comp")) $$("[data-count]", el).forEach(count);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("in");
        if (el.hasAttribute("data-comp")) $$("[data-count]", el).forEach(count);
      } else io.observe(el);
    });
  }

  /* radno vrijeme: pon–sri, pet–ned 12:00–21:30, četvrtak zatvoreno (Europe/Zagreb) */
  var HOURS = { 0: [720, 1290], 1: [720, 1290], 2: [720, 1290], 3: [720, 1290], 4: null, 5: [720, 1290], 6: [720, 1290] };
  var DAYS = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];
  function zagrebNow() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zagreb", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
      return { d: d, m: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  var now = zagrebNow();
  $$("[data-hours] tr").forEach(function (tr) { if (+tr.getAttribute("data-day") === now.d) tr.classList.add("today"); });
  var h = HOURS[now.d], txt, open = false;
  if (h && now.m >= h[0] && now.m < h[1]) { open = true; txt = "Otvoreno do 21:30"; }
  else if (h && now.m < h[0]) { txt = "Zatvoreno · otvara u 12:00"; }
  else {
    var nd = (now.d + 1) % 7; while (!HOURS[nd]) nd = (nd + 1) % 7;
    txt = "Zatvoreno · otvara " + (nd === (now.d + 1) % 7 ? "sutra" : DAYS[nd]) + " u 12:00";
  }
  $$("[data-open]").forEach(function (el) {
    el.classList.add(open ? "open" : "closed");
    var s = $("span", el); if (s) s.textContent = txt;
  });

  /* jelovnik: filter i pretraga */
  var chips = $$(".chip"), search = $("[data-search]"), cats = $$("[data-cat]"), empty = $("[data-empty]");
  var filter = "all";
  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); }
  function apply() {
    var q = norm(search ? search.value.trim() : ""), any = false;
    cats.forEach(function (c) {
      var show = filter === "all" || c.getAttribute("data-cat") === filter, vis = 0;
      $$(".item", c).forEach(function (it) {
        var ok = show && (!q || norm(it.textContent).indexOf(q) > -1);
        it.hidden = !ok; if (ok) vis++;
      });
      c.hidden = vis === 0; if (vis) any = true;
    });
    if (empty) empty.hidden = any;
  }
  chips.forEach(function (b) {
    b.addEventListener("click", function () {
      chips.forEach(function (x) { x.classList.toggle("on", x === b); });
      filter = b.getAttribute("data-f"); apply();
    });
  });
  if (search) search.addEventListener("input", apply);
  if (location.hash && cats.length) {
    var hc = cats.filter(function (c) { return "#" + c.id === location.hash; })[0];
    if (hc) chips.forEach(function (x) { if (x.getAttribute("data-f") === hc.id) x.click(); });
  }

  /* popis narudžbe */
  var basket = $("[data-basket]");
  if (basket) {
    var KEY = "grill-palic-popis", list = {};
    try { list = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { list = {}; }
    var priceOf = {};
    $$(".item").forEach(function (it) { priceOf[it.getAttribute("data-name")] = +it.getAttribute("data-price"); });
    var ul = $("[data-blist]", basket), none = $("[data-bnone]", basket), tot = $("[data-btotal]", basket), cnt = $("[data-bcount]", basket);
    function save() { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
    function render() {
      ul.innerHTML = ""; var sum = 0, n = 0;
      Object.keys(list).forEach(function (k) {
        if (!priceOf[k] || list[k] < 1) { delete list[k]; return; }
        var q = list[k], li = document.createElement("li");
        sum += q * priceOf[k]; n += q;
        li.innerHTML = '<span class="q"></span><span class="nm"></span><span>' + eur(q * priceOf[k]) + '</span><span><button type="button" aria-label="Manje">−</button> <button type="button" aria-label="Više">+</button></span>';
        $(".q", li).textContent = q + "×"; $(".nm", li).textContent = k;
        var bs = $$("button", li);
        bs[0].addEventListener("click", function () { list[k]--; save(); render(); });
        bs[1].addEventListener("click", function () { list[k]++; save(); render(); });
        ul.appendChild(li);
      });
      none.hidden = n > 0; ul.hidden = n === 0;
      tot.textContent = eur(sum);
      cnt.textContent = n + (n === 1 ? " stavka" : (n > 1 && n < 5 ? " stavke" : " stavki"));
    }
    $$(".add").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.closest(".item").getAttribute("data-name");
        list[k] = (list[k] || 0) + 1; save(); render();
        b.classList.add("pop"); setTimeout(function () { b.classList.remove("pop"); }, 180);
      });
    });
    var copy = $("[data-bcopy]", basket);
    copy.addEventListener("click", function () {
      var lines = Object.keys(list).map(function (k) { return list[k] + "× " + k; });
      if (!lines.length) return;
      var t = "Narudžba Grill Palić:\n" + lines.join("\n") + "\nUkupno: " + tot.textContent;
      var done = function () { copy.textContent = "Kopirano ✓"; setTimeout(function () { copy.textContent = "Kopiraj popis"; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { window.prompt("Kopirajte popis:", t); });
      else window.prompt("Kopirajte popis:", t);
    });
    render();
  }
})();
