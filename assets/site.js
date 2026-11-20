(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header gets its ground once the page scrolls.
  var hdr = document.querySelector('header.site');
  var onScroll = function () {
    if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Phone header: the links are one row that slides sideways. An arrow button
  // at the right edge says so and steps the row along; it goes away once the
  // last link is in view. On first load the row gives one small nudge.
  var nav = hdr && hdr.querySelector('nav.site');
  if (nav) {
    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'navmore';
    more.setAttribute('aria-label', 'More links');
    more.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    hdr.appendChild(more);
    var edge = function () {
      var room = nav.scrollWidth - nav.clientWidth;
      hdr.classList.toggle('nav-slides', room > 4);
      hdr.classList.toggle('nav-end', room <= 4 || nav.scrollLeft >= room - 4);
    };
    more.addEventListener('click', function () {
      nav.scrollBy({ left: Math.max(120, nav.clientWidth * 0.7), behavior: reduce ? 'auto' : 'smooth' });
    });
    nav.addEventListener('scroll', edge, { passive: true });
    window.addEventListener('resize', edge);
    window.addEventListener('load', edge);
    edge();
    if (!reduce) {
      setTimeout(function () {
        if (nav.scrollWidth - nav.clientWidth <= 4 || nav.scrollLeft > 0) return;
        nav.scrollTo({ left: 44, behavior: 'smooth' });
        setTimeout(function () { nav.scrollTo({ left: 0, behavior: 'smooth' }); }, 650);
      }, 900);
    }
  }

  // Reveals: a short rise as each block enters. Everything is shown at once
  // when motion is reduced, when the browser lacks the observer, or when a
  // preview tool asks for it (?preview).
  var reveals = document.querySelectorAll('.rv');
  var preview = /[?&]preview\b/.test(location.search);
  if (preview) document.body.classList.add('preview');
  var showAll = reduce || !('IntersectionObserver' in window) || preview;
  if (showAll) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // Anchor to #contact lands after lazy images above it have sized.
  var alignContact = function (behavior) {
    var el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: behavior, block: 'start' });
  };
  document.querySelectorAll('a[href$="#contact"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      if (location.pathname !== '/' && location.pathname !== '/index.html') return;
      ev.preventDefault();
      alignContact('smooth');
      setTimeout(function () { alignContact('smooth'); }, 900);
    });
  });
  if (location.hash === '#contact') {
    window.addEventListener('load', function () {
      setTimeout(function () { alignContact('auto'); }, 60);
    });
  }

  // Back from the signup form (?signup=thanks, or the older ?beta=thanks):
  // swap the form for a line.
  if (/[?&](signup|beta)=thanks/.test(location.search)) {
    var bf = document.querySelector('.betaform');
    if (bf) {
      var ok = document.createElement('p');
      ok.className = 'betathanks';
      ok.textContent = "You're on the list. Talk soon.";
      bf.replaceWith(ok);
    }
  }
})();

// Loops in the Customize section stay on their poster frame when the
// visitor asks for reduced motion.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) return;
  var vids = document.querySelectorAll('video[autoplay]');
  for (var i = 0; i < vids.length; i++) { vids[i].removeAttribute('autoplay'); vids[i].pause(); }
})();
