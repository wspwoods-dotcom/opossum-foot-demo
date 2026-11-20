/* Opossum Foot — website demo fence.
 *
 * This script loads BEFORE the app's own scripts and is the ONLY thing
 * that makes this package a demo instead of the app itself (build hj,
 * 2026-11-19hj, copied verbatim; see README.md). It does four things:
 *
 * 1. SEED — builds the Prairie County sample world (the v1 demo's sample
 *    line: 6 sets, 2 with catches, anonymous west-central Kansas ground)
 *    in the app's own store schema, with dates relative to today, and
 *    hands it to the app as its starting store.
 * 2. MEMORY-ONLY STORAGE — the app's localStorage / sessionStorage /
 *    IndexedDB are replaced with in-memory equivalents seeded from (1).
 *    Nothing is written to the visitor's real storage: no localStorage
 *    writes, no cookies, no IndexedDB database, and the package ships
 *    no service worker (the registration code is removed from the
 *    clone's app.js). Refreshing or resetting returns the seed world.
 * 3. PRIVACY FETCH STUBS — the app's three outside data services
 *    (reverse geocoding, Open-Meteo weather, National Weather Service)
 *    would otherwise send map/set/GPS coordinates off the device. In
 *    the demo they are answered locally: the geocoder always resolves
 *    to the fictional Prairie County, Kansas, and the weather services
 *    return fixed sample weather. A visitor's real location — used
 *    only when they tap the crosshair — never leaves their browser.
 *    Map tiles are unaffected (Leaflet loads them as images, and they
 *    carry no visitor position beyond what any map view shows).
 * 4. FRAME FIT — when the landing page frames this app on a desktop
 *    phone mockup (hash #notch), the county banner gets the same
 *    notch clearance the v1 demo applied.
 * 5. STAY-BUT-EXPLAIN (fencing pass, 2026-11-19) — the controls that
 *    would move data off the phone, wipe it, or open the microphone
 *    stay visible, but a tap explains what the full app does instead
 *    of running the function (see the interception section below).
 *
 * Everything else — every screen, control, list, picker, and flow — is
 * the app's own code, untouched.
 */
(function () {
  'use strict';

  /* ================= seed ================= */
  var SAMPLE_CENTER = { lat: 38.8745, lng: -99.6115 };
  function daysAgoISO(n) {
    var d = new Date(); d.setDate(d.getDate() - n);
    var m = ('0' + (d.getMonth() + 1)).slice(-2), dd = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + dd;
  }
  function daysAgoTs(n) {
    var d = new Date(); d.setDate(d.getDate() - n); d.setHours(8, 0, 0, 0);
    return d.getTime();
  }
  function seasonYearOf(iso) { /* the app's own rule (Q40): Sept 1 – Aug 31 */
    var p = (iso || daysAgoISO(0)).split('-');
    var y = p[0] * 1, m = p[1] * 1;
    if (m >= 9) return y + '-' + String(y + 1).slice(2);
    return (y - 1) + '-' + String(y).slice(2);
  }
  function S(id, name, lat, lng, trapMaker, trapType, trapSpring, setType, variation,
             bait, lure, urine, visual, status, dateSetDays, notes, checkedDays, extra) {
    var s = {
      id: id, name: name, lat: lat, lng: lng, county: 'Prairie County',
      trapType: trapType, trapMaker: trapMaker, trapSpring: trapSpring, trapSize: '',
      snareDia: '', snareLock: '', snareLen: '', snarePurpose: '',
      trapModel: '', trapMods: [], panSize: '', jawShape: '', jawClose: '',
      setType: setType, variation: variation,
      bait: bait, lure: lure, urine: urine, visual: visual, audio: [], other: [],
      status: status, dateSet: daysAgoISO(dateSetDays),
      notes: notes || '',
      noteLog: notes ? [{ id: 'n-' + id, text: notes, date: daysAgoISO(dateSetDays), at: daysAgoTs(dateSetDays) }] : [],
      missingReason: null, missingDetail: null,
      createdAt: daysAgoTs(dateSetDays),
      lastActivity: (typeof checkedDays === 'number') ? daysAgoTs(checkedDays) : daysAgoTs(dateSetDays),
      lineId: 'line-1'
    };
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  /* The v1 sample world, in the app's schema. Products are the sponsors'
   * real lists exactly as the app carries them. */
  var seedSets = [
    S('seed-s1', 'Creek Crossing', 38.8662, -99.6210, 'Bridger', 'Foothold', 'Coil-spring',
      'Pocket', 'Pocket', ['Ghost Dancer'], ['K9 Hitter'], [], [],
      'active', 3, 'Pocket in the bank where the creek bends.', 1),
    S('seed-s2', 'Two-Track Crossing', 38.8785, -99.6045, 'Duke', 'Dog-proof', '',
      'Dirt hole', 'Dirt hole', ['Last Stop'], ['Crazy Coon'], [], ['Flagging tape'],
      'sprung', 4, '', 1),
    S('seed-s3', 'Fence Line', 38.8831, -99.6188, 'Minnesota Brand', 'Foothold', 'Coil-spring',
      'Flat', 'Urine post', ['Medicine Man'], ['Coyote Gland Lure'], ['Coyote'], [],
      'active', 5, 'Flat set at the fence corner post.', 2),
    S('seed-s4', 'Old Barn Corner', 38.8690, -99.5980, '', 'Bodygrip / Conibear', '',
      'Cubby', 'Cubby', ['Woodchopper'], ['Beaver Lure #1'], [], [],
      'pulled', 9, 'Pulled for the season — sample set.', 6, { datePulled: daysAgoISO(3) }),
    S('seed-s5', 'Willow Bend', 38.8598, -99.6105, 'Bridger', 'Foothold', 'Coil-spring',
      'Pocket', 'Pocket', ['Dream Catcher'], ['Mystery Mink'], [], [],
      'active', 6, '', 1),
    S('seed-s6', 'North Gate', 38.8895, -99.6090, '', 'Snare', '',
      'Trail / Blind', 'Trail', [], [], [], [],
      'prospect', 2, 'Scouted — heavy trail through the gate. No trap in the ground yet.', null)
  ];
  function L(id, set, species, dateDays, notes) {
    return {
      id: id, setId: set.id, setName: set.name,
      species: species, otherType: null, count: 1, disposition: 'kept',
      date: daysAgoISO(dateDays), time: '', seasonYear: seasonYearOf(daysAgoISO(dateDays)),
      bait: set.bait.slice(), lure: set.lure.slice(), urine: set.urine.slice(),
      visual: set.visual.slice(), audio: [], other: [],
      trapType: set.trapType, trapDetail: '', setType: set.setType,
      county: set.county, lat: set.lat, lng: set.lng,
      notes: notes || '', memoIds: [], createdAt: daysAgoTs(dateDays), lineId: 'line-1'
    };
  }
  var seedLogs = [
    L('seed-l1', seedSets[1], 'Raccoon', 1, ''),
    L('seed-l2', seedSets[4], 'Mink', 2, '')
  ];

  /* Sample weather, shaped exactly like the services' responses. The
   * app caches weather in its store, so seeding the caches paints the
   * weather chip and sheet with zero network — the app's own cached
   * behavior. Times are built relative to today so the sheet's
   * "next 12 hours" rows always land. */
  function isoHour(d) {
    function p(n) { return ('0' + n).slice(-2); }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      'T' + p(d.getHours()) + ':00';
  }
  function buildOpenMeteo() {
    var now = new Date(); now.setMinutes(0, 0, 0);
    var times = [], temps = [], probs = [], codes = [];
    var base = new Date(now); base.setHours(0, 0, 0, 0);
    for (var i = 0; i < 48; i++) {
      var t = new Date(base.getTime() + i * 3600000);
      times.push(isoHour(t));
      var hr = t.getHours();
      temps.push(Math.round(38 + 9 * Math.sin((hr - 9) / 24 * 2 * Math.PI)));
      probs.push(hr % 6 === 0 ? 10 : 0);
      codes.push(hr >= 7 && hr <= 17 ? 2 : 0);
    }
    function dISO(offset) {
      var d = new Date(now); d.setDate(d.getDate() + offset);
      function p(n) { return ('0' + n).slice(-2); }
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }
    return {
      current: {
        temperature_2m: 46, relative_humidity_2m: 58, apparent_temperature: 41,
        weather_code: 2, wind_speed_10m: 11, wind_direction_10m: 315,
        precipitation: 0, time: isoHour(now)
      },
      hourly: { time: times, temperature_2m: temps, precipitation_probability: probs, weather_code: codes },
      daily: { time: [dISO(0), dISO(1)], temperature_2m_max: [52, 55], temperature_2m_min: [31, 34] }
    };
  }
  function nwsPeriod(name, temp, forecast, icon) {
    return {
      name: name, temperature: temp, temperatureUnit: 'F',
      shortForecast: forecast,
      icon: 'https://api.weather.gov/icons/land/' + icon + '?size=medium',
      detailedForecast: forecast + '. Sample forecast for the demo.'
    };
  }
  function buildNWS() {
    return {
      daily: [
        nwsPeriod('Today', 52, 'Sunny', 'day/skc'),
        nwsPeriod('Tonight', 31, 'Clear', 'night/skc'),
        nwsPeriod('Tomorrow', 55, 'Sunny', 'day/skc'),
        nwsPeriod('Tomorrow Night', 34, 'Partly Cloudy', 'night/few'),
        nwsPeriod('Day 3', 50, 'Mostly Sunny', 'day/few'),
        nwsPeriod('Day 3 Night', 30, 'Clear', 'night/skc')
      ],
      hourly: [],
      alerts: []
    };
  }
  var omPayload = buildOpenMeteo();
  var nwsPayload = buildNWS();

  function buildSeed() {
    return {
      onboarded: true,
      state: 'KS',
      weatherOn: true, voiceOn: true, rulerOn: true, windArrowsOn: true,
      checkIntervalHours: 24, checkClockOn: true, trapTag: '',
      setFields: { traptype: true, settype: true, bait: true, lure: true, urine: true, visual: true, audio: true, other: true, notes: true },
      lines: [{
        id: 'line-1', name: 'Prairie County Sample Line', state: 'KS',
        home: { lat: SAMPLE_CENTER.lat, lng: SAMPLE_CENTER.lng }, homeAsked: true,
        tabs: { history: true, scorecard: true, seasons: true, licenses: true },
        catchAlerts: true
      }],
      activeLineId: 'line-1',
      sets: JSON.parse(JSON.stringify(seedSets)),
      logs: JSON.parse(JSON.stringify(seedLogs)),
      trips: [],
      weatherTabCache: { at: Date.now(), payload: omPayload },
      weatherNwsCache: { at: Date.now(), payload: nwsPayload }
    };
  }
  var seed = buildSeed();
  window.__ofDemoSeed = seed; /* read by the verification harness only */

  /* ================= memory-only storage ================= */
  var LS_KEY = 'opossumfoot.v1';
  var BACKUP_KEY = 'opossumFootBackupPreLines';
  var mem = {};
  mem[LS_KEY] = JSON.stringify(seed);

  function MemStorage() {}
  MemStorage.prototype.getItem = function (k) {
    k = String(k);
    return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
  };
  MemStorage.prototype.setItem = function (k, v) { mem[String(k)] = String(v); };
  MemStorage.prototype.removeItem = function (k) {
    k = String(k);
    /* The app's "erase everything" lands here: in the demo, erasing
     * returns the sample world instead of a blank install, so the
     * demo can never be wiped into onboarding. */
    if (k === LS_KEY) { mem[LS_KEY] = JSON.stringify(buildSeed()); return; }
    delete mem[k];
  };
  MemStorage.prototype.clear = function () {
    var keep = JSON.stringify(buildSeed());
    mem = {}; mem[LS_KEY] = keep;
  };
  MemStorage.prototype.key = function (i) { var ks = Object.keys(mem); return i < ks.length ? ks[i] : null; };
  Object.defineProperty(MemStorage.prototype, 'length', { get: function () { return Object.keys(mem).length; } });

  var memLS = new MemStorage();
  var storageShadowed = false;
  try {
    Object.defineProperty(window, 'localStorage', { value: memLS, configurable: true, writable: true });
    storageShadowed = (window.localStorage === memLS);
  } catch (e) { storageShadowed = false; }
  try {
    Object.defineProperty(window, 'sessionStorage', { value: new MemStorage(), configurable: true, writable: true });
  } catch (e) { /* session storage is unused by the app; memory LS above is the load-bearing one */ }

  if (!storageShadowed && window.Storage && Storage.prototype) {
    /* Fallback for engines where the window property cannot be
     * shadowed: redirect just the app's two keys at the prototype, so
     * the real store still never sees a write. */
    var rawGet = Storage.prototype.getItem, rawSet = Storage.prototype.setItem, rawRemove = Storage.prototype.removeItem;
    function isAppKey(self, k) { return (self === window.localStorage) && (k === LS_KEY || k === BACKUP_KEY); }
    Storage.prototype.getItem = function (k) {
      if (isAppKey(this, k)) return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
      return rawGet.apply(this, arguments);
    };
    Storage.prototype.setItem = function (k, v) {
      if (isAppKey(this, k)) { mem[k] = String(v); return; }
      return rawSet.apply(this, arguments);
    };
    Storage.prototype.removeItem = function (k) {
      if (isAppKey(this, k)) {
        if (k === LS_KEY) mem[LS_KEY] = JSON.stringify(buildSeed()); else delete mem[k];
        return;
      }
      return rawRemove.apply(this, arguments);
    };
  }

  /* ================= in-memory IndexedDB =================
   * The app uses IndexedDB only for license photos and voice memos,
   * through a tiny wrapper (open + put/get/getAll/delete/clear on two
   * stores). This fake implements exactly that surface over a Map, so
   * photos and memos work during the visit and vanish with the page. */
  function FakeRequest() { this.result = null; this.error = null; this.onsuccess = null; this.onerror = null; }
  function FakeObjectStore(db, name) { this._db = db; this.name = name; }
  function storeMap(db, name) {
    if (!db._stores[name]) db._stores[name] = new Map();
    return db._stores[name];
  }
  function runOp(tx, fn) {
    var req = new FakeRequest();
    tx._pending++;
    setTimeout(function () {
      try { req.result = fn(); if (req.onsuccess) req.onsuccess({ target: req }); }
      catch (e) { req.error = e; if (req.onerror) req.onerror({ target: req }); }
      tx._pending--;
      if (tx._pending === 0 && tx.oncomplete) {
        var cb = tx.oncomplete; setTimeout(function () { cb(); }, 0);
      }
    }, 0);
    return req;
  }
  FakeObjectStore.prototype.put = function (obj) {
    var m = storeMap(this._db, this.name), tx = this._tx;
    return runOp(tx, function () { m.set(obj.id, obj); return obj.id; });
  };
  FakeObjectStore.prototype.get = function (key) {
    var m = storeMap(this._db, this.name), tx = this._tx;
    return runOp(tx, function () { return m.has(key) ? m.get(key) : undefined; });
  };
  FakeObjectStore.prototype.getAll = function () {
    var m = storeMap(this._db, this.name), tx = this._tx;
    return runOp(tx, function () { return Array.from(m.values()); });
  };
  FakeObjectStore.prototype.delete = function (key) {
    var m = storeMap(this._db, this.name), tx = this._tx;
    return runOp(tx, function () { m.delete(key); return undefined; });
  };
  FakeObjectStore.prototype.clear = function () {
    var m = storeMap(this._db, this.name), tx = this._tx;
    return runOp(tx, function () { m.clear(); return undefined; });
  };
  function FakeTransaction(db, names) {
    this._db = db; this._names = names; this._pending = 0;
    this.oncomplete = null; this.onerror = null; this.error = null;
  }
  FakeTransaction.prototype.objectStore = function (name) {
    var s = new FakeObjectStore(this._db, name); s._tx = this; return s;
  };
  function FakeDB(name) {
    this.name = name; this._stores = {};
    var self = this;
    this.objectStoreNames = {
      contains: function (n) { return Object.prototype.hasOwnProperty.call(self._stores, n); },
      get length() { return Object.keys(self._stores).length; }
    };
  }
  FakeDB.prototype.createObjectStore = function (name) {
    storeMap(this, name);
    return new FakeObjectStore(this, name);
  };
  FakeDB.prototype.transaction = function (names) {
    if (typeof names === 'string') names = [names];
    return new FakeTransaction(this, names);
  };
  var fakeDB = new FakeDB('opossumfoot');
  var fakeIndexedDB = {
    open: function () {
      var req = new FakeRequest();
      setTimeout(function () {
        req.result = fakeDB;
        if (req.onupgradeneeded) {
          try { req.onupgradeneeded({ target: req }); } catch (e) { /* store creation is best-effort */ }
        }
        req.result = fakeDB;
        if (req.onsuccess) req.onsuccess({ target: req });
      }, 0);
      return req;
    }
  };
  var idbFaked = false;
  try {
    Object.defineProperty(window, 'indexedDB', { value: fakeIndexedDB, configurable: true, writable: true });
    idbFaked = (window.indexedDB === fakeIndexedDB);
  } catch (e) {
    try { window.indexedDB = fakeIndexedDB; idbFaked = (window.indexedDB === fakeIndexedDB); } catch (e2) { idbFaked = false; }
  }
  window.__ofFence = { storageShadowed: storageShadowed, idbFaked: idbFaked };

  /* ================= privacy fetch stubs ================= */
  function jsonResponse(obj) {
    return new Response(JSON.stringify(obj), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }
  var realFetch = (typeof window.fetch === 'function') ? window.fetch.bind(window) : null;
  window.fetch = function (input, init) {
    var url = '';
    try { url = (typeof input === 'string') ? input : (input && input.url) || ''; } catch (e) { url = ''; }
    if (url.indexOf('api.bigdatacloud.net') !== -1) {
      /* parseBigDataCloud strips a trailing " County": name "Prairie
       * County" -> county "Prairie" -> banner "Prairie County". */
      return Promise.resolve(jsonResponse({
        principalSubdivision: 'Kansas', principalSubdivisionCode: 'US-KS',
        localityInfo: { administrative: [{ adminLevel: 6, name: 'Prairie County' }] }
      }));
    }
    if (url.indexOf('nominatim.openstreetmap.org') !== -1) {
      return Promise.resolve(jsonResponse({ address: { county: 'Prairie County', state: 'Kansas' } }));
    }
    if (url.indexOf('api.open-meteo.com') !== -1) {
      return Promise.resolve(jsonResponse(buildOpenMeteo()));
    }
    if (url.indexOf('api.weather.gov/points/') !== -1) {
      return Promise.resolve(jsonResponse({
        properties: {
          forecast: 'https://api.weather.gov/gridpoints/DMX/50,50/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/DMX/50,50/forecast/hourly'
        }
      }));
    }
    if (url.indexOf('api.weather.gov/gridpoints/') !== -1) {
      return Promise.resolve(jsonResponse({ properties: { periods: buildNWS().daily } }));
    }
    if (url.indexOf('api.weather.gov/alerts/') !== -1) {
      return Promise.resolve(jsonResponse({ features: [] }));
    }
    if (realFetch) return realFetch(input, init);
    return Promise.reject(new Error('fetch unavailable'));
  };

  /* ================= seed the county banner =================
   * On a real install the banner is set from the first GPS fix's
   * geocode (app.js, locate path). The demo's home IS Prairie County,
   * and its geocoder is stubbed to say so — this simply makes the same
   * call the app makes on a fix, with the seed home's own result, once
   * the main view is up. It uses the app's own setCountyBanner. */
  var bannerTries = 0;
  var bannerTimer = setInterval(function () {
    bannerTries++;
    var main = document.getElementById('view-main');
    if (main && main.classList.contains('active') &&
        typeof window.setCountyBanner === 'function') {
      try {
        window.setCountyBanner({ county: 'Prairie', stateName: 'Kansas', stateCode: 'KS' });
        if (typeof window.noteCountyBannerAt === 'function') {
          window.noteCountyBannerAt(SAMPLE_CENTER.lat, SAMPLE_CENTER.lng);
        }
      } catch (e) { /* banner stays on the app's default until a locate */ }
      clearInterval(bannerTimer);
    }
    if (bannerTries > 80) clearInterval(bannerTimer);
  }, 250);

  /* ================= stay-but-explain interception =================
   * Fencing pass (2026-11-19): controls whose real function moves data
   * off the phone (exports, imports, shares, Save Photo), wipes it
   * (Erase, Purge), or opens the microphone (dictation, Record memo)
   * stay visible — the demo IS the app — but in the demo a tap
   * EXPLAINS instead of acting. One capture-phase listener on the
   * document sees the tap before the app's own handlers (onclick
   * properties wired at boot) and stops it there: no download, no
   * share sheet, no fetch of a pasted link, no deletion, no mic — and
   * the hidden file inputs are never clicked by the import buttons;
   * they are intercepted themselves too, as a belt-and-braces, so no
   * file dialog can open. The explanation rides the app's own toast;
   * it is re-shown on the app's own ~3.2s toast timer so the full
   * text stays readable for ~12 seconds. Because Erase is intercepted,
   * the storage layer's silent reseed-on-erase above is no longer
   * reachable from the Erase button; it remains only as a safety net
   * behind storage clears the UI cannot trigger. */
  var EXPLAIN_TEXT = {
    'btn-backup': "In the full app, this saves one file holding your whole line — sets, catches, and logs — so you can restore it after a reinstall or move it to a new phone. The demo doesn't save or send any files.",
    'btn-export-media': "In the full app, this bundles every photo and voice memo from every line into one ZIP — the backup for your pictures. The demo doesn't download anything.",
    'btn-share-line': "In the full app, this sends the line you're on — its sets and logs — to another trapper as a file that lands on their phone as a new line of their own. The demo doesn't share anything out.",
    'btn-import': "In the full app, this brings in a backup file or a line another trapper shared with you. The demo doesn't take files in.",
    'import-file': "In the full app, this brings in a backup file or a line another trapper shared with you. The demo doesn't take files in.",
    'btn-import-pins': "In the full app, this turns pins you saved in Google Maps, My Maps, or Google Takeout into sets on the line you're on. The demo doesn't import pins.",
    'import-pins-file': "In the full app, this turns pins you saved in Google Maps, My Maps, or Google Takeout into sets on the line you're on. The demo doesn't import pins.",
    'btn-paste-pin': "In the full app, you paste a Google Maps share link and that one pin lands on your line as a set. The demo doesn't fetch links.",
    'btn-export-catches': "In the full app, this downloads your catches as a spreadsheet, honoring the filters above. The demo doesn't download files.",
    'btn-export-sets': "In the full app, this downloads your sets as a spreadsheet file. The demo doesn't download files.",
    'btn-export-mileage': "In the full app, this downloads this line's trip log as a spreadsheet. The demo doesn't download files.",
    'btn-share-photos': "In the full app, this bundles the line's set and catch photos into one file to send to another trapper, whose app re-attaches them by set name. The demo doesn't send photos out.",
    'm-ph-save': "In the full app, this puts the photo in your phone's library or hands it to the share sheet. The demo keeps its sample photos inside the demo.",
    'm2-ph-save': "In the full app, this puts the photo in your phone's library or hands it to the share sheet. The demo keeps its sample photos inside the demo.",
    'btn-erase': "In the full app, this wipes every record off the phone for good — no undo, no cloud copy. In the demo there's nothing to lose: the Reset button restores the sample line.",
    'btn-purge': "In the full app, this permanently deletes the catch history you pick here. The demo keeps its sample history — Reset restores the sample line.",
    'btn-voice-setnotes': "In the full app, you dictate notes and record voice memos that stay on your phone. The demo doesn't record.",
    'btn-voice-lognotes': "In the full app, you dictate notes and record voice memos that stay on your phone. The demo doesn't record.",
    'btn-se-memo': "In the full app, you dictate notes and record voice memos that stay on your phone. The demo doesn't record.",
    'btn-log-memo': "In the full app, you dictate notes and record voice memos that stay on your phone. The demo doesn't record."
  };
  var explainToken = 0;
  function demoExplain(msg) {
    if (typeof window.toast !== 'function') return;
    var token = ++explainToken;
    window.toast(msg);
    [3000, 6000, 9000].forEach(function (delay) {
      setTimeout(function () {
        if (token === explainToken && typeof window.toast === 'function') window.toast(msg);
      }, delay);
    });
  }
  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document) {
      if (el.id && Object.prototype.hasOwnProperty.call(EXPLAIN_TEXT, el.id)) {
        e.preventDefault();
        e.stopPropagation();
        demoExplain(EXPLAIN_TEXT[el.id]);
        return;
      }
      el = el.parentNode;
    }
  }, true);

  /* ================= frame fit ================= */
  if (/notch/.test(location.hash || '')) {
    var st = document.createElement('style');
    st.textContent = '#county-banner{padding-top:32px;}';
    document.documentElement.appendChild(st);
  }
})();
