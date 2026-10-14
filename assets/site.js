(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header gets its ground once the page scrolls.
  var hdr = document.querySelector('header.site');
  var onScroll = function () {
    if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  // Back from the signup form (?beta=thanks): swap the form for a line.
  if (/[?&]beta=thanks/.test(location.search)) {
    var bf = document.querySelector('.betaform');
    if (bf) {
      var ok = document.createElement('p');
      ok.className = 'betathanks';
      ok.textContent = "You're on the list. Talk soon.";
      bf.replaceWith(ok);
    }
  }
})();
