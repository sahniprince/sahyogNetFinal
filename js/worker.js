/* ============================================================
   SahyogNET — worker.js
   Worker-facing page renderers.
   ============================================================ */

function currentWorker() {
  return SN.getWorker(SN.state.currentUser.worker);
}
function workerBookings() {
  var w = currentWorker();
  return SN.state.bookings.filter(function (b) { return b.workerId === w.id; });
}

/* ---------- Dashboard ---------- */
SN.PAGES['worker:dashboard'] = function (main) {
  var w = currentWorker();
  var mine = workerBookings();
  var ts = SN.trustScore(w);

  var pending = mine.filter(function (b) { return b.status === 'Request Sent'; });
  var activeJob = mine.filter(function (b) {
    return ['Accepted','On The Way','Arrived','In Progress'].indexOf(b.status) > -1;
  })[0];
  var completed = mine.filter(function (b) { return b.status === 'Completed'; });
  var todayEarnings = completed
    .filter(function (b) { return b.payment; })
    .reduce(function (a, b) { return a + b.payment.amount; }, 0);
  var monthEarnings = SN.DATA.monthlyEarnings[SN.DATA.monthlyEarnings.length - 1].value;

  main.innerHTML =
    '<div class="page-head">' +
      '<div><h2>Namaste, ' + SN.esc(w.name.split(' ')[0]) + ' 🔧</h2>' +
      '<p class="ph-sub">' + SN.esc(w.trade) + ' · ' + SN.esc(w.zone) + ' · Trust Score ' + ts.total + '/100</p></div>' +
      '<div class="row" style="gap:10px">' +
        '<label class="row small" style="gap:8px;background:#fff;border:1px solid var(--line-2);padding:8px 13px;border-radius:8px">' +
          '<input type="checkbox" id="availToggle" ' + (w.available ? 'checked' : '') + '> ' +
          '<span style="font-weight:600">' + (w.available ? 'Available for Work' : 'Not Available') + '</span>' +
        '</label>' +
      '</div>' +
    '</div>' +

    '<div class="kpi-grid">' +
      SN.kpi('Pending Requests', pending.length, pending.length ? 'Action needed' : 'All clear', pending.length ? 'kpi-up' : '') +
      SN.kpi("Today's Jobs", mine.filter(function (b) { return b.date === new Date().toISOString().slice(0,10).split('-').reverse().join(' '); }).length || completed.length, 'Scheduled') +
      SN.kpi("Today's Earnings", SN.money(todayEarnings), 'Settled jobs') +
      SN.kpi('Monthly Earnings', SN.money(monthEarnings), 'March 2026') +
      SN.kpi('Rating', w.rating + ' ★', w.jobs + ' jobs lifetime') +
      SN.kpi('Trust Score', ts.total + '/100', w.verifyLevel + ' verification') +
    '</div>' +

    /* Active job */
    (activeJob
      ? '<div class="card mb16" style="border-left:3px solid var(--amber)">' +
          '<div class="card-head"><div><div class="card-title">Active Job</div>' +
          '<p class="card-sub">' + SN.esc(activeJob.id) + ' · ' + SN.esc(activeJob.service) + '</p></div>' +
          '<span class="badge ' + SN.statusBadge(activeJob.status) + '">' + SN.esc(activeJob.status) + '</span></div>' +
          '<div class="bc-grid mb16">' +
            '<div class="bc-field"><div class="lbl">Customer</div><div class="val">' + SN.esc(activeJob.customerName) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Distance</div><div class="val">' + w.distanceKm + ' km</div></div>' +
            '<div class="bc-field"><div class="lbl">Schedule</div><div class="val">' + SN.esc(activeJob.date) + ' · ' + SN.esc(activeJob.time) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Estimated</div><div class="val">' + SN.money(activeJob.priceMin) + '–' + SN.money(activeJob.priceMax) + '</div></div>' +
          '</div>' +
          '<a class="btn btn-primary btn-sm" href="job-details.html?id=' + activeJob.id + '">Open Job &amp; Update Status</a>' +
        '</div>'
      : '<div class="card mb16">' + SN.empty('No active job', 'Accept a request to start working.', '✓') + '</div>'
    ) +

    /* Pending requests preview */
    '<div class="row-between mb12"><h3 class="mb0">New Service Requests</h3>' +
    '<a class="small" href="requests.html">View all →</a></div>' +
    (pending.length
      ? '<div class="grid grid-2 mb24">' + pending.slice(0, 2).map(requestCard).join('') + '</div>'
      : '<div class="card mb24">' + SN.empty('No pending requests', 'New requests will appear here automatically.', '◈') + '</div>'
    ) +

    /* Earnings chart */
    '<div class="card">' +
      '<div class="card-head"><div class="card-title">Monthly Earnings Trend</div>' +
      '<span class="badge badge-green">' + SN.money(monthEarnings) + ' this month</span></div>' +
      SN.barChart(SN.DATA.monthlyEarnings, { key:'value', prefix:'₹', alt:true }) +
    '</div>';

  /* Availability toggle — affects customer-side matching data */
  document.getElementById('availToggle').addEventListener('change', function () {
    w.available = this.checked;
    SN.save();
    SN.toast(
      w.available ? 'You are now available for work.' : 'You are marked as not available.',
      w.available ? 'success' : 'info',
      'Customer-side matching will reflect this immediately.'
    );
    setTimeout(function () { SN.render('worker', 'dashboard'); }, 700);
  });
};

/* ---------- Request card ---------- */
function requestCard(b) {
  var w = currentWorker();
  return '<article class="booking-card">' +
    '<div class="bc-head">' +
      '<div><span class="badge badge-blue">NEW SERVICE REQUEST</span>' +
      '<div class="bc-title mt8">' + SN.esc(b.service) + '</div>' +
      '<div class="tiny muted">' + SN.esc(b.id) + '</div></div>' +
      (b.urgent ? '<span class="badge badge-red badge-lg">⚡ Urgent</span>' : '<span class="badge badge-amber badge-lg">' + SN.esc(b.status) + '</span>') +
    '</div>' +
    '<div class="bc-grid">' +
      '<div class="bc-field"><div class="lbl">Customer</div><div class="val">' + SN.esc(b.customerName) + '</div></div>' +
      '<div class="bc-field"><div class="lbl">Distance</div><div class="val">' + w.distanceKm + ' km</div></div>' +
      '<div class="bc-field"><div class="lbl">Requested</div><div class="val">' + SN.esc(b.time) + '</div></div>' +
      '<div class="bc-field"><div class="lbl">Estimated</div><div class="val">' + SN.money(b.priceMin) + '–' + SN.money(b.priceMax) + '</div></div>' +
    '</div>' +
    (b.description ? '<p class="small muted mb0">' + SN.esc(b.description) + '</p>' : '') +
    '<div class="bc-actions">' +
      '<button class="btn btn-primary btn-sm" data-accept="' + b.id + '">Accept</button>' +
      '<button class="btn btn-danger btn-sm" data-reject="' + b.id + '">Reject</button>' +
      '<a class="btn btn-ghost btn-sm" href="job-details.html?id=' + b.id + '">Details</a>' +
    '</div>' +
  '</article>';
}

/* ---------- Job Requests page ---------- */
SN.PAGES['worker:requests'] = function (main) {
  var mine = workerBookings();
  var pending = mine.filter(function (b) { return b.status === 'Request Sent'; });
  var handled = mine.filter(function (b) { return b.status !== 'Request Sent'; });

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('requests') + '</h2>' +
    '<p class="ph-sub">Accept to start a job. Rejecting triggers the backup worker flow for the customer.</p></div>' +
    '<span class="badge badge-blue badge-lg">' + pending.length + ' pending</span></div>' +

    '<h3 class="mb12">Pending (' + pending.length + ')</h3>' +
    (pending.length
      ? '<div class="grid" style="gap:14px">' + pending.map(requestCard).join('') + '</div>'
      : SN.empty('No pending requests', 'You are up to date. New requests arrive here.', '◈')) +

    '<h3 class="mt24 mb12">Recently Handled</h3>' +
    (handled.length
      ? '<div class="table-wrap"><table class="tbl"><thead><tr>' +
        '<th>Booking</th><th>Service</th><th>Customer</th><th>Date</th><th>Status</th><th></th>' +
        '</tr></thead><tbody>' +
        handled.map(function (b) {
          return '<tr><td class="tbl-name">' + SN.esc(b.id) + '</td>' +
            '<td>' + SN.esc(b.service) + '</td>' +
            '<td>' + SN.esc(b.customerName) + '</td>' +
            '<td>' + SN.esc(b.date) + '</td>' +
            '<td><span class="badge ' + SN.statusBadge(b.status) + '">' + SN.esc(b.status) + '</span></td>' +
            '<td><a class="btn btn-ghost btn-sm" href="job-details.html?id=' + b.id + '">Open</a></td></tr>';
        }).join('') +
        '</tbody></table></div>'
      : SN.empty('Nothing handled yet', 'Accepted and rejected requests appear here.', '▤'));
};

/* ---------- My Jobs ---------- */
SN.PAGES['worker:jobs'] = function (main) {
  var mine = workerBookings();
  var groups = {
    active:    mine.filter(function (b) { return ['Accepted','On The Way','Arrived','In Progress'].indexOf(b.status) > -1; }),
    completed: mine.filter(function (b) { return b.status === 'Completed'; }),
    all:       mine
  };

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('jobs') + '</h2>' +
    '<p class="ph-sub">Every job assigned to you on SahyogNET.</p></div></div>' +
    '<div class="tabs" id="jobTabs">' +
      '<button class="active" data-tab="active">Active (' + groups.active.length + ')</button>' +
      '<button data-tab="completed">Completed (' + groups.completed.length + ')</button>' +
      '<button data-tab="all">All (' + groups.all.length + ')</button>' +
    '</div><div id="jobList"></div>';

  function render(tab) {
    var list = groups[tab];
    var host = document.getElementById('jobList');
    if (!list.length) { host.innerHTML = SN.empty('No jobs here', 'Jobs will appear as you accept requests.', '▤'); return; }
    host.innerHTML = '<div class="grid" style="gap:14px">' + list.map(function (b) {
      return '<article class="booking-card">' +
        '<div class="bc-head"><div><div class="bc-id">' + SN.esc(b.id) + '</div>' +
        '<div class="bc-title">' + SN.esc(b.service) + '</div>' +
        '<div class="tiny muted">' + SN.esc(b.customerName) + ' · ' + SN.esc(b.address) + '</div></div>' +
        '<span class="badge ' + SN.statusBadge(b.status) + ' badge-lg">' + SN.esc(b.status) + '</span></div>' +
        '<div class="bc-grid">' +
          '<div class="bc-field"><div class="lbl">Date</div><div class="val">' + SN.esc(b.date) + ' · ' + SN.esc(b.time) + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Value</div><div class="val">' + SN.money(b.priceMin) + '–' + SN.money(b.priceMax) + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Payment</div><div class="val">' + (b.payment ? 'Received' : 'Pending') + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Rating</div><div class="val">' + (b.rating ? b.rating.stars + ' ★' : '—') + '</div></div>' +
        '</div>' +
        '<div class="bc-actions"><a class="btn btn-primary btn-sm" href="job-details.html?id=' + b.id + '">Open Job</a></div>' +
      '</article>';
    }).join('') + '</div>';
  }

  document.getElementById('jobTabs').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-tab]');
    if (!btn) return;
    this.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    render(btn.dataset.tab);
  });
  render('active');
};

/* ---------- Job details (worker action flow) ---------- */
SN.PAGES['worker:job-details'] = function (main) {
  var id = SN.qs('id');
  var b = SN.getBooking(id);
  if (!b) { main.innerHTML = SN.empty('Job not found', 'Check the job id in the URL.', '▤'); return; }

  var w = currentWorker();

  /* Next action available for the current status */
  function nextAction() {
    switch (b.status) {
      case 'Request Sent': return { label:'Accept Request',    next:'Accepted',    cls:'btn-primary' };
      case 'Accepted':     return { label:'Start Journey',     next:'On The Way',  cls:'btn-primary' };
      case 'On The Way':   return { label:'Mark Arrived',      next:'Arrived',     cls:'btn-amber'   };
      case 'Arrived':      return { label:'Start Service',     next:'In Progress', cls:'btn-primary' };
      case 'In Progress':  return { label:'Complete Service',  next:'Completed',   cls:'btn-green'   };
      default: return null;
    }
  }
  var act = nextAction();

  main.innerHTML =
    '<div class="breadcrumb"><a href="dashboard.html">' + SN.t('dashboard') + '</a> / ' +
    '<a href="jobs.html">' + SN.t('jobs') + '</a> / ' + SN.esc(b.id) + '</div>' +

    '<div class="page-head"><div><h2>' + SN.esc(b.service) + '</h2>' +
    '<p class="ph-sub">' + SN.esc(b.id) + ' · ' + SN.esc(b.customerName) + '</p></div>' +
    '<span class="badge ' + SN.statusBadge(b.status) + ' badge-lg">' + SN.esc(b.status) + '</span></div>' +

    '<div class="grid" style="grid-template-columns:1.4fr 1fr;gap:20px" id="jdGrid">' +

      '<div>' +
        '<div class="card mb16">' +
          '<div class="card-head"><div class="card-title">Job Timeline</div></div>' +
          SN.timeline(b) +
        '</div>' +

        /* Simulated map */
        '<div class="card mb16">' +
          '<div class="card-head"><div class="card-title">Route to Customer</div>' +
          '<span class="badge badge-blue">' + w.distanceKm + ' km</span></div>' +
          '<div class="map-box" style="height:250px">' +
            '<div class="map-ring base" style="width:150px;height:150px"></div>' +
            '<div class="map-pin worker" style="left:28%;top:26%"><div class="pin-ic">🔧</div>You</div>' +
            '<div class="map-pin customer" style="left:70%;top:74%"><div class="pin-ic">🏠</div>Customer</div>' +
            '<div class="map-line" style="height:170px;transform:rotate(-135deg)"></div>' +
            '<div class="map-label">Approx. ' + w.distanceKm + ' km · ~' + w.avgResponseMin + ' min</div>' +
          '</div>' +
        '</div>' +

        /* Action flow */
        '<div class="card">' +
          '<div class="card-head"><div class="card-title">Update Job Status</div></div>' +
          (act
            ? '<p class="small muted">Next step: <strong>' + SN.esc(act.label) + '</strong></p>' +
              '<button class="btn ' + act.cls + '" id="advanceBtn">' + SN.esc(act.label) + '</button>'
            : (b.status === 'Completed'
                ? '<div class="row" style="gap:10px"><span class="dot dot-green"></span>' +
                  '<span class="small">This job is complete. Payment and rating will follow from the customer.</span></div>'
                : '<p class="small muted">This job was cancelled.</p>')
          ) +
          '<hr class="divider">' +
          '<div class="btn-row">' +
            '<button class="btn btn-ghost btn-sm" id="callCustomer">Call Customer</button>' +
            '<button class="btn btn-ghost btn-sm" id="navigateBtn">Open Navigation</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div>' +
        '<div class="card mb16">' +
          '<div class="card-title mb12">Customer Details</div>' +
          '<div class="bc-grid" style="border-top:0;padding-top:0">' +
            '<div class="bc-field"><div class="lbl">Name</div><div class="val">' + SN.esc(b.customerName) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Zone</div><div class="val">' + SN.esc(b.customerZone) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Schedule</div><div class="val">' + SN.esc(b.date) + ' · ' + SN.esc(b.time) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Job value</div><div class="val">' + SN.money(b.priceMin) + '–' + SN.money(b.priceMax) + '</div></div>' +
          '</div>' +
          '<hr class="divider">' +
          '<div class="lbl tiny muted">ADDRESS</div>' +
          '<p class="small mb0">' + SN.esc(b.address) + '</p>' +
          (b.description ? '<hr class="divider"><div class="lbl tiny muted">PROBLEM</div><p class="small mb0">' + SN.esc(b.description) + '</p>' : '') +
        '</div>' +

        '<div class="card">' +
          '<div class="card-title mb12">Your Trust Snapshot</div>' +
          SN.bars(SN.trustScore(w).parts.map(function (p) {
            return { label:p.label, value:p.value, cls: p.ok ? 'g' : 'a' };
          })) +
        '</div>' +
      '</div>' +
    '</div>';

  if (window.innerWidth < 900) {
    document.getElementById('jdGrid').style.gridTemplateColumns = '1fr';
  }

  var advanceBtn = document.getElementById('advanceBtn');
  if (advanceBtn) {
    advanceBtn.addEventListener('click', function () {
      var label = act.label, next = act.next;

      if (next === 'Completed') {
        SN.modal({
          title: 'Complete Service?',
          sub: b.id + ' · ' + b.service,
          body: '<p class="small">Confirm that the work has been finished at the customer\'s location.</p>' +
                '<div class="radius-note"><span class="dot dot-green"></span> The customer will be asked to pay and rate the service.</div>',
          actions: [
            { label:'Not yet', cls:'btn-ghost' },
            { label:'Yes, Complete', cls:'btn-green', onClick: function (c) {
                SN.setBookingStatus(b.id, 'Completed');
                SN.notify(b.customerId, 'customer', 'success', 'Service completed.',
                  'Please pay and rate ' + b.workerName + ' for ' + b.id + '.');
                SN.addActivity(b.workerName + ' completed ' + b.id, 'success');
                c();
                SN.toast('Service marked complete.', 'success');
                setTimeout(function () { location.reload(); }, 800);
              } }
          ]
        });
        return;
      }

      SN.setBookingStatus(b.id, next);

      if (next === 'Accepted') {
        SN.notify(b.customerId, 'customer', 'success', b.workerName + ' accepted your booking.',
          'Scheduled for ' + b.date + ' at ' + b.time + '.');
        SN.addActivity(b.workerName + ' accepted ' + b.id, 'info');
      }
      if (next === 'On The Way') {
        SN.notify(b.customerId, 'customer', 'info', 'Worker is on the way.',
          b.workerName + ' is heading to your location.');
      }
      if (next === 'Arrived') {
        SN.notify(b.customerId, 'customer', 'info', 'Worker has arrived.', 'Your service will begin shortly.');
      }
      if (next === 'In Progress') {
        SN.notify(b.customerId, 'customer', 'info', 'Service started.', b.service + ' is now in progress.');
      }

      SN.toast(label + ' — done.', 'success');
      setTimeout(function () { location.reload(); }, 700);
    });
  }

  document.getElementById('callCustomer').addEventListener('click', function () {
    SN.toast('Calling ' + b.customerName + '…', 'info', 'Simulated call in the prototype.');
  });
  document.getElementById('navigateBtn').addEventListener('click', function () {
    SN.toast('Navigation opened.', 'info', 'Simulated route view — no map API used.');
  });
};

/* ---------- Accept / Reject handlers (global) ---------- */
document.addEventListener('click', function (e) {
  var acc = e.target.closest('[data-accept]');
  if (acc) {
    e.preventDefault();
    var id = acc.dataset.accept;
    var b = SN.getBooking(id);
    if (!b) return;
    SN.setBookingStatus(id, 'Accepted');
    SN.notify(b.customerId, 'customer', 'success', b.workerName + ' accepted your booking.',
      'Scheduled for ' + b.date + ' at ' + b.time + '.');
    SN.addActivity(b.workerName + ' accepted ' + id, 'info');
    SN.toast('Request accepted.', 'success', id + ' added to your jobs.');
    setTimeout(function () { location.reload(); }, 800);
    return;
  }

  var rej = e.target.closest('[data-reject]');
  if (rej) {
    e.preventDefault();
    var rid = rej.dataset.reject;
    var rb = SN.getBooking(rid);
    if (!rb) return;

    SN.modal({
      title: 'Reject this request?',
      sub: rid + ' · ' + rb.service,
      body: '<p class="small">The customer will be shown verified backup workers nearby so the service is not delayed.</p>' +
        '<div class="field"><label>Reason (optional)</label>' +
        '<select class="select" id="rejReason">' +
          '<option>Not available at this time</option>' +
          '<option>Outside my service area</option>' +
          '<option>Skill not in my verified set</option>' +
          '<option>Other</option></select></div>',
      actions: [
        { label:'Cancel', cls:'btn-ghost' },
        { label:'Confirm Reject', cls:'btn-danger', onClick: function (c) {
            SN.setBookingStatus(rid, 'Cancelled');
            SN.notify(rb.customerId, 'customer', 'warn', 'Worker could not take this booking.',
              'We found alternative verified workers nearby.');
            SN.addActivity(rb.workerName + ' rejected ' + rid, 'error');
            c();
            SN.toast('Request rejected. Backup flow triggered.', 'warn');
            setTimeout(function () { location.reload(); }, 900);
          } }
      ]
    });
  }
});

/* ---------- Schedule ---------- */
SN.PAGES['worker:schedule'] = function (main) {
  var mine = workerBookings().filter(function (b) {
    return ['Request Sent','Accepted','On The Way','Arrived','In Progress'].indexOf(b.status) > -1;
  });

  var byDate = {};
  mine.forEach(function (b) {
    byDate[b.date] = byDate[b.date] || [];
    byDate[b.date].push(b);
  });
  var dates = Object.keys(byDate).sort();

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('schedule') + '</h2>' +
    '<p class="ph-sub">Upcoming confirmed and pending services.</p></div>' +
    '<span class="badge badge-blue badge-lg">' + mine.length + ' scheduled</span></div>' +

    (dates.length
      ? '<div class="grid grid-2">' + dates.map(function (d) {
          return '<div class="sched-day">' +
            '<div class="sched-date">' + SN.esc(d) + '</div>' +
            '<div class="sched-list">' + byDate[d].map(function (b) {
              var cls = b.status === 'Accepted' ? 'g' : b.status === 'Request Sent' ? 'a' : '';
              return '<div class="sched-item ' + cls + '">' +
                '<div class="sched-time">' + SN.esc(b.time) + '</div>' +
                '<div style="flex:1;min-width:0">' +
                  '<div style="font-weight:700;font-size:13px">' + SN.esc(b.service) + '</div>' +
                  '<div class="tiny muted">' + SN.esc(b.customerName) + ' · ' + SN.esc(b.address) + '</div>' +
                '</div>' +
                '<a class="btn btn-ghost btn-sm" href="job-details.html?id=' + b.id + '">Open</a>' +
              '</div>';
            }).join('') + '</div>' +
          '</div>';
        }).join('') + '</div>'
      : SN.empty('Nothing scheduled', 'Accept a request to fill your calendar.', '▦'));
};

/* ---------- Earnings ---------- */
SN.PAGES['worker:earnings'] = function (main) {
  var w = currentWorker();
  var mine = workerBookings();
  var paid = mine.filter(function (b) { return b.payment; });

  var today = paid.reduce(function (a, b) { return a + b.payment.amount; }, 0);
  var week = Math.round(today * 1.8);
  var month = SN.DATA.monthlyEarnings[SN.DATA.monthlyEarnings.length - 1].value;

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('earnings') + '</h2>' +
    '<p class="ph-sub">Settled payments from completed jobs.</p></div>' +
    '<span class="badge badge-green badge-lg">Cooperative wallet active</span></div>' +

    '<div class="kpi-grid">' +
      SN.kpi("Today's Earnings", SN.money(today), paid.length + ' settled jobs') +
      SN.kpi('This Week', SN.money(week), 'Mon – Sun') +
      SN.kpi('This Month', SN.money(month), 'March 2026', 'kpi-up') +
      SN.kpi('Completed Jobs', mine.filter(function (b) { return b.status === 'Completed'; }).length, 'Lifetime ' + w.jobs) +
    '</div>' +

    '<div class="grid" style="grid-template-columns:1.3fr 1fr;gap:16px" id="earnGrid">' +
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Monthly Earnings</div>' +
        '<span class="badge badge-blue">Last 6 months</span></div>' +
        SN.barChart(SN.DATA.monthlyEarnings, { key:'value', prefix:'₹', alt:true }) +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title mb12">Recent Settlements</div>' +
        (paid.length
          ? paid.map(function (b) {
              return '<div class="row-between" style="padding:10px 0;border-bottom:1px solid var(--line)">' +
                '<div><div style="font-weight:600;font-size:13px">' + SN.esc(b.service) + '</div>' +
                '<div class="tiny muted">' + SN.esc(b.id) + ' · ' + SN.esc(b.payment.method) + '</div></div>' +
                '<div style="text-align:right"><div style="font-weight:700">' + SN.money(b.payment.amount) + '</div>' +
                '<div class="tiny muted">' + SN.fmtDate(b.payment.at) + '</div></div>' +
              '</div>';
            }).join('')
          : SN.empty('No settlements yet', 'Payments appear after completed jobs.', '₹')) +
      '</div>' +
    '</div>';

  if (window.innerWidth < 900) {
    document.getElementById('earnGrid').style.gridTemplateColumns = '1fr';
  }
};

/* ---------- Worker profile ---------- */
SN.PAGES['worker:profile'] = function (main) {
  var w = currentWorker();
  var ts = SN.trustScore(w);

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('profile') + '</h2>' +
    '<p class="ph-sub">Your verified identity, skills and performance.</p></div>' +
    '<button class="btn btn-primary" id="addSkillBtn">+ Add Skill</button></div>' +

    '<div class="grid" style="grid-template-columns:1fr 1.4fr;gap:20px" id="wpGrid">' +

      '<div>' +
        '<div class="card mb16" style="text-align:center">' +
          '<div class="avatar avatar-xl" style="margin:0 auto 12px">' + SN.esc(w.initials) + '</div>' +
          '<h3 class="mb0">' + SN.esc(w.name) + '</h3>' +
          '<p class="small muted">' + SN.esc(w.trade) + '</p>' +
          (w.verified
            ? '<span class="badge badge-green">✓ Cooperative Verified</span>'
            : '<span class="badge badge-amber">Verification Pending</span>') +
          '<hr class="divider">' +
          '<div class="bc-grid" style="border-top:0;padding-top:0;text-align:left">' +
            '<div class="bc-field"><div class="lbl">Experience</div><div class="val">' + w.experience + ' years</div></div>' +
            '<div class="bc-field"><div class="lbl">Jobs completed</div><div class="val">' + w.jobs + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Rating</div><div class="val">' + w.rating + ' ★</div></div>' +
            '<div class="bc-field"><div class="lbl">Completion rate</div><div class="val">' + w.completionRate + '%</div></div>' +
            '<div class="bc-field"><div class="lbl">Response rate</div><div class="val">' + w.responseRate + '%</div></div>' +
            '<div class="bc-field"><div class="lbl">Cooperative</div><div class="val">' + SN.esc(w.coop) + '</div></div>' +
          '</div>' +
        '</div>' +
        SN.trustBox(w) +
      '</div>' +

      '<div>' +
        '<div class="card mb16">' +
          '<div class="card-head"><div class="card-title">Verified Skills</div>' +
          '<span class="badge badge-green">' + w.skills.length + ' verified</span></div>' +
          '<div class="pp-skills">' +
            w.skills.map(function (s) { return '<span class="pp-skill">✓ ' + SN.esc(s) + '</span>'; }).join('') +
          '</div>' +
          (w.pendingSkills && w.pendingSkills.length
            ? '<div class="pp-section-title mt16">Pending Verification</div>' +
              '<div class="pp-skills">' + w.pendingSkills.map(function (s) {
                return '<span class="pp-skill pending">◌ ' + SN.esc(s) + '</span>';
              }).join('') + '</div>' +
              '<p class="tiny muted mb0">A cooperative admin must approve these skills before they appear on your passport.</p>'
            : '') +
        '</div>' +

        '<div class="card mb16">' +
          '<div class="card-head"><div class="card-title">Certificates &amp; Training</div></div>' +
          (w.certificates && w.certificates.length
            ? w.certificates.map(function (c) {
                return '<div class="row-between" style="padding:11px 0;border-bottom:1px solid var(--line)">' +
                  '<div><div style="font-weight:600;font-size:13.5px">' + SN.esc(c.name) + '</div>' +
                  '<div class="tiny muted">' + SN.esc(c.issuer) + '</div></div>' +
                  '<span class="badge badge-green">' + c.year + '</span></div>';
              }).join('')
            : '<p class="small muted mb0">No certificates uploaded yet.</p>') +
        '</div>' +

        '<div class="card">' +
          '<div class="card-title mb12">Rating Breakdown</div>' +
          SN.bars(SN.DATA.ratingBreakdown.map(function (r) {
            return { label:r.label, value:r.pct, cls:'a' };
          })) +
        '</div>' +
      '</div>' +
    '</div>';

  if (window.innerWidth < 900) {
    document.getElementById('wpGrid').style.gridTemplateColumns = '1fr';
  }

  document.getElementById('addSkillBtn').addEventListener('click', function () {
    SN.modal({
      title: 'Add a Skill',
      sub: 'New skills start as “Pending Verification”',
      body:
        '<div class="field"><label>Skill name</label>' +
        '<input class="input" id="newSkill" placeholder="e.g. Solar Panel Wiring"></div>' +
        '<div class="radius-note"><span class="dot dot-amber"></span> A cooperative admin will review and verify this skill.</div>',
      actions: [
        { label:'Cancel', cls:'btn-ghost' },
        { label:'Submit for Verification', cls:'btn-primary', onClick: function (close) {
            var val = document.getElementById('newSkill').value.trim();
            if (!val) { SN.toast('Please enter a skill name.', 'error'); return; }
            w.pendingSkills = w.pendingSkills || [];
            w.pendingSkills.push(val);

            /* Also create a verification record for the admin queue */
            SN.state.verifications.unshift({
              id: SN.uid('v'), workerId: w.id, name: w.name, trade: w.trade,
              experience: w.experience, zone: w.zone, coop: w.coop,
              submitted: new Date().toISOString().slice(0,10),
              skillsPending: [val],
              docs: ['Aadhaar (verified)', 'Skill declaration'],
              status: 'Pending'
            });

            SN.addActivity(w.name + ' requested verification for ' + val, 'warn');
            SN.save();
            close();
            SN.toast('Skill submitted for verification.', 'success', 'Status: Pending Verification');
            setTimeout(function () { location.reload(); }, 800);
          } }
      ]
    });
  });
};