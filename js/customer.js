/* ============================================================
   SahyogNET — customer.js
   All customer-facing page renderers.
   ============================================================ */

/* ---------- Dashboard ---------- */
SN.PAGES['customer:dashboard'] = function (main) {
  var s = SN.state;
  var customer = SN.getCustomer(s.currentUser.customer);
  var myBookings = s.bookings.filter(function (b) { return b.customerId === customer.id; });
  var activeBooking = myBookings.filter(function (b) {
    return ['Request Sent','Accepted','On The Way','Arrived','In Progress'].indexOf(b.status) > -1;
  })[0];
  var completed = myBookings.filter(function (b) { return b.status === 'Completed'; }).length;
  var rated = myBookings.filter(function (b) { return b.rating; });
  var avgGiven = rated.length
    ? (rated.reduce(function (a, b) { return a + b.rating.stars; }, 0) / rated.length).toFixed(1)
    : '—';

  /* Recommended workers: rank everyone for the customer's most recent service */
  var seedService = activeBooking ? activeBooking.serviceKey : 'electrician';
  var recos = SN.rankWorkers(seedService, { maxDist:5 }).slice(0, 3);

  main.innerHTML =
    '<div class="page-head">' +
      '<div><h2>' + SN.t('welcome') + ', ' + SN.esc(customer.name.split(' ')[0]) + ' 👋</h2>' +
      '<p class="ph-sub">Gomti Nagar, Lucknow · ' + myBookings.length + ' total bookings</p></div>' +
      '<div class="btn-row">' +
        '<button class="btn btn-primary" id="urgentBtn">⚡ ' + SN.t('urgent') + '</button>' +
        '<a class="btn btn-ghost" href="services.html">' + SN.t('findService') + '</a>' +
      '</div>' +
    '</div>' +

    /* Search */
    '<div class="card mb16">' +
      '<div class="search-wrap">' +
        '<span class="search-ic">⌕</span>' +
        '<input class="input" id="dashSearch" placeholder="What service do you need? e.g. Electrician, Plumber, AC Repair" aria-label="Search service">' +
      '</div>' +
      '<div class="wc-tags mt12" id="quickCats"></div>' +
    '</div>' +

    /* KPIs */
    '<div class="kpi-grid">' +
      SN.kpi('Active Booking', activeBooking ? '1' : '0', activeBooking ? SN.esc(activeBooking.id) : 'No active job', activeBooking ? 'kpi-up' : '') +
      SN.kpi('Completed Services', completed, 'Lifetime on SahyogNET') +
      SN.kpi('Saved Workers', s.savedWorkers.length, 'Quick re-book') +
      SN.kpi('Avg Rating Given', avgGiven + (avgGiven === '—' ? '' : ' ★'), 'Across ' + rated.length + ' reviews') +
    '</div>' +

    /* Active booking */
    (activeBooking
      ? '<div class="card mb16">' +
          '<div class="card-head"><div><div class="card-title">Current Active Booking</div>' +
          '<p class="card-sub">' + SN.esc(activeBooking.id) + ' · ' + SN.esc(activeBooking.service) + '</p></div>' +
          '<span class="badge ' + SN.statusBadge(activeBooking.status) + '">' + SN.esc(activeBooking.status) + '</span></div>' +
          '<div class="bc-grid mb16">' +
            '<div class="bc-field"><div class="lbl">Worker</div><div class="val">' + SN.esc(activeBooking.workerName) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Scheduled</div><div class="val">' + SN.esc(activeBooking.date) + ' · ' + SN.esc(activeBooking.time) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Estimated</div><div class="val">' + SN.money(activeBooking.priceMin) + '–' + SN.money(activeBooking.priceMax) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Address</div><div class="val">' + SN.esc(activeBooking.address) + '</div></div>' +
          '</div>' +
          '<div class="btn-row"><a class="btn btn-primary btn-sm" href="booking-details.html?id=' + activeBooking.id + '">Track Booking</a>' +
          '<a class="btn btn-ghost btn-sm" href="bookings.html">All Bookings</a></div>' +
        '</div>'
      : SN.empty('No active booking right now', 'Start by searching for a service above.', '✓')
    ) +

    /* Urgent band */
    '<div class="urgent-band mb16">' +
      '<div><h4>⚡ Need help immediately?</h4>' +
      '<p>Electrical emergency, water leakage, vehicle breakdown or appliance failure — priority matching activates workers who are available now, close by and verified.</p></div>' +
      '<button class="btn btn-danger" id="urgentBtn2">Raise Urgent Request</button>' +
    '</div>' +

    /* Recommended workers */
    '<div class="row-between mb12">' +
      '<h3 class="mb0">Recommended for you</h3>' +
      '<a class="small" href="services.html">See all →</a>' +
    '</div>' +
    '<div class="grid grid-3 mb24">' + recos.map(function (r) { return workerCard(r, 'dashboard'); }).join('') + '</div>' +

    /* Recent bookings + notifications */
    '<div class="grid grid-2">' +
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Recent Bookings</div>' +
        '<a class="small" href="bookings.html">View all</a></div>' +
        (myBookings.length
          ? myBookings.slice(0, 4).map(function (b) {
              return '<div class="row-between" style="padding:10px 0;border-bottom:1px solid var(--line)">' +
                '<div><div style="font-weight:700;font-size:13.5px">' + SN.esc(b.service) + '</div>' +
                '<div class="tiny muted">' + SN.esc(b.workerName) + ' · ' + SN.esc(b.date) + '</div></div>' +
                '<div style="text-align:right"><div class="small" style="font-weight:700">' + SN.money(b.priceMax) + '</div>' +
                '<span class="badge ' + SN.statusBadge(b.status) + '">' + SN.esc(b.status) + '</span></div>' +
              '</div>';
            }).join('')
          : SN.empty('No bookings yet', 'Your service history will appear here.', '▤')
        ) +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Notifications</div>' +
        '<a class="small" href="notifications.html">View all</a></div>' +
        s.notifications.filter(function (n) { return n.role === 'customer'; }).slice(0, 4).map(function (n) {
          return '<div class="row" style="padding:9px 0;border-bottom:1px solid var(--line);align-items:flex-start">' +
            '<span class="dot ' + (n.type === 'success' ? 'dot-green' : n.type === 'warn' ? 'dot-amber' : 'dot-blue') + '" style="margin-top:7px"></span>' +
            '<div><div style="font-size:13px;font-weight:600">' + SN.esc(n.title) + '</div>' +
            '<div class="tiny muted">' + SN.ago(n.time) + '</div></div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';

  /* quick category chips */
  document.getElementById('quickCats').innerHTML = SN.DATA.services.slice(0, 7).map(function (sv) {
    return '<a class="badge badge-blue" style="font-size:12.5px;padding:6px 11px" href="services.html?service=' +
      sv.key + '">' + sv.icon + ' ' + SN.esc(sv.name) + '</a>';
  }).join('');

  /* search redirect */
  var go = function () {
    var q = document.getElementById('dashSearch').value.trim();
    location.href = 'services.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  };
  document.getElementById('dashSearch').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') go();
  });

  document.getElementById('urgentBtn').addEventListener('click', urgentModal);
  document.getElementById('urgentBtn2').addEventListener('click', urgentModal);
};

/* ---------- Urgent service modal ---------- */
function urgentModal() {
  SN.modal({
    title: '⚡ Urgent Service Request',
    sub: 'Priority matching activated',
    body:
      '<div class="radius-note expanded mb16"><span class="dot dot-red"></span> Priority matching activated — nearest available verified workers first.</div>' +
      '<div class="field"><label>Type of emergency</label>' +
      '<select class="select" id="urgentType">' +
        '<option value="electrician">Electrical emergency</option>' +
        '<option value="plumber">Water leakage</option>' +
        '<option value="mechanic">Vehicle breakdown</option>' +
        '<option value="ac">Appliance failure</option>' +
      '</select></div>' +
      '<div class="field"><label>Describe the problem</label>' +
      '<textarea class="textarea" id="urgentDesc" placeholder="e.g. Sparking from the main switchboard, power cut in half the house."></textarea></div>' +
      '<p class="tiny muted">Workers who are available now, within 3 km and cooperative-verified will be contacted first.</p>',
    actions: [
      { label:'Cancel', cls:'btn-ghost' },
      { label:'Find Priority Workers', cls:'btn-danger', onClick: function (close) {
          var key = document.getElementById('urgentType').value;
          close();
          location.href = 'services.html?service=' + key + '&urgent=1';
        } }
    ]
  });
}

/* ---------- Find Services ---------- */
SN.PAGES['customer:services'] = function (main) {
  var s = SN.state;
  var params = new URLSearchParams(location.search);
  var presetService = params.get('service') || '';
  var presetQuery = params.get('q') || '';
  var urgent = params.get('urgent') === '1';

  main.innerHTML =
    '<div class="page-head">' +
      '<div><div class="breadcrumb"><a href="dashboard.html">' + SN.t('dashboard') + '</a> / ' + SN.t('services') + '</div>' +
      '<h2>' + SN.t('findService') + '</h2>' +
      '<p class="ph-sub">Smart matching ranks verified workers by skill, distance, rating, availability and reliability.</p></div>' +
    '</div>' +

    (urgent ? '<div class="radius-note expanded mb16"><span class="dot dot-red"></span> Priority matching activated — showing workers available right now.</div>' : '') +

    '<div class="card mb16">' +
      '<div class="search-wrap mb12">' +
        '<span class="search-ic">⌕</span>' +
        '<input class="input" id="svcSearch" placeholder="What service do you need?" value="' + SN.esc(presetQuery) + '" aria-label="Search service">' +
      '</div>' +
      '<div class="grid grid-4" style="gap:10px">' +
        '<div class="field mb0"><label>Service type</label>' +
          '<select class="select" id="fService">' +
            '<option value="">All services</option>' +
            SN.DATA.services.map(function (sv) {
              return '<option value="' + sv.key + '"' + (presetService === sv.key ? ' selected' : '') + '>' + SN.esc(sv.name) + '</option>';
            }).join('') +
          '</select></div>' +
        '<div class="field mb0"><label>Max distance</label>' +
          '<select class="select" id="fDistance">' +
            '<option value="3">Within 3 km</option>' +
            '<option value="5">Within 5 km</option>' +
            '<option value="8">Within 8 km</option>' +
          '</select></div>' +
        '<div class="field mb0"><label>Minimum rating</label>' +
          '<select class="select" id="fRating">' +
            '<option value="0">Any rating</option>' +
            '<option value="4.5">4.5 ★ and above</option>' +
            '<option value="4.7">4.7 ★ and above</option>' +
          '</select></div>' +
        '<div class="field mb0"><label>Availability</label>' +
          '<select class="select" id="fAvail">' +
            '<option value="any">Any</option>' +
            '<option value="now">Available now</option>' +
          '</select></div>' +
      '</div>' +
      '<div class="row wrap mt12" style="gap:16px">' +
        '<label class="row small" style="gap:7px"><input type="checkbox" id="fVerified" checked> Cooperative Verified only</label>' +
        '<label class="row small" style="gap:7px"><input type="checkbox" id="fSaved"> Saved workers only</label>' +
      '</div>' +
    '</div>' +

    '<div id="radiusHost"></div>' +
    '<div id="resultsHost"></div>';

  var runSearch = function () {
    var radiusHost = document.getElementById('radiusHost');
    var host = document.getElementById('resultsHost');

    var serviceKey = document.getElementById('fService').value || presetService || 'electrician';
    var maxDist = parseInt(document.getElementById('fDistance').value, 10);
    var minRating = parseFloat(document.getElementById('fRating').value);
    var availOnly = document.getElementById('fAvail').value === 'now';
    var verifiedOnly = document.getElementById('fVerified').checked;
    var savedOnly = document.getElementById('fSaved').checked;

    /* --- Smart Service Radius --- */
    radiusHost.innerHTML = '<div class="radius-note"><span class="spinner"></span> Searching within 3 km…</div>';
    host.innerHTML = '';

    setTimeout(function () {
      var baseResults = SN.rankWorkers(serviceKey, {
        maxDist: Math.min(3, maxDist), verifiedOnly: verifiedOnly,
        availableOnly: availOnly, minRating: minRating
      });

      var needExpand = baseResults.length < 3 && maxDist > 3;

      if (needExpand) {
        radiusHost.innerHTML = '<div class="radius-note expanded"><span class="spinner"></span> Expanding service radius to 5 km…</div>';
        setTimeout(function () { finish(true); }, 800);
      } else {
        finish(false);
      }

      function finish(expanded) {
        var effectiveDist = expanded ? Math.max(maxDist, 5) : Math.min(3, maxDist);
        var results = SN.rankWorkers(serviceKey, {
          maxDist: effectiveDist, verifiedOnly: verifiedOnly,
          availableOnly: availOnly, minRating: minRating
        });

        if (savedOnly) {
          results = results.filter(function (r) {
            return SN.state.savedWorkers.indexOf(r.worker.id) > -1;
          });
        }

        SN.state.radiusExpanded = expanded;
        SN.save();

        radiusHost.innerHTML = expanded
          ? '<div class="radius-note expanded"><span class="dot dot-amber"></span> <b>' + results.length +
            ' verified workers found within expanded radius (5 km).</b></div>'
          : '<div class="radius-note"><span class="dot dot-green"></span> <b>' + results.length +
            ' verified workers found within 3 km.</b></div>';

        if (!results.length) {
          host.innerHTML = SN.empty('No matching workers found',
            'Try increasing the distance, lowering the rating filter or turning off “Verified only”.', '⌕');
          return;
        }

        host.innerHTML =
          '<div class="row-between mb12">' +
            '<h3 class="mb0">' + results.length + ' workers matched</h3>' +
            '<span class="badge badge-blue">Ranked by Smart Match</span>' +
          '</div>' +
          '<div class="grid" style="gap:14px">' +
            results.map(function (r, i) { return workerCard(r, 'services', i === 0, expanded); }).join('') +
          '</div>';
      }
    }, 900);
  };

  ['fService','fDistance','fRating','fAvail','fVerified','fSaved'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', function () { runSearch(); });
  });
  document.getElementById('svcSearch').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var val = this.value.toLowerCase();
      var match = SN.DATA.services.filter(function (sv) {
        return sv.name.toLowerCase().indexOf(val) > -1;
      })[0];
      if (match) document.getElementById('fService').value = match.key;
      runSearch();
    }
  });

  runSearch();
};

/* ---------- Worker result card (shared) ---------- */
function workerCard(r, context, isBest, expanded) {
  var w = r.worker;
  var ts = SN.trustScore(w);

  return '<article class="worker-card"' + (isBest ? ' style="border-color:var(--green-100)"' : '') + '>' +
    (isBest ? '<div class="badge badge-green mb12">★ Best match for your request</div>' : '') +
    '<div class="wc-top">' +
      SN.avatar(w, 'avatar-lg') +
      '<div class="wc-main">' +
        '<div class="wc-name">' + SN.esc(w.name) +
          (w.verified ? ' <span class="badge badge-green">✓ ' + SN.t('verified') + '</span>'
                      : ' <span class="badge badge-amber">Verification pending</span>') +
        '</div>' +
        '<div class="wc-trade">' + SN.esc(w.trade) + ' · ' + w.experience + ' yrs experience · ' + SN.esc(w.zone) + '</div>' +
        '<div class="wc-meta">' +
          '<span><b>' + w.rating + ' ★</b> rating</span>' +
          '<span><b>' + w.jobs + '</b> jobs</span>' +
          '<span><b>' + w.distanceKm + ' km</b> away</span>' +
          '<span><b>' + SN.money(w.priceMin) + '–' + SN.money(w.priceMax) + '</b> est.</span>' +
        '</div>' +
      '</div>' +
      '<div class="match-badge"><b>' + r.score + '%</b><span>' + SN.t('smartMatch') + '</span></div>' +
    '</div>' +

    '<div class="wc-tags">' +
      '<span class="badge ' + (w.available ? 'badge-green' : 'badge-grey') + '">' +
        (w.available ? '● ' + SN.t('available') : '○ Not available') + '</span>' +
      '<span class="badge badge-blue">' + SN.t('trustScore') + ' ' + ts.total + '/100</span>' +
      (expanded ? '<span class="badge badge-amber">Found in 5 km radius</span>' : '') +
    '</div>' +

    '<details class="mt12">' +
      '<summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--blue)">' +
        SN.t('whyWorker') + '</summary>' +
      '<div class="mt12">' + SN.bars(r.parts) + '</div>' +
      '<p class="tiny muted mt12">Weighted score: skill ' + SN.WEIGHTS.skill + ', distance ' + SN.WEIGHTS.distance +
      ', rating ' + SN.WEIGHTS.rating + ', availability ' + SN.WEIGHTS.availability +
      ', response ' + SN.WEIGHTS.response + ', completion ' + SN.WEIGHTS.completion +
      ', experience ' + SN.WEIGHTS.experience + '.</p>' +
    '</details>' +

    '<div class="wc-actions">' +
      '<a class="btn btn-ghost btn-sm" href="worker-profile.html?id=' + w.id + '">' + SN.t('viewProfile') + '</a>' +
      '<button class="btn btn-primary btn-sm" data-book="' + w.id + '">' + SN.t('book') + '</button>' +
      '<button class="btn btn-ghost btn-sm" data-save="' + w.id + '">' +
        (SN.state.savedWorkers.indexOf(w.id) > -1 ? '★ Saved' : '☆ Save') + '</button>' +
    '</div>' +
  '</article>';
}

/* Delegated events for worker cards (works across pages) */
document.addEventListener('click', function (e) {
  var bookBtn = e.target.closest('[data-book]');
  if (bookBtn) {
    e.preventDefault();
    openBookingModal(bookBtn.dataset.book);
    return;
  }
  var saveBtn = e.target.closest('[data-save]');
  if (saveBtn) {
    e.preventDefault();
    var id = saveBtn.dataset.save;
    var idx = SN.state.savedWorkers.indexOf(id);
    if (idx > -1) { SN.state.savedWorkers.splice(idx, 1); SN.toast('Removed from saved workers.', 'info'); }
    else { SN.state.savedWorkers.push(id); SN.toast('Worker saved.', 'success'); }
    SN.save();
    location.reload();
    return;
  }
  var backupBtn = e.target.closest('[data-backup]');
  if (backupBtn) {
    e.preventDefault();
    chooseBackup(backupBtn.dataset.backup, backupBtn.dataset.booking);
  }
});

/* ---------- Booking modal ---------- */
function openBookingModal(workerId, presetServiceKey) {
  var w = SN.getWorker(workerId);
  if (!w) return;
  var serviceKey = presetServiceKey || w.serviceKey;
  var svc = SN.DATA.services.filter(function (x) { return x.key === serviceKey; })[0] || { name:w.trade };

  SN.modal({
    title: 'Book ' + w.name,
    sub: w.trade + ' · ' + w.distanceKm + ' km away · ' + w.rating + ' ★',
    wide: true,
    body:
      '<div class="form-row">' +
        '<div class="field"><label>Service</label><input class="input" value="' + SN.esc(svc.name) + '" readonly></div>' +
        '<div class="field"><label>Worker</label><input class="input" value="' + SN.esc(w.name) + '" readonly></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="field"><label>Date</label><input class="input" type="date" id="bkDate" value="' + new Date().toISOString().slice(0,10) + '"></div>' +
        '<div class="field"><label>Time</label><input class="input" type="time" id="bkTime" value="10:30"></div>' +
      '</div>' +
      '<div class="field"><label>Address</label><input class="input" id="bkAddr" value="C-42, Gomti Nagar, Lucknow"></div>' +
      '<div class="field"><label>Problem description</label>' +
        '<textarea class="textarea" id="bkDesc" placeholder="Describe the issue so the worker arrives prepared."></textarea></div>' +

      '<div class="card" style="background:var(--blue-50);border-color:var(--blue-100);box-shadow:none">' +
        '<div class="row-between">' +
          '<div><div class="tiny" style="font-weight:700;letter-spacing:.06em;color:var(--blue)">ESTIMATED COST</div>' +
          '<div style="font-size:21px;font-weight:800">' + SN.money(w.priceMin) + ' – ' + SN.money(w.priceMax) + '</div></div>' +
          '<span class="badge badge-amber">' + SN.t('estimated') + '</span>' +
        '</div>' +
        '<p class="tiny muted mt8 mb0">Based on service type, location, average local pricing and worker experience. Final amount is confirmed by the worker before starting.</p>' +
      '</div>',
    actions: [
      { label:'Cancel', cls:'btn-ghost' },
      { label:'Confirm Booking', cls:'btn-primary', onClick: function (close) {
          var date = document.getElementById('bkDate').value;
          var time = document.getElementById('bkTime').value;
          var addr = document.getElementById('bkAddr').value.trim();
          var desc = document.getElementById('bkDesc').value.trim();
          if (!date || !time || !addr) {
            SN.toast('Please fill date, time and address.', 'error');
            return;
          }
          var b = SN.createBooking({
            workerId: w.id, serviceKey: serviceKey, service: svc.name,
            date: SN.fmtDate(date), time: time, address: addr, description: desc
          });
          close();
          SN.toast('Booking confirmed!', 'success', b.id + ' · Request sent to ' + w.name);
          setTimeout(function () { location.href = 'booking-details.html?id=' + b.id; }, 900);
        } }
    ]
  });
}

SN.createBooking = function (data) {
  var w = SN.getWorker(data.workerId);
  var customer = SN.getCustomer(SN.state.currentUser.customer);
  var id = 'BK' + (1000 + SN.state.bookings.length + 1);

  var booking = {
    id: id,
    customerId: customer.id, customerName: customer.name, customerZone: customer.zone,
    workerId: w.id, workerName: w.name, workerTrade: w.trade,
    service: data.service, serviceKey: data.serviceKey,
    date: data.date, time: data.time, address: data.address,
    description: data.description || '',
    priceMin: w.priceMin, priceMax: w.priceMax,
    status: 'Request Sent', urgent: !!data.urgent,
    createdAt: SN.nowISO(), completedAt: null,
    payment: null, rating: null
  };

  SN.state.bookings.unshift(booking);

  SN.notify(customer.id, 'customer', 'info', 'Booking request sent.', w.name + ' has been notified.');
  SN.notify(w.id, 'worker', 'info', 'New service request received.',
    data.service + ' · ' + w.distanceKm + ' km · est. ' + SN.money(w.priceMin));

  SN.addActivity(customer.name + ' booked ' + w.name + ' for ' + data.service, 'info');
  SN.save();
  return booking;
};

/* ---------- Worker profile ---------- */
SN.PAGES['customer:worker-profile'] = function (main) {
  var id = SN.qs('id') || 'w1';
  var w = SN.getWorker(id);
  if (!w) { main.innerHTML = SN.empty('Worker not found', 'This worker is not available.', '⌕'); return; }

  var m = SN.matchScore(w, w.serviceKey, w.distanceKm);
  var ts = SN.trustScore(w);
  var saved = SN.state.savedWorkers.indexOf(w.id) > -1;

  main.innerHTML =
    '<div class="breadcrumb"><a href="dashboard.html">' + SN.t('dashboard') + '</a> / ' +
      '<a href="services.html">' + SN.t('services') + '</a> / ' + SN.esc(w.name) + '</div>' +

    '<div class="grid" style="grid-template-columns:1.5fr 1fr;gap:20px" id="profileGrid">' +

      /* LEFT */
      '<div>' +
        '<div class="card mb16">' +
          '<div class="wc-top">' +
            SN.avatar(w, 'avatar-xl') +
            '<div class="wc-main">' +
              '<div class="wc-name" style="font-size:20px">' + SN.esc(w.name) + '</div>' +
              '<div class="wc-trade">' + SN.esc(w.trade) + ' · ' + w.experience + ' years experience · ' + SN.esc(w.zone) + '</div>' +
              '<div class="wc-tags mt12">' +
                (w.verified ? '<span class="badge badge-green">✓ ' + SN.t('verified') + '</span>' : '<span class="badge badge-amber">Verification pending</span>') +
                '<span class="badge ' + (w.available ? 'badge-green' : 'badge-grey') + '">' + (w.available ? '● ' + SN.t('available') : '○ Not available') + '</span>' +
                '<span class="badge badge-amber">' + w.rating + ' ★ rating</span>' +
                '<span class="badge badge-blue">' + w.jobs + ' jobs completed</span>' +
              '</div>' +
            '</div>' +
            '<div class="match-badge"><b>' + m.score + '%</b><span>' + SN.t('smartMatch') + '</span></div>' +
          '</div>' +
          '<hr class="divider">' +
          '<div class="bc-grid" style="border-top:0;padding-top:0">' +
            '<div class="bc-field"><div class="lbl">Response time</div><div class="val">~' + w.avgResponseMin + ' min</div></div>' +
            '<div class="bc-field"><div class="lbl">Completion rate</div><div class="val">' + w.completionRate + '%</div></div>' +
            '<div class="bc-field"><div class="lbl">Response rate</div><div class="val">' + w.responseRate + '%</div></div>' +
            '<div class="bc-field"><div class="lbl">Service area</div><div class="val">' + w.distanceKm + ' km radius</div></div>' +
            '<div class="bc-field"><div class="lbl">Estimated pricing</div><div class="val">' + SN.money(w.priceMin) + '–' + SN.money(w.priceMax) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Contact</div><div class="val">' + SN.esc(w.phone) + '</div></div>' +
          '</div>' +
          '<div class="btn-row mt16">' +
            '<button class="btn btn-primary" data-book="' + w.id + '">' + SN.t('book') + '</button>' +
            '<button class="btn btn-ghost" data-save="' + w.id + '">' + (saved ? '★ Saved' : '☆ Save Worker') + '</button>' +
            '<a class="btn btn-ghost" href="services.html?service=' + w.serviceKey + '">Similar workers</a>' +
          '</div>' +
        '</div>' +

        /* Skill Verification Passport */
        '<div class="passport mb16">' +
          '<div class="passport-top">' +
            '<div><div class="pt-title">SKILL VERIFICATION PASSPORT</div>' +
            '<div class="pt-sub">Verified by ' + SN.esc(w.coop) + '</div></div>' +
            '<div class="pt-lvl">' + SN.esc(String(w.verifyLevel).toUpperCase()) + '</div>' +
          '</div>' +
          '<div class="passport-body">' +
            '<div class="pp-name">' + SN.esc(w.name) + '</div>' +
            '<div class="pp-trade">' + SN.esc(w.trade) + ' · ' + w.experience + ' years</div>' +
            '<div class="pp-section-title">Verified Skills</div>' +
            '<div class="pp-skills">' +
              w.skills.map(function (sk) { return '<span class="pp-skill">✓ ' + SN.esc(sk) + '</span>'; }).join('') +
              (w.pendingSkills || []).map(function (sk) { return '<span class="pp-skill pending">◌ ' + SN.esc(sk) + ' · pending</span>'; }).join('') +
            '</div>' +
            '<div class="pp-section-title">Training &amp; Certificates</div>' +
            (w.certificates && w.certificates.length
              ? '<div class="grid" style="gap:8px;margin-bottom:18px">' + w.certificates.map(function (c) {
                  return '<div class="row-between" style="padding:9px 12px;background:#FAFBFC;border-radius:8px;border:1px solid var(--line)">' +
                    '<div><div style="font-size:13px;font-weight:600">' + SN.esc(c.name) + '</div>' +
                    '<div class="tiny muted">' + SN.esc(c.issuer) + '</div></div>' +
                    '<span class="badge badge-green">' + c.year + '</span>' +
                  '</div>';
                }).join('') + '</div>'
              : '<p class="small muted">No certificates uploaded yet.</p>'
            ) +
            '<div class="pp-grid">' +
              '<div><div class="lbl">Verified By</div><div class="val">' + SN.esc(w.coop) + '</div></div>' +
              '<div><div class="lbl">Verification Level</div><div class="val">' + SN.esc(w.verifyLevel) + '</div></div>' +
              '<div><div class="lbl">Trust Score</div><div class="val">' + ts.total + ' / 100</div></div>' +
              '<div><div class="lbl">Completion</div><div class="val">' + w.completionRate + '%</div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Rating breakdown */
        '<div class="card">' +
          '<div class="card-head"><div class="card-title">Customer Ratings</div>' +
          '<span class="badge badge-amber">' + w.rating + ' ★ average</span></div>' +
          '<div class="rating-summary mb16">' +
            '<div><div class="rating-big">' + w.rating + '</div><div class="tiny muted">out of 5</div></div>' +
            '<div style="flex:1;min-width:200px">' +
              SN.bars(SN.DATA.ratingBreakdown.map(function (r) {
                return { label:r.label, value:r.pct, cls:'a' };
              })) +
            '</div>' +
          '</div>' +
          '<p class="tiny muted mb0">Rating measures customer satisfaction. Trust Score measures platform and cooperative reliability — they are different metrics.</p>' +
        '</div>' +
      '</div>' +

      /* RIGHT */
      '<div>' +
        SN.trustBox(w) +
        '<div class="card mt16">' +
          '<div class="card-title mb12">Why this worker?</div>' +
          SN.bars(m.parts) +
          '<p class="tiny muted mt12 mb0">Smart Match compares this worker against every other verified worker for your request.</p>' +
        '</div>' +
        '<div class="card mt16">' +
          '<div class="card-title mb12">Service Area</div>' +
          '<div class="map-box" style="height:220px">' +
            '<div class="map-ring base" style="width:130px;height:130px"></div>' +
            '<div class="map-pin customer" style="left:50%;top:50%">' +
              '<div class="pin-ic">🏠</div>You</div>' +
            '<div class="map-pin worker" style="left:26%;top:30%">' +
              '<div class="pin-ic">🔧</div>' + SN.esc(w.name.split(' ')[0]) + '</div>' +
            '<div class="map-label">Approx. ' + w.distanceKm + ' km · Smart Radius 3 km</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  if (window.innerWidth < 900) {
    document.getElementById('profileGrid').style.gridTemplateColumns = '1fr';
  }
};

/* ---------- My Bookings ---------- */
SN.PAGES['customer:bookings'] = function (main) {
  var customer = SN.getCustomer(SN.state.currentUser.customer);
  var all = SN.state.bookings.filter(function (b) { return b.customerId === customer.id; });

  var groups = {
    upcoming: all.filter(function (b) { return ['Request Sent','Accepted'].indexOf(b.status) > -1; }),
    active:   all.filter(function (b) { return ['On The Way','Arrived','In Progress'].indexOf(b.status) > -1; }),
    completed:all.filter(function (b) { return b.status === 'Completed'; }),
    cancelled:all.filter(function (b) { return b.status === 'Cancelled'; })
  };

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('bookings') + '</h2>' +
    '<p class="ph-sub">Track, pay and rate your services.</p></div>' +
    '<a class="btn btn-primary" href="services.html">+ New Booking</a></div>' +

    '<div class="tabs" id="bkTabs">' +
      '<button class="active" data-tab="upcoming">' + SN.t('upcoming') + ' (' + groups.upcoming.length + ')</button>' +
      '<button data-tab="active">' + SN.t('active') + ' (' + groups.active.length + ')</button>' +
      '<button data-tab="completed">' + SN.t('completed') + ' (' + groups.completed.length + ')</button>' +
      '<button data-tab="cancelled">' + SN.t('cancelled') + ' (' + groups.cancelled.length + ')</button>' +
    '</div>' +
    '<div id="bkList"></div>';

  function render(tab) {
    var list = groups[tab] || [];
    var host = document.getElementById('bkList');
    if (!list.length) {
      host.innerHTML = SN.empty(
        'No ' + tab + ' bookings',
        tab === 'completed' ? 'Completed services will appear here.' : 'Book a service to get started.', '▤');
      return;
    }
    host.innerHTML = '<div class="grid" style="gap:14px">' + list.map(bookingCard).join('') + '</div>';
  }

  document.getElementById('bkTabs').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-tab]');
    if (!btn) return;
    this.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    render(btn.dataset.tab);
  });

  render('upcoming');
};

function bookingCard(b) {
  return '<article class="booking-card">' +
    '<div class="bc-head">' +
      '<div><div class="bc-id">' + SN.esc(b.id) + '</div>' +
      '<div class="bc-title">' + SN.esc(b.service) + '</div>' +
      '<div class="tiny muted">' + SN.esc(b.workerName) + ' · ' + SN.esc(b.workerTrade) + '</div></div>' +
      '<div style="text-align:right">' +
        '<span class="badge ' + SN.statusBadge(b.status) + ' badge-lg">' + SN.esc(b.status) + '</span>' +
        (b.urgent ? '<div class="badge badge-red mt8">Urgent</div>' : '') +
      '</div>' +
    '</div>' +
    '<div class="bc-grid">' +
      '<div class="bc-field"><div class="lbl">Date &amp; time</div><div class="val">' + SN.esc(b.date) + ' · ' + SN.esc(b.time) + '</div></div>' +
      '<div class="bc-field"><div class="lbl">Price</div><div class="val">' + SN.money(b.priceMin) + '–' + SN.money(b.priceMax) + '</div></div>' +
      '<div class="bc-field"><div class="lbl">Address</div><div class="val">' + SN.esc(b.address) + '</div></div>' +
      '<div class="bc-field"><div class="lbl">Payment</div><div class="val">' + (b.payment ? 'Paid · ' + SN.esc(b.payment.method) : 'Pending') + '</div></div>' +
    '</div>' +
    '<div class="bc-actions">' +
      '<a class="btn btn-primary btn-sm" href="booking-details.html?id=' + b.id + '">View &amp; Track</a>' +
      (b.status === 'Completed' && !b.rating
        ? '<button class="btn btn-amber btn-sm" data-rate="' + b.id + '">Rate Service</button>' : '') +
      (b.status === 'Completed' && !b.payment
        ? '<button class="btn btn-green btn-sm" data-pay="' + b.id + '">Pay Now</button>' : '') +
    '</div>' +
  '</article>';
}

/* ---------- Booking details ---------- */
SN.PAGES['customer:booking-details'] = function (main) {
  var id = SN.qs('id');
  var b = SN.getBooking(id);
  if (!b) { main.innerHTML = SN.empty('Booking not found', 'Check the booking link and try again.', '▤'); return; }

  var w = SN.getWorker(b.workerId);
  var idx = SN.stepIndex(b.status);
  var cancelled = b.status === 'Cancelled';

  main.innerHTML =
    '<div class="breadcrumb"><a href="dashboard.html">' + SN.t('dashboard') + '</a> / ' +
    '<a href="bookings.html">' + SN.t('bookings') + '</a> / ' + SN.esc(b.id) + '</div>' +

    '<div class="page-head">' +
      '<div><h2>' + SN.esc(b.service) + '</h2>' +
      '<p class="ph-sub">' + SN.esc(b.id) + ' · booked on ' + SN.fmtDate(b.createdAt) + '</p></div>' +
      '<span class="badge ' + SN.statusBadge(b.status) + ' badge-lg">' + SN.esc(b.status) + '</span>' +
    '</div>' +

    '<div class="grid" style="grid-template-columns:1.4fr 1fr;gap:20px" id="bdGrid">' +

      '<div>' +
        /* Timeline */
        '<div class="card mb16">' +
          '<div class="card-head"><div class="card-title">Booking Tracking</div>' +
          (b.urgent ? '<span class="badge badge-red">Priority</span>' : '') + '</div>' +
          SN.timeline(b) +
          (b.status === 'Completed'
            ? '<hr class="divider"><div class="row" style="gap:10px"><span class="dot dot-green"></span>' +
              '<span class="small">Service completed on ' + SN.fmtDT(b.completedAt) + '</span></div>' : '') +
        '</div>' +

        /* Location */
        '<div class="card mb16">' +
          '<div class="card-head"><div class="card-title">Live Location</div>' +
          '<span class="badge badge-blue">Smart Radius 3 km</span></div>' +
          '<div class="map-box">' +
            '<div class="map-ring ' + (SN.state.radiusExpanded ? 'expanded' : 'base') + '"></div>' +
            '<div class="map-pin customer" style="left:50%;top:72%"><div class="pin-ic">🏠</div>You</div>' +
            '<div class="map-pin worker" style="left:' + (idx >= 2 ? '48%' : '24%') + ';top:' + (idx >= 2 ? '48%' : '26%') + '">' +
              '<div class="pin-ic">🔧</div>' + SN.esc(b.workerName.split(' ')[0]) + '</div>' +
            '<div class="map-line" style="height:' + (idx >= 2 ? 60 : 150) + 'px;transform:rotate(' + (idx >= 2 ? '8deg' : '22deg') + ')"></div>' +
            '<div class="map-label">Approx. ' + (w ? w.distanceKm : '2.1') + ' km away · ETA ~' + (w ? w.avgResponseMin : 12) + ' min</div>' +
          '</div>' +
        '</div>' +

        /* Backup worker block */
        '<div class="card mb16" id="backupHost">' +
          '<div class="card-head"><div class="card-title">Backup Worker</div>' +
          '<span class="badge badge-amber">Cover available</span></div>' +
          '<p class="small muted">If ' + SN.esc(b.workerName) + ' does not respond within the response window, verified alternatives nearby are suggested instantly.</p>' +
          '<div class="btn-row">' +
            '<button class="btn btn-ghost btn-sm" id="noRespondBtn">Report non-response</button>' +
          '</div>' +
          '<div id="backupList" class="mt16"></div>' +
        '</div>' +

        /* Payment */
        (b.status === 'Completed'
          ? '<div class="card mb16">' +
              '<div class="card-head"><div class="card-title">Payment</div>' +
              (b.payment ? '<span class="badge badge-green">Paid</span>' : '<span class="badge badge-amber">Pending</span>') + '</div>' +
              (b.payment
                ? '<div class="bc-grid" style="border-top:0;padding-top:0">' +
                    '<div class="bc-field"><div class="lbl">Method</div><div class="val">' + SN.esc(b.payment.method) + '</div></div>' +
                    '<div class="bc-field"><div class="lbl">Amount</div><div class="val">' + SN.money(b.payment.amount) + '</div></div>' +
                    '<div class="bc-field"><div class="lbl">Transaction ID</div><div class="val">' + SN.esc(b.payment.txnId) + '</div></div>' +
                    '<div class="bc-field"><div class="lbl">Paid on</div><div class="val">' + SN.fmtDT(b.payment.at) + '</div></div>' +
                  '</div>'
                : '<p class="small muted">Choose a payment method to settle this service.</p>' +
                  '<button class="btn btn-green" data-pay="' + b.id + '">Pay Now</button>') +
            '</div>'
          : '') +

        /* Rating */
        (b.status === 'Completed'
          ? '<div class="card">' +
              '<div class="card-head"><div class="card-title">Rating &amp; Review</div>' +
              (b.rating ? '<span class="badge badge-green">Submitted</span>' : '<span class="badge badge-amber">Awaiting</span>') + '</div>' +
              (b.rating
                ? '<div class="row" style="gap:14px"><div class="rating-big">' + b.rating.stars + '</div>' +
                  '<div><div style="color:var(--amber);font-size:20px">' + '★'.repeat(b.rating.stars) + '☆'.repeat(5 - b.rating.stars) + '</div>' +
                  '<div class="tiny muted">Quality ' + b.rating.quality + ' · Professionalism ' + b.rating.professionalism + ' · Timeliness ' + b.rating.timeliness + '</div></div></div>'
                : '<p class="small muted">How was your service?</p>' +
                  '<button class="btn btn-amber" data-rate="' + b.id + '">Rate this Service</button>') +
            '</div>'
          : '') +
      '</div>' +

      /* RIGHT: summary */
      '<div>' +
        '<div class="card mb16">' +
          '<div class="card-title mb12">Booking Summary</div>' +
          '<div class="bc-grid" style="border-top:0;padding-top:0">' +
            '<div class="bc-field"><div class="lbl">Booking ID</div><div class="val">' + SN.esc(b.id) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Service</div><div class="val">' + SN.esc(b.service) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Worker</div><div class="val">' + SN.esc(b.workerName) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Scheduled</div><div class="val">' + SN.esc(b.date) + ' · ' + SN.esc(b.time) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Estimated</div><div class="val">' + SN.money(b.priceMin) + '–' + SN.money(b.priceMax) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Address</div><div class="val">' + SN.esc(b.address) + '</div></div>' +
          '</div>' +
          (b.description ? '<hr class="divider"><div class="lbl tiny muted">PROBLEM DESCRIPTION</div><p class="small mb0">' + SN.esc(b.description) + '</p>' : '') +
        '</div>' +

        (w ? '<div class="card mb16">' +
          '<div class="wc-top">' + SN.avatar(w) +
          '<div class="wc-main"><div class="wc-name">' + SN.esc(w.name) + '</div>' +
          '<div class="wc-trade">' + SN.esc(w.trade) + ' · ' + w.rating + ' ★ · ' + w.jobs + ' jobs</div></div></div>' +
          '<div class="btn-row mt12"><a class="btn btn-ghost btn-sm" href="worker-profile.html?id=' + w.id + '">View Profile</a></div>' +
        '</div>' : '') +

        '<div class="card">' +
          '<div class="card-title mb12">Need help?</div>' +
          '<p class="small muted">Raise a complaint if the service quality, pricing or punctuality was not as expected.</p>' +
          '<button class="btn btn-ghost btn-sm" id="complaintBtn">Raise a Complaint</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  if (window.innerWidth < 900) {
    document.getElementById('bdGrid').style.gridTemplateColumns = '1fr';
  }

  /* Backup worker */
  document.getElementById('noRespondBtn').addEventListener('click', function () {
    var alts = SN.rankWorkers(b.serviceKey, { maxDist:5, verifiedOnly:true })
      .filter(function (r) { return r.worker.id !== b.workerId; })
      .slice(0, 3);

    var host = document.getElementById('backupList');
    host.innerHTML =
      '<div class="radius-note expanded mb12"><span class="dot dot-amber"></span> ' +
      SN.esc(b.workerName) + ' hasn\'t responded. We found alternative verified workers nearby.</div>' +
      (alts.length ? alts.map(function (r) {
        return '<div class="backup-item mb8">' +
          SN.avatar(r.worker) +
          '<div class="bi-main">' +
            '<div style="font-weight:700;font-size:13.5px">' + SN.esc(r.worker.name) + '</div>' +
            '<div class="tiny muted">' + r.worker.rating + ' ★ · ' + r.worker.distanceKm + ' km · ' +
              (r.worker.available ? 'Available now' : 'Busy') + '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<div class="match-badge" style="min-width:64px"><b>' + r.score + '%</b><span>Match</span></div>' +
            '<button class="btn btn-primary btn-sm mt8" data-backup="' + r.worker.id + '" data-booking="' + b.id + '">Choose</button>' +
          '</div>' +
        '</div>';
      }).join('') : '<p class="small muted">No alternatives available right now.</p>');

    SN.notify(b.customerId, 'customer', 'warn', 'Worker has not responded.',
      'Alternative verified workers are ready to be assigned.');
    SN.toast('Backup worker suggestions loaded.', 'warn');
  });

  document.getElementById('complaintBtn').addEventListener('click', function () {
    SN.modal({
      title: 'Raise a Complaint',
      sub: 'Booking ' + b.id,
      body:
        '<div class="field"><label>Category</label><select class="select" id="cmpCat">' +
          '<option>Poor quality</option><option>Worker didn\'t arrive</option>' +
          '<option>Incorrect pricing</option><option>Other</option></select></div>' +
        '<div class="field"><label>Describe the issue</label>' +
        '<textarea class="textarea" id="cmpDetail" placeholder="Tell us what went wrong."></textarea></div>',
      actions: [
        { label:'Cancel', cls:'btn-ghost' },
        { label:'Submit Complaint', cls:'btn-primary', onClick: function (close) {
            SN.state.complaints.unshift({
              id: SN.uid('CP'), customerName: b.customerName, workerName: b.workerName,
              category: document.getElementById('cmpCat').value,
              bookingId: b.id,
              detail: document.getElementById('cmpDetail').value || 'No detail provided.',
              status: 'Open', date: new Date().toISOString().slice(0,10), zone: b.customerZone
            });
            SN.addActivity('Complaint filed for ' + b.id, 'error');
            SN.save();
            close();
            SN.toast('Complaint submitted.', 'success', 'The cooperative will review it shortly.');
          } }
      ]
    });
  });
};

/* ---------- Choose backup worker ---------- */
function chooseBackup(workerId, bookingId) {
  var b = SN.getBooking(bookingId);
  var w = SN.getWorker(workerId);
  if (!b || !w) return;

  SN.modal({
    title: 'Reassign to ' + w.name + '?',
    sub: w.trade + ' · ' + w.distanceKm + ' km · ' + w.rating + ' ★',
    body: '<p class="small">The original worker will be released from this booking and ' +
      SN.esc(w.name) + ' will receive the request immediately.</p>' +
      '<div class="radius-note"><span class="dot dot-green"></span> Backup assignment keeps your service on schedule.</div>',
    actions: [
      { label:'Cancel', cls:'btn-ghost' },
      { label:'Confirm Reassignment', cls:'btn-primary', onClick: function (close) {
          b.workerId = w.id;
          b.workerName = w.name;
          b.workerTrade = w.trade;
          b.status = 'Request Sent';
          SN.notify(b.customerId, 'customer', 'success', 'Backup worker assigned.',
            w.name + ' will handle ' + b.service + '.');
          SN.addActivity('Backup worker ' + w.name + ' assigned to ' + b.id, 'success');
          SN.save();
          close();
          SN.toast('Booking reassigned to ' + w.name + '.', 'success');
          setTimeout(function () { location.reload(); }, 900);
        } }
    ]
  });
}

/* ---------- Payment + Rating modals (shared, used by bookings too) ---------- */
document.addEventListener('click', function (e) {
  var payBtn = e.target.closest('[data-pay]');
  if (payBtn) {
    e.preventDefault();
    openPaymentModal(payBtn.dataset.pay);
    return;
  }
  var rateBtn = e.target.closest('[data-rate]');
  if (rateBtn) {
    e.preventDefault();
    openRatingModal(rateBtn.dataset.rate);
  }
});

function openPaymentModal(bookingId) {
  var b = SN.getBooking(bookingId);
  if (!b) return;
  var amount = Math.round((b.priceMin + b.priceMax) / 2);
  var chosen = 'UPI';

  SN.modal({
    title: 'Complete Payment',
    sub: b.id + ' · ' + b.service,
    body:
      '<div style="text-align:center;margin-bottom:18px">' +
        '<div class="tiny muted">AMOUNT PAYABLE</div>' +
        '<div style="font-size:30px;font-weight:800">' + SN.money(amount) + '</div>' +
        '<div class="tiny muted">Final amount confirmed by the worker</div>' +
      '</div>' +
      '<div class="grid" style="gap:9px" id="payOpts">' +
        '<button class="pay-opt selected" data-m="UPI"><span class="po-ic">📱</span>' +
          '<span><span class="po-name">UPI</span><br><span class="po-sub">GPay / PhonePe / Paytm</span></span></button>' +
        '<button class="pay-opt" data-m="Cash"><span class="po-ic">💵</span>' +
          '<span><span class="po-name">Cash</span><br><span class="po-sub">Pay the worker directly</span></span></button>' +
        '<button class="pay-opt" data-m="Cooperative Wallet"><span class="po-ic">🏦</span>' +
          '<span><span class="po-name">Cooperative Wallet</span><br><span class="po-sub">Settled through the cooperative</span></span></button>' +
      '</div>',
    actions: [
      { label:'Cancel', cls:'btn-ghost' },
      { label:'Pay ' + SN.money(amount), cls:'btn-green', onClick: function (close) {
          b.payment = {
            method: chosen,
            txnId: 'TXN' + Math.floor(1000000 + Math.random() * 8999999),
            amount: amount,
            at: SN.nowISO()
          };
          SN.notify(b.customerId, 'customer', 'success', 'Payment successful.',
            SN.money(amount) + ' paid via ' + chosen + '. Txn ' + b.payment.txnId);
          SN.addActivity('Payment of ' + SN.money(amount) + ' received for ' + b.id, 'success');
          SN.save();
          close();
          SN.modal({
            title: 'Payment Successful',
            body: '<div style="text-align:center">' +
              '<div class="success-mark">✓</div>' +
              '<h3>Payment Successful</h3>' +
              '<p class="small muted">' + SN.money(amount) + ' paid via ' + SN.esc(chosen) + '</p>' +
              '<div class="badge badge-green badge-lg">Txn ID: ' + SN.esc(b.payment.txnId) + '</div></div>',
            actions: [{ label:'Done', cls:'btn-primary', onClick: function (c) { c(); location.reload(); } }]
          });
        } }
    ],
    onOpen: function (root) {
      root.querySelectorAll('.pay-opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          root.querySelectorAll('.pay-opt').forEach(function (x) { x.classList.remove('selected'); });
          btn.classList.add('selected');
          chosen = btn.dataset.m;
        });
      });
    }
  });
}

function openRatingModal(bookingId) {
  var b = SN.getBooking(bookingId);
  if (!b) return;
  var stars = 5;

  SN.modal({
    title: 'How was your service?',
    sub: b.workerName + ' · ' + b.service,
    body:
      '<div style="text-align:center;margin-bottom:18px">' +
        '<div class="stars" id="starHost">' +
          [1,2,3,4,5].map(function (i) {
            return '<button data-s="' + i + '" class="' + (i <= stars ? 'on' : '') + '" aria-label="' + i + ' star">★</button>';
          }).join('') +
        '</div>' +
        '<div class="tiny muted mt8" id="starLabel">Excellent</div>' +
      '</div>' +
      '<div class="field"><label>Service Quality</label><select class="select" id="rQ">' +
        '<option value="5">5 — Excellent</option><option value="4">4 — Good</option>' +
        '<option value="3">3 — Average</option><option value="2">2 — Poor</option><option value="1">1 — Very poor</option></select></div>' +
      '<div class="field"><label>Professionalism</label><select class="select" id="rP">' +
        '<option value="5">5 — Excellent</option><option value="4">4 — Good</option>' +
        '<option value="3">3 — Average</option><option value="2">2 — Poor</option><option value="1">1 — Very poor</option></select></div>' +
      '<div class="field"><label>Timeliness</label><select class="select" id="rT">' +
        '<option value="5">5 — On time</option><option value="4">4 — Slightly late</option>' +
        '<option value="3">3 — Late</option><option value="2">2 — Very late</option><option value="1">1 — Did not arrive on time</option></select></div>' +
      '<div class="field mb0"><label>Comment (optional)</label>' +
        '<textarea class="textarea" id="rC" placeholder="Anything else you\'d like to share?"></textarea></div>',
    actions: [
      { label:'Cancel', cls:'btn-ghost' },
      { label:'Submit Review', cls:'btn-primary', onClick: function (close) {
          var w = SN.getWorker(b.workerId);
          b.rating = {
            stars: stars,
            quality: +document.getElementById('rQ').value,
            professionalism: +document.getElementById('rP').value,
            timeliness: +document.getElementById('rT').value,
            comment: document.getElementById('rC').value,
            at: SN.nowISO()
          };
          if (w) {
            var totalJobs = w.jobs + 1;
            w.rating = Math.round(((w.rating * w.jobs + stars) / totalJobs) * 10) / 10;
            w.jobs = totalJobs;
          }
          SN.notify(b.customerId, 'customer', 'success', 'Review submitted.', 'Thank you for rating ' + b.workerName + '.');
          SN.addActivity(b.customerName + ' rated ' + b.workerName + ' ' + stars + '★', 'success');
          SN.save();
          close();
          SN.toast('Review submitted. Thank you!', 'success');
          setTimeout(function () { location.reload(); }, 900);
        } }
    ],
    onOpen: function (root) {
      var host = root.querySelector('#starHost');
      var label = root.querySelector('#starLabel');
      var labels = { 1:'Very poor', 2:'Poor', 3:'Average', 4:'Good', 5:'Excellent' };
      host.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-s]');
        if (!btn) return;
        stars = +btn.dataset.s;
        host.querySelectorAll('button').forEach(function (x) {
          x.classList.toggle('on', +x.dataset.s <= stars);
        });
        label.textContent = labels[stars];
      });
    }
  });
}

/* ---------- Notifications ---------- */
SN.PAGES['customer:notifications'] = function (main) {
  var list = SN.state.notifications.filter(function (n) { return n.role === 'customer'; });

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('notifications') + '</h2>' +
    '<p class="ph-sub">Updates about your bookings, payments and recommendations.</p></div>' +
    '<button class="btn btn-ghost" id="markAll">Mark all as read</button></div>' +
    '<div id="notifHost"></div>';

  function render() {
    var host = document.getElementById('notifHost');
    if (!list.length) { host.innerHTML = SN.empty('No notifications', 'You are all caught up.', '◔'); return; }
    host.innerHTML = '<div class="grid" style="gap:11px">' + list.map(function (n) {
      var cls = n.type === 'success' ? 'g' : n.type === 'warn' ? 'a' : n.type === 'error' ? 'r' : '';
      var ic  = n.type === 'success' ? '✓' : n.type === 'warn' ? '⚠' : n.type === 'error' ? '✕' : 'ℹ';
      return '<div class="notif' + (n.read ? '' : ' unread') + '">' +
        '<div class="notif-ic ' + cls + '">' + ic + '</div>' +
        '<div class="notif-body"><div class="notif-title">' + SN.esc(n.title) + '</div>' +
        (n.body ? '<div class="tiny muted">' + SN.esc(n.body) + '</div>' : '') +
        '<div class="notif-time">' + SN.ago(n.time) + '</div></div>' +
      '</div>';
    }).join('') + '</div>';
  }
  render();

  document.getElementById('markAll').addEventListener('click', function () {
    list.forEach(function (n) { n.read = true; });
    SN.save();
    render();
    SN.toast('All notifications marked as read.', 'success');
  });
};

/* ---------- Customer profile ---------- */
SN.PAGES['customer:profile'] = function (main) {
  var c = SN.getCustomer(SN.state.currentUser.customer);
  var mine = SN.state.bookings.filter(function (b) { return b.customerId === c.id; });
  var saved = SN.state.workers.filter(function (w) { return SN.state.savedWorkers.indexOf(w.id) > -1; });

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('profile') + '</h2>' +
    '<p class="ph-sub">Your account and saved workers.</p></div></div>' +

    '<div class="grid" style="grid-template-columns:1fr 1.6fr;gap:20px" id="profGrid">' +
      '<div class="card">' +
        '<div style="text-align:center">' +
          '<div class="avatar avatar-xl" style="margin:0 auto 12px">' + SN.esc(SN.initials(c.name)) + '</div>' +
          '<h3 class="mb0">' + SN.esc(c.name) + '</h3>' +
          '<p class="small muted">' + SN.esc(c.phone) + '</p>' +
          '<span class="badge badge-green">Active Customer</span>' +
        '</div>' +
        '<hr class="divider">' +
        '<div class="bc-grid" style="border-top:0;padding-top:0">' +
          '<div class="bc-field"><div class="lbl">Zone</div><div class="val">' + SN.esc(c.zone) + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Member since</div><div class="val">' + SN.esc(c.since) + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Total bookings</div><div class="val">' + mine.length + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Complaints</div><div class="val">' + c.complaints + '</div></div>' +
        '</div>' +
      '</div>' +

      '<div>' +
        '<div class="card mb16">' +
          '<div class="card-head"><div class="card-title">Saved Workers</div>' +
          '<span class="badge badge-blue">' + saved.length + ' saved</span></div>' +
          (saved.length
            ? '<div class="grid" style="gap:10px">' + saved.map(function (w) {
                return '<div class="backup-item">' + SN.avatar(w) +
                  '<div class="bi-main"><div style="font-weight:700;font-size:13.5px">' + SN.esc(w.name) + '</div>' +
                  '<div class="tiny muted">' + SN.esc(w.trade) + ' · ' + w.rating + ' ★ · ' + w.distanceKm + ' km</div></div>' +
                  '<a class="btn btn-ghost btn-sm" href="worker-profile.html?id=' + w.id + '">View</a></div>';
              }).join('') + '</div>'
            : SN.empty('No saved workers yet', 'Tap ☆ Save on any worker card.', '★')) +
        '</div>' +

        '<div class="card">' +
          '<div class="card-title mb12">Preferences</div>' +
          '<div class="row-between" style="padding:11px 0;border-bottom:1px solid var(--line)">' +
            '<div><div style="font-weight:600;font-size:13.5px">Language</div>' +
            '<div class="tiny muted">Switch between English and हिंदी</div></div>' +
            '<button class="btn btn-ghost btn-sm" id="langToggle2">' +
              (SN.state.lang === 'en' ? 'Switch to हिंदी' : 'Switch to English') + '</button>' +
          '</div>' +
          '<div class="row-between" style="padding:11px 0">' +
            '<div><div style="font-weight:600;font-size:13.5px">High contrast mode</div>' +
            '<div class="tiny muted">Improves readability for low-vision users</div></div>' +
            '<button class="btn btn-ghost btn-sm" id="hcToggle">Toggle</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  if (window.innerWidth < 900) {
    document.getElementById('profGrid').style.gridTemplateColumns = '1fr';
  }

  document.getElementById('langToggle2').addEventListener('click', function () {
    SN.setLang(SN.state.lang === 'en' ? 'hi' : 'en');
  });
  document.getElementById('hcToggle').addEventListener('click', function () {
    document.body.classList.toggle('hc');
    SN.toast('High contrast ' + (document.body.classList.contains('hc') ? 'enabled' : 'disabled') + '.', 'info');
  });
};