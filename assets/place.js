// Place pages: load the forecast, alerts and snow readings in the reader's
// browser, straight from the National Weather Service and USDA NRCS.
(function () {
  var main = document.querySelector('main[data-lat]');
  if (!main) return;
  var lat = main.getAttribute('data-lat'), lon = main.getAttribute('data-lon');
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var get = function (url) { return fetch(url, { headers: { Accept: 'application/geo+json, application/json' } }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };

  // Colour the page from the weather: the first forecast period picks one of
  // a few quiet palettes for the background lights and one accent. Until the
  // forecast loads, or if it fails, the page stays in the plain site grays.
  var kind = function (p) {
    var s = String(p.shortForecast || '').toLowerCase();
    if (/thunder|t-storm/.test(s)) return 'storm';
    if (/snow|flurr|blizzard|sleet|ice|wintry|freezing/.test(s)) return 'snow';
    if (/rain|shower|drizzle/.test(s)) return 'rain';
    if (/smoke/.test(s)) return 'smoke';
    if (/fog|haze|mist/.test(s)) return 'fog';
    if (/cloudy|overcast/.test(s) && !/partly/.test(s)) return 'cloudy';
    return p.isDaytime === false ? 'clear-night' : 'clear-day';
  };
  var tint = function (p) {
    document.documentElement.setAttribute('data-wx', kind(p));
    var h1 = main.querySelector('h1');
    if (!h1 || main.querySelector('.now')) return;
    var now = document.createElement('p');
    now.className = 'now';
    now.innerHTML = '<i aria-hidden="true"></i><b>' + esc(p.name) + '</b> ' + esc(p.shortForecast || '') +
      (p.temperature != null ? ' <span>' + esc(p.temperature) + '&deg;</span>' : '');
    h1.insertAdjacentElement('afterend', now);
  };

  var fc = document.getElementById('forecast');
  if (fc) {
    get('https://api.weather.gov/points/' + lat + ',' + lon)
      .then(function (p) { return get(p.properties.forecast); })
      .then(function (f) {
        var periods = (f.properties.periods || []).slice(0, 8);
        if (!periods.length) throw new Error('empty');
        tint(periods[0]);
        fc.innerHTML = periods.map(function (p) {
          var wind = p.windSpeed ? 'Wind ' + esc(p.windDirection || '') + ' ' + esc(p.windSpeed) : '';
          return '<div class="p"><b>' + esc(p.name) + '</b><span class="t">' + esc(p.temperature) + '&deg;</span>' +
            '<span class="d">' + esc(p.detailedForecast || p.shortForecast) + (wind ? '<span class="w">' + wind + '</span>' : '') + '</span></div>';
        }).join('');
      })
      .catch(function () {
        fc.innerHTML = '<p class="quiet">The forecast did not load. The link below opens it at weather.gov.</p>';
      });
  }

  var al = document.getElementById('alerts');
  if (al) {
    get('https://api.weather.gov/alerts/active?point=' + lat + ',' + lon).then(function (a) {
      var list = (a.features || []).slice(0, 4);
      if (!list.length) return;
      al.innerHTML = list.map(function (x) {
        return '<div class="alert"><strong>' + esc(x.properties.event) + '</strong><span>' + esc(x.properties.headline || '') + '</span></div>';
      }).join('');
      al.hidden = false;
    }).catch(function () {});
  }

  var rows = [].slice.call(document.querySelectorAll('tr[data-snotel]'));
  if (rows.length) {
    var ids = rows.map(function (r) { return r.getAttribute('data-snotel'); }).join(',');
    get('https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?stationTriplets=' + encodeURIComponent(ids) +
      '&elements=SNWD,WTEQ&duration=DAILY&beginDate=-3&endDate=0').then(function (data) {
      var by = {};
      (data || []).forEach(function (s) {
        var o = {};
        (s.data || []).forEach(function (d) {
          var vals = (d.values || []).filter(function (v) { return v.value != null; });
          if (vals.length) o[d.stationElement.elementCode] = vals[vals.length - 1].value;
        });
        by[s.stationTriplet] = o;
      });
      rows.forEach(function (r) {
        var o = by[r.getAttribute('data-snotel')] || {};
        r.querySelector('.depth').textContent = o.SNWD != null ? Math.round(o.SNWD) + ' in' : 'no reading';
        r.querySelector('.swe').textContent = o.WTEQ != null ? o.WTEQ.toFixed(1) + ' in' : 'no reading';
      });
    }).catch(function () {
      rows.forEach(function (r) { r.querySelector('.depth').textContent = 'not loaded'; r.querySelector('.swe').textContent = ''; });
    });
  }
})();
