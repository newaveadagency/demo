/* PAS&PAS salon za pse – interakcije */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* 1. izbornik na mobitelu */
  var burger = document.querySelector('.burger'), menu = document.getElementById('izbornik');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
  }

  /* 2. zaglavlje se smanjuje pri skrolanju */
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 3. otkrivanje pri skrolanju (fade-up, maske redaka, clip-path, pečat) + brojači + trag šapa */
  var els = document.querySelectorAll('[data-anim], [data-trail]');
  function count(el) {
    var end = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduce) return;
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function trail(svg) {
    var paws = svg.querySelectorAll('.paw');
    svg.classList.add('in');
    paws.forEach(function (p, i) { p.style.transitionDelay = (i * 0.25) + 's'; });
  }
  function show(el) {
    el.classList.add('in');
    if (el.hasAttribute('data-trail')) trail(el);
  }
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { count(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* 4. paralaksa fotografije u heroju */
  var px = document.querySelector('[data-parallax]');
  if (px && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 700);
        px.style.transform = 'translate3d(0,' + (-y * 0.08) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* 5. nagib kartica paketa i magnetni gumbi (samo miš) */
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    document.querySelectorAll('.tilt').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(700px) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 10) + 'deg) translateY(-4px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* 6. „Sada radi” i današnji dan u radnom vremenu (Europe/Zagreb, pon–pet 8–20) */
  function zg() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zagreb', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var d = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday];
      return { d: d, m: parseInt(o.hour, 10) * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  var now = zg();
  document.querySelectorAll('[data-hours] tr').forEach(function (tr) {
    if (parseInt(tr.getAttribute('data-day'), 10) === now.d) tr.classList.add('today');
  });
  var st = document.querySelector('[data-open]');
  if (st) {
    var work = now.d >= 1 && now.d <= 5, open = work && now.m >= 480 && now.m < 1200;
    var txt = st.querySelector('.st'), dot = st.querySelector('.dot');
    if (open) txt.textContent = 'Sada radimo · do 20 h';
    else {
      dot.classList.add('off');
      var next = (work && now.m < 480) ? 'danas u 8 h' : (now.d >= 1 && now.d <= 4) ? 'sutra u 8 h' : 'u ponedjeljak u 8 h';
      txt.textContent = 'Zatvoreno · otvaramo ' + next;
    }
  }

  /* 7. obrazac → pripremljena e-poruka */
  document.querySelectorAll('form.lead-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var mail = f.getAttribute('data-mail'), lines = [];
      f.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.name && el.value) lines.push(el.name + ': ' + el.value);
      });
      var subj = 'Upit za termin – PAS&PAS salon za pse';
      if (mail) location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n'));
      else location.href = 'tel:+385994505049';
    });
  });
})();
