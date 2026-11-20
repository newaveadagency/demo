/* La Barbiera – interakcije i animacije */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Zaglavlje se smanjuje pri skrolanju */
  var nav = document.querySelector('.nav');
  function onNav() { if (nav) nav.classList.toggle('small', window.scrollY > 40); }
  onNav();
  window.addEventListener('scroll', onNav, { passive: true });

  /* Izbornik na mobitelu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('izbornik');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* 2. Otkrivanje pri skrolanju (redovi, fade-up, luk) */
  var items = document.querySelectorAll('[data-anim]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { (en.target._anims || [en.target]).forEach(function (t) { t.classList.add('in'); }); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      /* hero se otkriva odmah pri učitavanju (redovi su skriveni maskom, pa ih IO ne bi vidio) */
      if (el.closest('.hero, .page-hero')) return;
      /* luk je skriven clip-pathom, pa promatramo roditelja */
      if (el.getAttribute('data-anim') === 'arch' && el.parentElement) { var p = el.parentElement; if (!p._anims) { p._anims = []; io.observe(p); } p._anims.push(el); return; }
      io.observe(el);
    });
    requestAnimationFrame(function () {
      setTimeout(function () {
        document.querySelectorAll('.hero [data-anim], .page-hero [data-anim]').forEach(function (el) { el.classList.add('in'); });
      }, 60);
    });
  }

  /* 3. Brojači */
  function fmt(v, dec) { return dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v)); }
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduce) { el.textContent = fmt(end, dec); return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e, dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end, dec);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* 4. Paralaksa slike u heroju + 5. vodoravna galerija vezana uz skrol */
  var par = document.querySelector('[data-par]');
  var hs = document.querySelector('.hs');
  var track = hs ? hs.querySelector('.hs-track') : null;
  var pinned = false;
  function setupPin() {
    if (!hs || !track) return;
    var want = !reduce && window.innerWidth > 900;
    if (want) {
      hs.classList.add('pin');
      var dist = track.scrollWidth - window.innerWidth + 80;
      hs.style.setProperty('--hs-h', (window.innerHeight + Math.max(dist, 0)) + 'px');
      pinned = true;
    } else {
      hs.classList.remove('pin');
      track.style.transform = '';
      pinned = false;
    }
  }
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY;
    if (par && !reduce) par.style.transform = 'scale(1.15) translateY(' + Math.min(y * 0.08, 60) + 'px)';
    if (pinned) {
      var r = hs.getBoundingClientRect();
      var total = hs.offsetHeight - window.innerHeight;
      var p = Math.min(Math.max(-r.top / total, 0), 1);
      var dist = track.scrollWidth - window.innerWidth + 80;
      track.style.transform = 'translateX(' + (-p * dist) + 'px)';
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', function () { setupPin(); req(); });
  window.addEventListener('load', function () { setupPin(); req(); });
  setupPin(); req();

  /* 6. Reflektor koji prati kursor u heroju */
  document.querySelectorAll('[data-spot]').forEach(function (sec) {
    if (reduce) return;
    sec.addEventListener('pointermove', function (e) {
      var r = sec.getBoundingClientRect();
      sec.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      sec.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* 7. Magnetni gumb i 8. nagib kartica */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.25) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.35) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    document.querySelectorAll('.tilt').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(800px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* 9. Status „Sada radi” po lokaciji (vrijeme u Zagrebu) */
  function zagrebNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zagreb', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { d: map[o.weekday], h: parseInt(o.hour, 10) % 24 + parseInt(o.minute, 10) / 60 };
    } catch (e) { var n = new Date(); return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  function hh(v) { var h = Math.floor(v), m = Math.round((v - h) * 60); return h + (m ? ':' + (m < 10 ? '0' : '') + m : ''); }
  function parseHours(s) {
    var days = {};
    s.split(';').forEach(function (part) {
      var a = part.split(':'), range = a[0].split('-'), t = a[1].split('-');
      var from = +range[0], to = +(range[1] || range[0]);
      for (var d = from; d <= to; d++) days[d] = [parseFloat(t[0]), parseFloat(t[1])];
    });
    return days;
  }
  var now = zagrebNow();
  document.querySelectorAll('[data-hours]').forEach(function (loc) {
    var st = loc.querySelector('[data-open]');
    if (!st) return;
    var days = parseHours(loc.getAttribute('data-hours'));
    var today = days[now.d];
    if (today && now.h >= today[0] && now.h < today[1]) {
      st.textContent = 'Sada radi · do ' + hh(today[1]) + ' h'; st.classList.add('open');
    } else {
      var next = null;
      for (var i = 0; i < 7; i++) {
        var d = (now.d + i) % 7, t = days[d];
        if (t && (i > 0 || now.h < t[0])) { next = { i: i, t: t }; break; }
      }
      var label = 'Zatvoreno';
      if (next) label += ' · otvara ' + (next.i === 0 ? 'danas' : next.i === 1 ? 'sutra' : ['u nedjelju', 'u ponedjeljak', 'u utorak', 'u srijedu', 'u četvrtak', 'u petak', 'u subotu'][(now.d + next.i) % 7]) + ' u ' + hh(next.t[0]);
      st.textContent = label; st.classList.add('closed');
    }
    var idx = now.d === 0 ? -1 : now.d <= 3 ? 0 : now.d <= 5 ? 1 : 2;
    var lis = loc.querySelectorAll('.hrs li');
    if (idx >= 0 && lis[idx]) lis[idx].classList.add('today');
  });

  /* 10. Obrazac za rezervaciju: vodi na Buker odabranog salona (ili e-mail, ako je upisan) */
  document.querySelectorAll('form.lead-form').forEach(function (f) {
    var lok = f.querySelector('select[name="Lokacija"]');
    var usl = f.querySelector('select[name="Usluga"]');
    var hint = f.querySelector('[data-hint]');
    var call = f.querySelector('[data-call]');
    function upd() {
      var o = lok.options[lok.selectedIndex];
      if (hint) hint.textContent = 'Odabrano: ' + (usl ? usl.value : '') + ' · ' + o.text;
      if (call) call.setAttribute('href', 'tel:' + o.getAttribute('data-tel'));
    }
    lok.addEventListener('change', upd);
    if (usl) usl.addEventListener('change', upd);
    upd();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var mail = f.getAttribute('data-mail');
      var o = lok.options[lok.selectedIndex];
      if (mail) {
        var body = 'Lokacija: ' + o.text + '\nUsluga: ' + (usl ? usl.value : '') + '\n\nŽeljeni termin: ';
        location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Upit za termin – La Barbiera') + '&body=' + encodeURIComponent(body);
      } else {
        window.open(o.getAttribute('data-url'), '_blank', 'noopener');
      }
    });
  });
})();
