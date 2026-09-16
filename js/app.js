/* ============================================================
   SahyogNET — app.js
   Core: state, storage, i18n, shell rendering, modal, toast,
   matching algorithm, trust score.
   ============================================================ */

window.SN = window.SN || {};

SN.KEY     = 'sahyognet.state.v1';
SN.VERSION = 3;

/* ============================================================
   1. SMALL HELPERS
   ============================================================ */
SN.esc = function (v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
};
SN.money = function (n) { return '₹' + Number(n).toLocaleString('en-IN'); };
SN.qs    = function (k) { return new URLSearchParams(location.search).get(k); };
SN.uid   = function (p) { return p + Math.floor(1000 + Math.random() * 9000); };
SN.nowISO= function () { return new Date().toISOString(); };
SN.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

SN.fmtDate = function (iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
};
SN.fmtTime = function (iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('en-IN', { hour:'numeric', minute:'2-digit' });
};
SN.fmtDT = function (iso) { return SN.fmtDate(iso) + ' · ' + SN.fmtTime(iso); };

SN.ago = function (iso) {
  var diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago';
  if (diff < 604800) return Math.floor(diff / 86400) + ' d ago';
  return SN.fmtDate(iso);
};

SN.initials = function (name) {
  return String(name || '').split(' ').filter(Boolean).slice(0, 2)
    .map(function (w) { return w[0].toUpperCase(); }).join('');
};

/* ============================================================
   2. STATE + STORAGE
   ============================================================ */
SN.state = null;

SN.seed = function () {
  var d = SN.DATA;
  var clone = function (x) { return JSON.parse(JSON.stringify(x)); };
  return {
    version: SN.VERSION,
    lang: 'en',
    role: null,
    currentUser: { customer:'c1', worker:'w1', admin:'coop1', fed:'fed1' },
    savedWorkers: ['w2','w5','w11'],
    workers: clone(d.workers),
    bookings: clone(d.bookings),
    notifications: clone(d.notifications),
    complaints: clone(d.complaints),
    verifications: clone(d.verifications),
    training: clone(d.training),
    activities: clone(d.activities),
    radiusExpanded: false,
    lastSearch: ''
  };
};

SN.load = function () {
  var raw = null;
  try { raw = localStorage.getItem(SN.KEY); } catch (e) { raw = null; }
  if (raw) {
    try {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.version === SN.VERSION) SN.state = parsed;
    } catch (e) { /* ignore corrupt state */ }
  }
  if (!SN.state) { SN.state = SN.seed(); SN.save(); }
  return SN.state;
};

SN.save = function () {
  try { localStorage.setItem(SN.KEY, JSON.stringify(SN.state)); } catch (e) {}
};

SN.reset = function () {
  SN.state = SN.seed();
  SN.save();
  if (document.body.dataset.role) {
    setTimeout(function () { location.reload(); }, 700);
  }
};

/* ============================================================
   3. I18N — English / हिंदी (common labels only)
   ============================================================ */
SN.I18N = {
  en: {
    dashboard:'Dashboard', services:'Find Services', bookings:'My Bookings',
    notifications:'Notifications', profile:'Profile', settings:'Settings',
    requests:'Job Requests', jobs:'My Jobs', schedule:'Schedule', earnings:'Earnings',
    workers:'Workers', verification:'Verification', customers:'Customers',
    analytics:'Analytics', demand:'Demand Heatmap', complaints:'Complaints',
    cooperatives:'Cooperatives', 'regional-demand':'Regional Demand',
    'skill-gaps':'Skill Gaps', training:'Training',
    search:'Search', book:'Book Now', viewProfile:'View Profile',
    available:'Available Now', verified:'Cooperative Verified',
    smartMatch:'Smart Match', trustScore:'Trust Score',
    whyWorker:'Why this worker?', estimated:'Estimated',
    upcoming:'Upcoming', active:'Active', completed:'Completed', cancelled:'Cancelled',
    login:'Login', logout:'Switch Role', reset:'Reset Demo Data',
    welcome:'Welcome back', findService:'Find a Service', urgent:'Urgent Service'
  },
  hi: {
    dashboard:'डैशबोर्ड', services:'सेवाएँ खोजें', bookings:'मेरी बुकिंग',
    notifications:'सूचनाएँ', profile:'प्रोफ़ाइल', settings:'सेटिंग्स',
    requests:'कार्य अनुरोध', jobs:'मेरे कार्य', schedule:'समय-सारणी', earnings:'कमाई',
    workers:'श्रमिक', verification:'सत्यापन', customers:'ग्राहक',
    analytics:'विश्लेषण', demand:'मांग हीटमैप', complaints:'शिकायतें',
    cooperatives:'सहकारी समितियाँ', 'regional-demand':'क्षेत्रीय मांग',
    'skill-gaps':'कौशल अंतराल', training:'प्रशिक्षण',
    search:'खोजें', book:'बुक करें', viewProfile:'प्रोफ़ाइल देखें',
    available:'अभी उपलब्ध', verified:'सहकारी सत्यापित',
    smartMatch:'स्मार्ट मैच', trustScore:'ट्रस्ट स्कोर',
    whyWorker:'यह श्रमिक क्यों?', estimated:'अनुमानित',
    upcoming:'आगामी', active:'सक्रिय', completed:'पूर्ण', cancelled:'रद्द',
    login:'लॉगिन', logout:'भूमिका बदलें', reset:'डेमो डेटा रीसेट',
    welcome:'वापसी पर स्वागत', findService:'सेवा खोजें', urgent:'अत्यावश्यक सेवा'
  }
};
SN.t = function (k) {
  var lang = (SN.state && SN.state.lang) || 'en';
  return (SN.I18N[lang] && SN.I18N[lang][k]) || SN.I18N.en[k] || k;
};
SN.setLang = function (lang) {
  SN.state.lang = lang;
  SN.save();
  if (document.body.dataset.role) {
    SN.render(document.body.dataset.role, document.body.dataset.page || 'dashboard');
  }
};

/* ============================================================
   4. NAVIGATION CONFIG
   ============================================================ */
SN.NAV = {
  customer: [
    { id:'dashboard',     label:'Dashboard',     icon:'▦', href:'dashboard.html' },
    { id:'services',      label:'Find Services', icon:'⌕', href:'services.html' },
    { id:'bookings',      label:'My Bookings',   icon:'▤', href:'bookings.html' },
    { id:'notifications', label:'Notifications', icon:'◔', href:'notifications.html' },
    { id:'profile',       label:'Profile',       icon:'◍', href:'profile.html' }
  ],
  worker: [
    { id:'dashboard',     label:'Dashboard',     icon:'▦', href:'dashboard.html' },
    { id:'requests',      label:'Job Requests',  icon:'◈', href:'requests.html' },
    { id:'jobs',          label:'My Jobs',       icon:'▤', href:'jobs.html' },
    { id:'schedule',      label:'Schedule',      icon:'▦', href:'schedule.html' },
    { id:'earnings',      label:'Earnings',      icon:'₹', href:'earnings.html' },
    { id:'profile',       label:'Profile',       icon:'◍', href:'profile.html' }
  ],
  admin: [
    { id:'dashboard',    label:'Dashboard',      icon:'▦', href:'dashboard.html' },
    { id:'workers',      label:'Workers',        icon:'👷', href:'workers.html' },
    { id:'verification', label:'Verification',   icon:'✓', href:'verification.html' },
    { id:'customers',    label:'Customers',      icon:'👥', href:'customers.html' },
    { id:'services',     label:'Services',       icon:'⚙', href:'services.html' },
    { id:'analytics',    label:'Analytics',      icon:'▲', href:'analytics.html' },
    { id:'demand',       label:'Demand Heatmap', icon:'▩', href:'demand.html' },
    { id:'complaints',   label:'Complaints',     icon:'⚠', href:'complaints.html' }
  ],
  federation: [
    { id:'dashboard',       label:'Dashboard',       icon:'▦', href:'dashboard.html' },
    { id:'cooperatives',    label:'Cooperatives',    icon:'🏢', href:'cooperatives.html' },
    { id:'regional-demand', label:'Regional Demand', icon:'▲', href:'regional-demand.html' },
    { id:'skill-gaps',      label:'Skill Gaps',      icon:'◑', href:'skill-gaps.html' },
    { id:'training',        label:'Training',        icon:'🎓', href:'training.html' }
  ]
};

/* Which nav item should be highlighted for a sub-page */
SN.PAGE_PARENT = {
  'worker-profile':'services',
  'booking-details':'bookings',
  'job-details':'jobs'
};

SN.ROLE_LABEL = {
  customer:'Customer', worker:'Worker / Service Provider',
  admin:'Cooperative Admin', federation:'Federation Admin'
};

SN.PAGES = {}; /* role files register here: SN.PAGES['customer:dashboard'] = fn */

/* ============================================================
   5. SMART MATCHING ALGORITHM
   ------------------------------------------------------------
   Weighted score out of 100. Each factor is normalised to 0..1
   and multiplied by its weight, then summed.

     Skill match       30   (exact service = 1.0, alt service = 0.7, else 0.25)
     Distance          20   (closer is better, zero score beyond 8 km)
     Rating            15   (3.4 → 0, 5.0 → 1)
     Availability      10   (available now = 1.0, otherwise 0.45)
     Response rate     10   (worker.responseRate / 100)
     Completion rate   10   (worker.completionRate / 100)
     Experience         5   (10+ years = full marks)

   The result is deterministic for the same inputs, so the demo is
   reproducible. No AI API is used.
   ============================================================ */
SN.WEIGHTS = { skill:30, distance:20, rating:15, availability:10, response:10, completion:10, experience:5 };

SN.matchScore = function (worker, serviceKey, distanceKm) {
  var W = SN.WEIGHTS;
  var dist = (distanceKm == null) ? worker.distanceKm : distanceKm;

  var skill;
  if (worker.serviceKey === serviceKey) skill = 1.0;
  else if ((worker.altServices || []).indexOf(serviceKey) > -1) skill = 0.7;
  else skill = 0.25;

  var d     = SN.clamp(1 - (dist / 8), 0, 1);
  var rat   = SN.clamp((worker.rating - 3.4) / 1.6, 0, 1);
  var avail = worker.available ? 1 : 0.45;
  var resp  = SN.clamp(worker.responseRate / 100, 0, 1);
  var comp  = SN.clamp(worker.completionRate / 100, 0, 1);
  var exp   = SN.clamp(worker.experience / 10, 0, 1);

  var total = skill * W.skill + d * W.distance + rat * W.rating +
              avail * W.availability + resp * W.response +
              comp * W.completion + exp * W.experience;

  return {
    score: Math.round(total),
    parts: [
      { label:'Skill match',     value: Math.round(skill * 100), weight: W.skill,      cls:'g' },
      { label:'Distance',        value: Math.round(d * 100),     weight: W.distance,   cls:''  },
      { label:'Rating',          value: Math.round(rat * 100),   weight: W.rating,     cls:'a' },
      { label:'Availability',    value: Math.round(avail * 100), weight: W.availability,cls:'g' },
      { label:'Response rate',   value: Math.round(resp * 100),  weight: W.response,   cls:''  },
      { label:'Completion rate', value: Math.round(comp * 100),  weight: W.completion, cls:'g' },
      { label:'Experience',      value: Math.round(exp * 100),   weight: W.experience, cls:'a' }
    ]
  };
};

/* Rank a list of workers for a service, best first */
SN.rankWorkers = function (serviceKey, opts) {
  opts = opts || {};
  var maxDist = opts.maxDist || 5;
  var verifiedOnly = !!opts.verifiedOnly;
  var availableOnly = !!opts.availableOnly;
  var minRating = opts.minRating || 0;

  var pool = SN.state.workers.filter(function (w) {
    if (verifiedOnly && !w.verified) return false;
    if (availableOnly && !w.available) return false;
    if (w.rating < minRating) return false;
    return true;
  });

  var within = pool.filter(function (w) { return w.distanceKm <= maxDist; });
  var scanned = within.length ? within : pool;

  return scanned.map(function (w) {
    var m = SN.matchScore(w, serviceKey, w.distanceKm);
    return { worker: w, score: m.score, parts: m.parts };
  }).sort(function (a, b) { return b.score - a.score; });
};

/* ============================================================
   6. TRUST SCORE
   ------------------------------------------------------------
   Rating = customer satisfaction.
   Trust Score = platform/cooperative reliability.
   Components: identity 20, skill verification 25, experience 15,
   completion rate 20, customer satisfaction 20.
   ============================================================ */
SN.trustScore = function (worker) {
  var skillMap = { High:100, Medium:80, Low:60, Pending:35, None:20 };

  var identity = worker.verified ? 100 : 45;
  var skill    = skillMap[worker.verifyLevel] || 40;
  var exp      = SN.clamp(worker.experience * 11, 0, 100);
  var comp     = worker.completionRate;
  var sat      = (worker.rating / 5) * 100;

  var total = identity * 0.20 + skill * 0.25 + exp * 0.15 + comp * 0.20 + sat * 0.20;

  return {
    total: Math.round(total),
    parts: [
      { label:'Identity verification', value: Math.round(identity), ok: worker.verified },
      { label:'Skill verification',    value: Math.round(skill),    ok: worker.verifyLevel === 'High' || worker.verifyLevel === 'Medium' },
      { label:'Experience',            value: Math.round(exp),      ok: worker.experience >= 5 },
      { label:'Completion rate',       value: Math.round(comp),     ok: worker.completionRate >= 90 },
      { label:'Customer service',      value: Math.round(sat),      ok: worker.rating >= 4.5 }
    ]
  };
};

/* ============================================================
   7. BOOKING TIMELINE
   ============================================================ */
SN.TIMELINE = ['Request Sent', 'Worker Accepted', 'Worker On The Way', 'Service Started', 'Completed'];

SN.stepIndex = function (status) {
  var map = {
    'Request Sent':0, 'Accepted':1, 'On The Way':2, 'Arrived':2,
    'In Progress':3, 'Completed':4, 'Cancelled':-1
  };
  return map[status] == null ? 0 : map[status];
};

SN.statusBadge = function (status) {
  var map = {
    'Request Sent':'badge-blue', 'Accepted':'badge-blue', 'On The Way':'badge-amber',
    'Arrived':'badge-amber', 'In Progress':'badge-amber', 'Completed':'badge-green',
    'Cancelled':'badge-red', 'Open':'badge-red', 'Resolved':'badge-green',
    'Pending':'badge-amber', 'Approved':'badge-green', 'Rejected':'badge-red',
    'Active':'badge-green', 'Inactive':'badge-grey', 'Watch':'badge-amber'
  };
  return map[status] || 'badge-grey';
};

/* ============================================================
   8. STATE MUTATIONS
   ============================================================ */
SN.getBooking = function (id) {
  return SN.state.bookings.filter(function (b) { return b.id === id; })[0] || null;
};
SN.getWorker = function (id) {
  return SN.state.workers.filter(function (w) { return w.id === id; })[0] || null;
};
SN.getCustomer = function (id) {
  return SN.DATA.customers.filter(function (c) { return c.id === id; })[0] || null;
};

SN.setBookingStatus = function (id, status, note) {
  var b = SN.getBooking(id);
  if (!b) return null;
  b.status = status;
  if (status === 'Completed') b.completedAt = SN.nowISO();
  SN.save();
  if (note) SN.notify(b.customerId, 'customer', 'info', note.title || status, note.body || '');
  return b;
};

SN.notify = function (userId, role, type, title, body) {
  SN.state.notifications.unshift({
    id: SN.uid('n'), role: role, type: type, title: title, body: body,
    time: SN.nowISO(), read: false, userId: userId
  });
  SN.save();
};

SN.addActivity = function (text, type) {
  SN.state.activities.unshift({ id: SN.uid('a'), text: text, time: SN.nowISO(), type: type || 'info' });
  SN.state.activities = SN.state.activities.slice(0, 30);
  SN.save();
};

SN.unreadCount = function (role) {
  return SN.state.notifications.filter(function (n) {
    return n.role === role && !n.read;
  }).length;
};

/* ============================================================
   9. TOAST
   ============================================================ */
SN.toast = function (msg, type, sub) {
  var host = document.querySelector('.toast-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  var icons = { success:'✓', warn:'⚠', error:'✕', info:'ℹ' };
  var t = type || 'info';
  var el = document.createElement('div');
  el.className = 'toast ' + t;
  el.setAttribute('role', 'status');
  el.innerHTML =
    '<span class="t-ic">' + (icons[t] || 'ℹ') + '</span>' +
    '<div><div class="t-title">' + SN.esc(msg) + '</div>' +
    (sub ? '<div class="t-msg">' + SN.esc(sub) + '</div>' : '') + '</div>';
  host.appendChild(el);
  setTimeout(function () {
    el.style.transition = 'opacity .25s, transform .25s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(function () { el.remove(); }, 260);
  }, 3400);
};

/* ============================================================
   10. MODAL
   ============================================================ */
SN.modal = function (opts) {
  var back = document.createElement('div');
  back.className = 'modal-back';
  back.setAttribute('role', 'dialog');
  back.setAttribute('aria-modal', 'true');

  var actionsHTML = (opts.actions || []).map(function (a, i) {
    return '<button class="btn ' + (a.cls || 'btn-ghost') + '" data-act="' + i + '">' + SN.esc(a.label) + '</button>';
  }).join('');

  back.innerHTML =
    '<div class="modal ' + (opts.wide ? 'wide' : '') + '">' +
      '<div class="modal-head">' +
        '<div><h3>' + SN.esc(opts.title || '') + '</h3>' +
        (opts.sub ? '<div class="modal-sub">' + SN.esc(opts.sub) + '</div>' : '') + '</div>' +
        '<button class="modal-close" aria-label="Close">×</button>' +
      '</div>' +
      '<div class="modal-body">' + (opts.body || '') + '</div>' +
      (actionsHTML ? '<div class="modal-foot">' + actionsHTML + '</div>' : '') +
    '</div>';

  document.body.appendChild(back);
  document.body.style.overflow = 'hidden';

  function close() {
    back.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  document.addEventListener('keydown', onKey);

  back.querySelector('.modal-close').addEventListener('click', close);
  back.addEventListener('mousedown', function (e) { if (e.target === back) close(); });

  (opts.actions || []).forEach(function (a, i) {
    back.querySelector('[data-act="' + i + '"]').addEventListener('click', function () {
      if (a.onClick) a.onClick(close, back);
      else close();
    });
  });

  if (opts.onOpen) opts.onOpen(back, close);
  var firstInput = back.querySelector('input,select,textarea,button.btn');
  if (firstInput) firstInput.focus();

  return { close: close, root: back };
};

/* ============================================================
   11. SHARED UI FRAGMENTS
   ============================================================ */
SN.bars = function (parts) {
  return '<div class="bars">' + parts.map(function (p) {
    return '<div class="bar-row">' +
      '<span>' + SN.esc(p.label) + '</span>' +
      '<span class="bar-track"><span class="bar-fill ' + (p.cls || '') + '" style="width:' + p.value + '%"></span></span>' +
      '<span class="val">' + p.value + '%</span>' +
    '</div>';
  }).join('') + '</div>';
};

SN.avatar = function (worker, extraClass) {
  var cls = 'avatar ' + (extraClass || '');
  if (worker.verifyLevel === 'High') cls += ' g';
  else if (worker.verifyLevel === 'Medium') cls += ' a';
  return '<div class="' + cls + '" aria-hidden="true">' + SN.esc(worker.initials || SN.initials(worker.name)) + '</div>';
};

SN.empty = function (title, sub, icon) {
  return '<div class="empty"><div class="empty-ic">' + (icon || '◌') + '</div>' +
    '<h4>' + SN.esc(title) + '</h4><p>' + SN.esc(sub || '') + '</p></div>';
};

SN.kpi = function (label, value, sub, subCls) {
  return '<div class="kpi">' +
    '<div class="kpi-label">' + SN.esc(label) + '</div>' +
    '<div class="kpi-value">' + value + '</div>' +
    (sub ? '<div class="kpi-sub ' + (subCls || '') + '">' + sub + '</div>' : '') +
  '</div>';
};

SN.barChart = function (data, opts) {
  opts = opts || {};
  var max = Math.max.apply(null, data.map(function (d) { return d[opts.key || 'jobs']; })) || 1;
  return '<div class="chart">' + data.map(function (d, i) {
    var v = d[opts.key || 'jobs'];
    var h = Math.round((v / max) * 100);
    var cls = opts.alt ? (i % 2 ? 'g' : '') : '';
    return '<div class="col">' +
      '<div class="cv">' + (opts.prefix || '') + v + '</div>' +
      '<div class="bar ' + cls + '" style="height:' + h + '%"></div>' +
      '<div class="cl">' + SN.esc(d.label) + '</div>' +
    '</div>';
  }).join('') + '</div>';
};

SN.hBarChart = function (data) {
  var max = Math.max.apply(null, data.map(function (d) { return d.value; })) || 1;
  return '<div class="chart-h">' + data.map(function (d) {
    var pct = Math.round((d.value / max) * 100);
    return '<div class="row">' +
      '<span class="lbl">' + SN.esc(d.label) + '</span>' +
      '<span class="bar-track"><span class="bar-fill g" style="width:' + pct + '%"></span></span>' +
      '<span class="val">' + d.value + '</span>' +
    '</div>';
  }).join('') + '</div>';
};

SN.trustBox = function (worker) {
  var ts = SN.trustScore(worker);
  var deg = Math.round((ts.total / 100) * 360);
  return '<div class="trust-box">' +
    '<div class="trust-top">' +
      '<div class="trust-ring" style="background:conic-gradient(var(--green) 0 ' + deg + 'deg, #E9EDF3 ' + deg + 'deg 360deg)">' +
        '<b>' + ts.total + '</b><small>/100</small>' +
      '</div>' +
      '<div class="trust-note">' +
        '<strong>Trust Score</strong><br>' +
        'Platform &amp; cooperative reliability — separate from customer rating (' + worker.rating + ' ★).' +
      '</div>' +
    '</div>' +
    '<div class="trust-parts">' + ts.parts.map(function (p) {
      return '<div class="bar-row">' +
        '<span>' + (p.ok ? '✓ ' : '· ') + SN.esc(p.label) + '</span>' +
        '<span class="bar-track"><span class="bar-fill ' + (p.ok ? 'g' : 'a') + '" style="width:' + p.value + '%"></span></span>' +
        '<span class="val">' + p.value + '</span>' +
      '</div>';
    }).join('') + '</div>' +
  '</div>';
};

SN.timeline = function (booking) {
  var idx = SN.stepIndex(booking.status);
  var cancelled = booking.status === 'Cancelled';
  return '<div class="timeline">' + SN.TIMELINE.map(function (label, i) {
    var cls = 'tl-step';
    if (!cancelled && i < idx) cls += ' done';
    if (!cancelled && i === idx && idx < 4) cls += ' current';
    if (!cancelled && i === idx && idx === 4) cls += ' done';
    if (cancelled) cls += i <= idx ? ' done' : '';
    var mark = (!cancelled && i < idx) ? '✓' : (i === idx ? '' : '');
    return '<div class="' + cls + '">' +
      '<div class="tl-dot">' + mark + '</div>' +
      '<div><div class="tl-label">' + SN.esc(label) + '</div>' +
      (i === idx && !cancelled ? '<div class="tl-time">In progress</div>' : '') +
      '</div>' +
    '</div>';
  }).join('') + '</div>';
};

/* ============================================================
   12. APP SHELL RENDERING
   ============================================================ */
SN.render = function (role, page) {
  SN.state.role = role;
  SN.save();

  var app = document.getElementById('app');
  if (!app) return;

  var nav = SN.NAV[role] || [];
  var activeId = SN.PAGE_PARENT[page] || page;

  var navHTML = nav.map(function (item) {
    var active = item.id === activeId ? ' active' : '';
    return '<a class="sb-link' + active + '" href="' + item.href + '">' +
      '<span class="sb-ic">' + item.icon + '</span>' +
      '<span class="sb-label">' + SN.esc(SN.t(item.id)) + '</span>' +
    '</a>';
  }).join('');

  var unread = SN.unreadCount(role);
  var notifHref = role === 'customer' ? 'notifications.html' : (role === 'worker' ? 'requests.html' : 'complaints.html');

  var user = SN.currentUserFor(role);

  app.innerHTML =
  '<div class="shell">' +
    '<aside class="sidebar" id="sidebar">' +
      '<div class="sb-head">' +
        '<a class="brand" href="../index.html">' +
          '<span class="logo-mark">स</span>' +
          '<span class="brand-text">Sahyog<strong>NET</strong></span>' +
        '</a>' +
      '</div>' +
      '<nav class="sb-nav" aria-label="Main navigation">' + navHTML +
        '<div class="sb-sep"></div>' +
        '<a class="sb-link" href="../login.html"><span class="sb-ic">⇄</span><span class="sb-label">' + SN.esc(SN.t('logout')) + '</span></a>' +
      '</nav>' +
      '<div class="sb-foot">' +
        '<div class="sb-user">' +
          '<div class="avatar" aria-hidden="true">' + SN.esc(SN.initials(user.name)) + '</div>' +
          '<div><div class="u-name">' + SN.esc(user.name) + '</div>' +
          '<div class="u-role">' + SN.esc(SN.ROLE_LABEL[role]) + '</div></div>' +
        '</div>' +
        
      '</div>' +
    '</aside>' +

    '<div class="sb-scrim" id="sbScrim"></div>' +

    '<div class="main-col">' +
      '<header class="topbar">' +
        '<button class="icon-btn" id="sbToggle" aria-label="Open navigation">☰</button>' +
        '<div class="tb-title">' +
          '<h1 id="tbTitle">' + SN.esc(SN.pageTitle(role, page)) + '</h1>' +
          '<p class="tb-sub" id="tbSub">' + SN.esc(SN.pageSub(role)) + '</p>' +
        '</div>' +
        '<div class="tb-actions">' +
          '<button class="icon-btn lang-btn" id="langBtn" title="Switch language" aria-label="Switch language">' +
            (SN.state.lang === 'en' ? 'हिं' : 'EN') +
          '</button>' +
          '<a class="icon-btn" href="' + notifHref + '" aria-label="Notifications">◔' +
            (unread ? '<span class="dot-badge">' + unread + '</span>' : '') +
          '</a>' +
          '<div class="tb-user">' +
            '<div class="avatar" aria-hidden="true">' + SN.esc(SN.initials(user.name)) + '</div>' +
            '<div><div class="u-name">' + SN.esc(user.name) + '</div>' +
            '<div class="u-role">' + SN.esc(SN.ROLE_LABEL[role]) + '</div></div>' +
          '</div>' +
        '</div>' +
      '</header>' +
      '<main class="main" id="main"></main>' +
    '</div>' +
  '</div>';

  /* --- shell events --- */
  document.getElementById('sbToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sbScrim').classList.toggle('show');
  });
  document.getElementById('sbScrim').addEventListener('click', function () {
    document.getElementById('sidebar').classList.remove('open');
    this.classList.remove('show');
  });
  document.getElementById('langBtn').addEventListener('click', function () {
    SN.setLang(SN.state.lang === 'en' ? 'hi' : 'en');
    SN.toast(SN.state.lang === 'hi' ? 'भाषा: हिंदी' : 'Language: English', 'success');
  });

  /* --- render the page body --- */
  var main = document.getElementById('main');
  var fn = SN.PAGES[role + ':' + page];
  if (fn) {
    fn(main);
  } else {
    main.innerHTML = SN.empty('Coming soon', 'This section is under development.')
  }
};

SN.currentUserFor = function (role) {
  if (role === 'customer') {
    return SN.getCustomer(SN.state.currentUser.customer) || { name:'Aman Sharma' };
  }
  if (role === 'worker') {
    return SN.getWorker(SN.state.currentUser.worker) || { name:'Rajesh Kumar' };
  }
  if (role === 'admin') return { name:'Sahyog Cooperative' };
  return { name:'UP Federation of Cooperatives' };
};

SN.pageTitle = function (role, page) {
  var nav = SN.NAV[role] || [];
  var found = nav.filter(function (n) { return n.id === page; })[0];
  if (found) return SN.t(found.id);
  var special = {
    'worker-profile':'Worker Profile',
    'booking-details':'Booking Details',
    'job-details':'Job Details'
  };
  return special[page] || 'Dashboard';
};

SN.pageSub = function (role) {
  return {
    customer:'Customer workspace',
    worker:'Worker workspace',
    admin:'Cooperative administration',
    federation:'Federation network oversight'
  }[role] || '';
};

/* ============================================================
   13. BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  SN.load();
  var role = document.body.dataset.role;
  if (!role) return;             /* landing / login handle themselves */
  var page = document.body.dataset.page || 'dashboard';
  SN.render(role, page);
});
/* Re-render on orientation change / resize */
window.addEventListener('resize', function () {
  var role = document.body.dataset.role;
  var page = document.body.dataset.page;
  if (!role || !page) return;

  /* Rebuild the two-column grids */
  ['profileGrid','bdGrid','jdGrid','profGrid','earnGrid',
   'adGrid','fdGrid','rdGrid','wpGrid'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (window.innerWidth < 900) {
      el.style.gridTemplateColumns = '1fr';
    } else {
      el.style.gridTemplateColumns = ''; // let the CSS rule take over
    }
  });
});/* ---------- Responsive re-flow on resize / orientation change ---------- */
(function () {
  var reflow = function () {
    var ids = ['profileGrid','bdGrid','jdGrid','profGrid','earnGrid',
               'adGrid','fdGrid','rdGrid','wpGrid'];
    var narrow = window.innerWidth < 960;
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (narrow) {
        el.style.gridTemplateColumns = '1fr';
        el.style.gap = '14px';
      } else {
        el.style.gridTemplateColumns = ''; // let CSS take over
        el.style.gap = '';
      }
    });
  };
  window.addEventListener('resize', reflow);
  window.addEventListener('orientationchange', function () {
    setTimeout(reflow, 250);
  });
  document.addEventListener('DOMContentLoaded', reflow);
})();