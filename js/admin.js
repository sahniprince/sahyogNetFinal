/* ============================================================
   SahyogNET — admin.js
   Cooperative admin page renderers.
   ============================================================ */

function coopWorkers() { return SN.state.workers; }

/* ---------- Dashboard ---------- */
SN.PAGES['admin:dashboard'] = function (main) {
  var workers = coopWorkers();
  var active = workers.filter(function (w) { return w.available; });
  var pendingVerif = SN.state.verifications.filter(function (v) { return v.status === 'Pending'; });
  var todayJobs = SN.state.bookings.length;
  var completed = SN.state.bookings.filter(function (b) { return b.status === 'Completed'; });
  var avgRating = (workers.reduce(function (a, w) { return a + w.rating; }, 0) / workers.length).toFixed(2);
  var revenue = SN.state.bookings.reduce(function (a, b) { return a + (b.payment ? b.payment.amount : 0); }, 0);

  main.innerHTML =
    '<div class="page-head"><div><h2>Cooperative Dashboard</h2>' +
    '<p class="ph-sub">Sahyog Cooperative · Lucknow · ' + SN.fmtDate(new Date().toISOString()) + '</p></div>' +
    '<div class="btn-row">' +
      '<a class="btn btn-ghost" href="demand.html">Demand Heatmap</a>' +
      '<a class="btn btn-primary" href="verification.html">Verify Workers (' + pendingVerif.length + ')</a>' +
    '</div></div>' +

    '<div class="kpi-grid">' +
      SN.kpi('Total Workers', workers.length, 'Registered in cooperative') +
      SN.kpi('Active Workers', active.length, 'Available right now', 'kpi-up') +
      SN.kpi('Customers', SN.DATA.customers.length, 'Unique service users') +
      SN.kpi("Today's Jobs", todayJobs, 'All statuses') +
      SN.kpi('Completed Jobs', completed.length, 'This cycle') +
      SN.kpi('Average Rating', avgRating + ' ★', 'Across all workers') +
      SN.kpi('Monthly Revenue', SN.money(revenue), 'Settled + pending', 'kpi-up') +
    '</div>' +

    '<div class="grid" style="grid-template-columns:1.4fr 1fr;gap:16px" id="adGrid">' +
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Jobs This Week</div>' +
        '<span class="badge badge-blue">' + SN.DATA.jobsSeries.reduce(function (a, d) { return a + d.jobs; }, 0) + ' total</span></div>' +
        SN.barChart(SN.DATA.jobsSeries, { key:'jobs', alt:true }) +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title mb12">Recent Activity</div>' +
        SN.state.activities.slice(0, 6).map(function (a) {
          var cls = a.type === 'success' ? 'g' : a.type === 'warn' ? 'a' : a.type === 'error' ? 'r' : '';
          return '<div class="row" style="padding:9px 0;border-bottom:1px solid var(--line);align-items:flex-start">' +
            '<span class="notif-ic ' + cls + '" style="width:26px;height:26px;font-size:12px">•</span>' +
            '<div><div style="font-size:12.5px;font-weight:500">' + SN.esc(a.text) + '</div>' +
            '<div class="tiny muted">' + SN.ago(a.time) + '</div></div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>' +

    '<div class="grid grid-2 mt16">' +
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Top Performing Workers</div>' +
        '<a class="small" href="workers.html">All workers</a></div>' +
        '<div class="chart-h">' +
          SN.state.workers.slice(0, 5).map(function (w) {
            return '<div class="row"><span class="lbl">' + SN.esc(w.name) + '</span>' +
              '<span class="bar-track"><span class="bar-fill g" style="width:' + Math.round(w.rating / 5 * 100) + '%"></span></span>' +
              '<span class="val">' + w.rating + '★</span></div>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Service Demand Today</div>' +
        '<a class="small" href="demand.html">Heatmap</a></div>' +
        '<div class="chart-h">' +
          SN.DATA.zones.slice(0, 5).map(function (z) {
            return '<div class="row"><span class="lbl">' + SN.esc(z.trade) + '</span>' +
              '<span class="bar-track"><span class="bar-fill a" style="width:' + Math.min(100, z.requests) + '%"></span></span>' +
              '<span class="val">' + z.requests + '</span></div>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>';

  if (window.innerWidth < 900) {
    document.getElementById('adGrid').style.gridTemplateColumns = '1fr';
  }
};

/* ---------- Worker management ---------- */
SN.PAGES['admin:workers'] = function (main) {
  var filter = 'all';
  var query = '';

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('workers') + '</h2>' +
    '<p class="ph-sub">Search, verify, suspend and review worker performance.</p></div></div>' +

    '<div class="card mb16">' +
      '<div class="grid grid-2" style="gap:12px">' +
        '<div class="search-wrap"><span class="search-ic">⌕</span>' +
        '<input class="input" id="wSearch" placeholder="Search by name, trade or zone…"></div>' +
        '<div class="pill-tabs" id="wFilters">' +
          '<button class="active" data-f="all">All</button>' +
          '<button data-f="verified">Verified</button>' +
          '<button data-f="pending">Pending</button>' +
          '<button data-f="suspended">Suspended</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div id="wHost"></div>';

  function render() {
    var list = SN.state.workers.filter(function (w) {
      if (filter === 'verified' && !w.verified) return false;
      if (filter === 'pending' && w.verified) return false;
      if (filter === 'suspended') return false; /* none seeded; keeps the filter honest */
      if (query) {
        var hay = (w.name + ' ' + w.trade + ' ' + w.zone).toLowerCase();
        if (hay.indexOf(query.toLowerCase()) === -1) return false;
      }
      return true;
    });

    var host = document.getElementById('wHost');
    if (!list.length) { host.innerHTML = SN.empty('No workers match', 'Try a different search or filter.', '👷'); return; }

    host.innerHTML = '<div class="table-wrap"><table class="tbl"><thead><tr>' +
      '<th>Worker</th><th>Trade</th><th>Rating</th><th>Jobs</th><th>Trust</th><th>Status</th><th>Actions</th>' +
      '</tr></thead><tbody>' +
      list.map(function (w) {
        var ts = SN.trustScore(w);
        return '<tr>' +
          '<td><div class="row" style="gap:10px">' + SN.avatar(w) +
            '<div><div class="tbl-name">' + SN.esc(w.name) + '</div>' +
            '<div class="tbl-sub">' + SN.esc(w.zone) + ' · ' + w.experience + ' yrs</div></div></div></td>' +
          '<td>' + SN.esc(w.trade) + '</td>' +
          '<td><strong>' + w.rating + '</strong> ★</td>' +
          '<td>' + w.jobs + '</td>' +
          '<td><span class="badge badge-blue">' + ts.total + '/100</span></td>' +
          '<td>' + (w.verified
            ? '<span class="badge badge-green">Verified</span>'
            : '<span class="badge badge-amber">Pending</span>') + '</td>' +
          '<td><div class="btn-row">' +
            '<button class="btn btn-ghost btn-sm" data-view="' + w.id + '">View</button>' +
            (w.verified
              ? '<button class="btn btn-ghost btn-sm" data-suspend="' + w.id + '">Suspend</button>'
              : '<button class="btn btn-primary btn-sm" data-verify="' + w.id + '">Verify</button>') +
          '</div></td>' +
        '</tr>';
      }).join('') +
      '</tbody></table></div>';
  }

  document.getElementById('wSearch').addEventListener('input', function () {
    query = this.value;
    render();
  });
  document.getElementById('wFilters').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-f]');
    if (!btn) return;
    this.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    filter = btn.dataset.f;
    render();
  });
  render();
};

/* Admin worker row actions */
document.addEventListener('click', function (e) {
  var view = e.target.closest('[data-view]');
  if (view) {
    var w = SN.getWorker(view.dataset.view);
    var ts = SN.trustScore(w);
    SN.modal({
      title: w.name,
      sub: w.trade + ' · ' + w.zone,
      wide: true,
      body:
        '<div class="bc-grid" style="border-top:0;padding-top:0">' +
          '<div class="bc-field"><div class="lbl">Rating</div><div class="val">' + w.rating + ' ★</div></div>' +
          '<div class="bc-field"><div class="lbl">Jobs</div><div class="val">' + w.jobs + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Completion</div><div class="val">' + w.completionRate + '%</div></div>' +
          '<div class="bc-field"><div class="lbl">Response rate</div><div class="val">' + w.responseRate + '%</div></div>' +
          '<div class="bc-field"><div class="lbl">Trust Score</div><div class="val">' + ts.total + '/100</div></div>' +
          '<div class="bc-field"><div class="lbl">Availability</div><div class="val">' + (w.available ? 'Available' : 'Busy') + '</div></div>' +
        '</div>' +
        '<hr class="divider"><div class="pp-section-title">Verified Skills</div>' +
        '<div class="pp-skills">' + w.skills.map(function (s) { return '<span class="pp-skill">✓ ' + SN.esc(s) + '</span>'; }).join('') + '</div>' +
        '<hr class="divider">' + SN.bars(ts.parts.map(function (p) {
          return { label:p.label, value:p.value, cls: p.ok ? 'g' : 'a' };
        })),
      actions: [{ label:'Close', cls:'btn-ghost' }]
    });
    return;
  }

  var verify = e.target.closest('[data-verify]');
  if (verify) {
    var vid = verify.dataset.verify;
    var vw = SN.getWorker(vid);
    vw.verified = true;
    vw.verifyLevel = 'High';
    SN.addActivity(vw.name + ' verified by cooperative admin', 'success');
    SN.save();
    SN.toast('Worker verified successfully.', 'success', vw.name + ' is now cooperative-verified.');
    setTimeout(function () { location.reload(); }, 800);
    return;
  }

  var suspend = e.target.closest('[data-suspend]');
  if (suspend) {
    var sid = suspend.dataset.suspend;
    var sw = SN.getWorker(sid);
    SN.modal({
      title: 'Suspend ' + sw.name + '?',
      body: '<p class="small">A suspended worker is removed from customer search results until the cooperative reinstates them.</p>',
      actions: [
        { label:'Cancel', cls:'btn-ghost' },
        { label:'Confirm Suspend', cls:'btn-danger', onClick: function (c) {
            sw.verified = false;
            sw.available = false;
            sw.verifyLevel = 'Pending';
            SN.addActivity(sw.name + ' suspended by cooperative admin', 'error');
            SN.save();
            c();
            SN.toast('Worker suspended.', 'warn');
            setTimeout(function () { location.reload(); }, 800);
          } }
      ]
    });
  }
});

/* ---------- Verification centre ---------- */
SN.PAGES['admin:verification'] = function (main) {
  main.innerHTML =
    '<div class="page-head"><div><h2>Worker Verification Centre</h2>' +
    '<p class="ph-sub">Review identity documents, certificates and skill claims before they appear on a passport.</p></div></div>' +
    '<div id="verHost"></div>';

  function render() {
    var list = SN.state.verifications;
    var host = document.getElementById('verHost');
    if (!list.length) { host.innerHTML = SN.empty('No verification requests', 'New submissions appear here.', '✓'); return; }

    host.innerHTML = '<div class="grid" style="gap:14px">' + list.map(function (v) {
      return '<article class="card">' +
        '<div class="card-head">' +
          '<div class="row" style="gap:12px">' +
            '<div class="avatar avatar-lg">' + SN.esc(SN.initials(v.name)) + '</div>' +
            '<div><div style="font-weight:700;font-size:15px">' + SN.esc(v.name) + '</div>' +
            '<div class="tiny muted">' + SN.esc(v.trade) + ' · ' + v.experience + ' years · ' + SN.esc(v.zone) + '</div>' +
            '<div class="tiny muted">Submitted ' + SN.fmtDate(v.submitted) + ' · ' + SN.esc(v.coop) + '</div></div>' +
          '</div>' +
          '<span class="badge ' + SN.statusBadge(v.status) + ' badge-lg">' + SN.esc(v.status) + '</span>' +
        '</div>' +

        '<div class="grid grid-2" style="gap:18px">' +
          '<div>' +
            '<div class="pp-section-title">Skills Pending Verification</div>' +
            '<div class="pp-skills">' + v.skillsPending.map(function (s) {
              return '<span class="pp-skill pending">◌ ' + SN.esc(s) + '</span>';
            }).join('') + '</div>' +
          '</div>' +
          '<div>' +
            '<div class="pp-section-title">Documents</div>' +
            v.docs.map(function (d) {
              return '<div class="row" style="gap:8px;padding:5px 0;font-size:13px">' +
                '<span class="tick">✓</span><span>' + SN.esc(d) + '</span></div>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="bc-actions mt16">' +
          '<button class="btn btn-ghost btn-sm" data-vreview="' + v.id + '">Review</button>' +
          (v.status === 'Pending'
            ? '<button class="btn btn-green btn-sm" data-vapprove="' + v.id + '">Approve</button>' +
              '<button class="btn btn-danger btn-sm" data-vreject="' + v.id + '">Reject</button>'
            : '<span class="small muted">Decision recorded.</span>') +
        '</div>' +
      '</article>';
    }).join('') + '</div>';
  }
  render();
};

document.addEventListener('click', function (e) {
  var rev = e.target.closest('[data-vreview]');
  if (rev) {
    var v = SN.state.verifications.filter(function (x) { return x.id === rev.dataset.vreview; })[0];
    SN.modal({
      title: 'Verification Review — ' + v.name,
      sub: v.trade + ' · ' + v.experience + ' years experience',
      wide: true,
      body:
        '<div class="radius-note mb16"><span class="dot dot-blue"></span> Cooperative verification is a review, not a formality. Confirm each skill before approving.</div>' +
        '<div class="pp-section-title">Identity</div>' +
        '<p class="small">Aadhaar and cooperative membership records matched for ' + SN.esc(v.name) + '.</p>' +
        '<div class="pp-section-title mt16">Skills claimed</div>' +
        '<div class="pp-skills">' + v.skillsPending.map(function (s) {
          return '<span class="pp-skill pending">◌ ' + SN.esc(s) + '</span>';
        }).join('') + '</div>' +
        '<div class="pp-section-title mt16">Documents submitted</div>' +
        '<ul class="check-list">' + v.docs.map(function (d) {
          return '<li><span class="tick">✓</span> ' + SN.esc(d) + '</li>';
        }).join('') + '</ul>',
      actions: [
        { label:'Close', cls:'btn-ghost' },
        { label:'Approve', cls:'btn-green', onClick: function (c) { approveVerification(v.id); c(); } }
      ]
    });
    return;
  }

  var app = e.target.closest('[data-vapprove]');
  if (app) { approveVerification(app.dataset.vapprove); return; }

  var rej = e.target.closest('[data-vreject]');
  if (rej) {
    var rv = SN.state.verifications.filter(function (x) { return x.id === rej.dataset.vreject; })[0];
    SN.modal({
      title: 'Reject verification?',
      sub: rv.name,
      body: '<div class="field"><label>Reason</label><select class="select" id="rejReason">' +
        '<option>Documents incomplete</option><option>Skill demonstration failed</option>' +
        '<option>Certificate could not be validated</option><option>Other</option></select></div>',
      actions: [
        { label:'Cancel', cls:'btn-ghost' },
        { label:'Confirm Reject', cls:'btn-danger', onClick: function (c) {
            rv.status = 'Rejected';
            var w = SN.getWorker(rv.workerId);
            if (w) {
              w.pendingSkills = (w.pendingSkills || []).filter(function (s) {
                return rv.skillsPending.indexOf(s) === -1;
              });
              w.verifyLevel = 'Pending';
            }
            SN.addActivity('Verification rejected for ' + rv.name, 'error');
            SN.save();
            c();
            SN.toast('Verification rejected.', 'warn');
            setTimeout(function () { location.reload(); }, 800);
          } }
      ]
    });
  }
});

function approveVerification(id) {
  var v = SN.state.verifications.filter(function (x) { return x.id === id; })[0];
  if (!v) return;
  v.status = 'Approved';

  var w = SN.getWorker(v.workerId);
  if (w) {
    v.skillsPending.forEach(function (s) {
      if (w.skills.indexOf(s) === -1) w.skills.push(s);
    });
    w.pendingSkills = (w.pendingSkills || []).filter(function (s) {
      return v.skillsPending.indexOf(s) === -1;
    });
    w.verified = true;
    w.verifyLevel = 'High';
  }

  SN.notify(v.workerId, 'worker', 'success', 'Skill verification approved.',
    v.skillsPending.join(', ') + ' now appear on your passport.');
  SN.addActivity('Verified ' + v.skillsPending.join(', ') + ' for ' + v.name, 'success');
  SN.save();

  SN.modal({
    title: 'Worker verified successfully.',
    body: '<div style="text-align:center"><div class="success-mark">✓</div>' +
      '<h3>' + SN.esc(v.name) + '</h3>' +
      '<p class="small muted">' + v.skillsPending.length + ' skill(s) added to the Skill Verification Passport.</p>' +
      '<span class="badge badge-green badge-lg">Verification Level: HIGH</span></div>',
    actions: [{ label:'Done', cls:'btn-primary', onClick: function (c) { c(); location.reload(); } }]
  });
}

/* ---------- Customers ---------- */
SN.PAGES['admin:customers'] = function (main) {
  var list = SN.DATA.customers;

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('customers') + '</h2>' +
    '<p class="ph-sub">Customers served through the cooperative network.</p></div></div>' +
    '<div class="table-wrap"><table class="tbl"><thead><tr>' +
      '<th>Customer</th><th>Zone</th><th>Bookings</th><th>Recent Service</th><th>Complaints</th><th>Status</th>' +
      '</tr></thead><tbody>' +
      list.map(function (c) {
        return '<tr>' +
          '<td><div class="row" style="gap:10px">' +
            '<div class="avatar">' + SN.esc(c.initials) + '</div>' +
            '<div><div class="tbl-name">' + SN.esc(c.name) + '</div>' +
            '<div class="tbl-sub">' + SN.esc(c.phone) + ' · since ' + c.since + '</div></div></div></td>' +
          '<td>' + SN.esc(c.zone) + '</td>' +
          '<td>' + c.bookings + '</td>' +
          '<td>' + SN.esc(c.recentService) + '</td>' +
          '<td>' + (c.complaints ? '<span class="badge badge-red">' + c.complaints + '</span>' : '<span class="badge badge-grey">0</span>') + '</td>' +
          '<td><span class="badge ' + SN.statusBadge(c.status) + '">' + SN.esc(c.status) + '</span></td>' +
        '</tr>';
      }).join('') +
    '</tbody></table></div>';
};

/* ---------- Service management ---------- */
SN.PAGES['admin:services'] = function (main) {
  main.innerHTML =
    '<div class="page-head"><div><h2>Service Management</h2>' +
    '<p class="ph-sub">Categories, active workers, demand level and average local pricing.</p></div></div>' +
    '<div class="table-wrap"><table class="tbl"><thead><tr>' +
      '<th>Service</th><th>Active Workers</th><th>Demand Level</th><th>Average Price</th><th>Coverage</th>' +
      '</tr></thead><tbody>' +
      SN.DATA.services.map(function (s) {
        var coverage = s.workers >= 100 ? 'Strong' : s.workers >= 60 ? 'Adequate' : 'Thin';
        var covCls = coverage === 'Strong' ? 'badge-green' : coverage === 'Adequate' ? 'badge-amber' : 'badge-red';
        return '<tr>' +
          '<td><div class="row" style="gap:9px"><span style="font-size:17px">' + s.icon + '</span>' +
            '<span class="tbl-name">' + SN.esc(s.name) + '</span></div></td>' +
          '<td>' + s.workers + '</td>' +
          '<td><span class="badge ' + (s.demand === 'High' ? 'badge-amber' : s.demand === 'Medium' ? 'badge-blue' : 'badge-grey') + '">' +
            s.demand + '</span></td>' +
          '<td>' + SN.esc(s.avgPrice) + '</td>' +
          '<td><span class="badge ' + covCls + '">' + coverage + '</span></td>' +
        '</tr>';
      }).join('') +
    '</tbody></table></div>';
};

/* ---------- Analytics ---------- */
SN.PAGES['admin:analytics'] = function (main) {
  var workers = SN.state.workers;
  var avgRating = (workers.reduce(function (a, w) { return a + w.rating; }, 0) / workers.length).toFixed(2);
  var avgResponse = Math.round(workers.reduce(function (a, w) { return a + w.avgResponseMin; }, 0) / workers.length);
  var completed = SN.state.bookings.filter(function (b) { return b.status === 'Completed'; }).length;
  var satisfaction = Math.round(
    SN.state.bookings.filter(function (b) { return b.rating; })
      .reduce(function (a, b) { return a + b.rating.stars; }, 0) /
    Math.max(1, SN.state.bookings.filter(function (b) { return b.rating; }).length) * 20
  );

  main.innerHTML =
    '<div class="page-head"><div><h2>Cooperative Health Dashboard</h2>' +
    '<p class="ph-sub">Service quality, worker activity and customer satisfaction.</p></div></div>' +

    '<div class="kpi-grid">' +
      SN.kpi('Total Jobs', SN.DATA.jobsSeries.reduce(function (a, d) { return a + d.jobs; }, 0), 'This week') +
      SN.kpi('Active Workers', workers.filter(function (w) { return w.available; }).length, 'Of ' + workers.length + ' total') +
      SN.kpi('Average Rating', avgRating + ' ★', 'Across all trades') +
      SN.kpi('Avg Response Time', avgResponse + ' min', 'Lower is better', 'kpi-up') +
      SN.kpi('Customer Satisfaction', satisfaction + '%', 'From submitted reviews') +
      SN.kpi('Completed Jobs', completed, 'Settled bookings') +
    '</div>' +

    '<div class="grid grid-2 mb16">' +
      '<div class="card">' +
        '<div class="card-title mb12">Jobs Over Time</div>' +
        SN.barChart(SN.DATA.jobsSeries, { key:'jobs' }) +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title mb12">Revenue Trend</div>' +
        SN.barChart(SN.DATA.jobsSeries, { key:'revenue', prefix:'₹', alt:true }) +
      '</div>' +
    '</div>' +

    '<div class="grid grid-2">' +
      '<div class="card">' +
        '<div class="card-title mb12">Worker Activity (jobs this month)</div>' +
        SN.hBarChart(SN.DATA.workerActivity.map(function (d) { return { label:d.label, value:d.jobs }; })) +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title mb12">Service Demand Share</div>' +
        SN.bars(SN.DATA.regionalDemand.slice(0, 6).map(function (d) {
          return { label:d.service, value:d.pct, cls:'a' };
        })) +
      '</div>' +
    '</div>';
};

/* ---------- Demand heatmap ---------- */
SN.PAGES['admin:demand'] = function (main) {
  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('demand') + '</h2>' +
    '<p class="ph-sub">Zone-level demand across the cooperative service area. Click a zone for detail.</p></div>' +
    '<span class="badge badge-blue badge-lg">Updated live from job data</span></div>' +

    '<div class="heat-grid mb16" id="heatGrid">' +
      SN.DATA.zones.map(function (z) {
        return '<button class="heat-zone" data-zone="' + z.id + '">' +
          '<div class="z-name">' + SN.esc(z.name) + '</div>' +
          '<div class="z-trade">' + SN.esc(z.trade) + ' demand — <strong>' + SN.esc(z.demand) + '</strong></div>' +
          '<div class="heat-swatch lv-' + z.level + '"></div>' +
          '<div class="z-meta">' + z.workers + ' available workers · ' + z.requests + ' requests</div>' +
        '</button>';
      }).join('') +
    '</div>' +

    '<div class="card mb16">' +
      '<div class="legend">' +
        '<span><i class="lv-low"></i> Low</span>' +
        '<span><i class="lv-medium"></i> Medium</span>' +
        '<span><i class="lv-high"></i> High</span>' +
        '<span><i class="lv-vhigh"></i> Very High</span>' +
      '</div>' +
    '</div>' +

    '<div id="zoneDetail"></div>' +

    '<div class="card mt16">' +
      '<div class="card-head"><div class="card-title">Interpretation for the Cooperative</div></div>' +
      '<p class="small">Zones with <strong>Very High</strong> demand and low available workers indicate a deployment or training gap. ' +
      'Zone C shows AC Repair demand at very high levels with only 9 available workers — a candidate for cross-training electricians.</p>' +
      '<a class="btn btn-primary btn-sm" href="../federation/skill-gaps.html">Open Skill Gap Analysis →</a>' +
    '</div>';

  document.getElementById('heatGrid').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-zone]');
    if (!btn) return;
    this.querySelectorAll('.heat-zone').forEach(function (b) { b.classList.remove('selected'); });
    btn.classList.add('selected');

    var z = SN.DATA.zones.filter(function (x) { return x.id === btn.dataset.zone; })[0];
    document.getElementById('zoneDetail').innerHTML =
      '<div class="card">' +
        '<div class="card-head"><div><div class="card-title">' + SN.esc(z.name) + '</div>' +
        '<p class="card-sub">Top service: ' + SN.esc(z.topService) + '</p></div>' +
        '<span class="badge ' + (z.level === 'vhigh' ? 'badge-red' : z.level === 'high' ? 'badge-amber' : 'badge-green') + ' badge-lg">' +
          SN.esc(z.demand) + ' demand</span></div>' +
        '<div class="bc-grid" style="border-top:0;padding-top:0">' +
          '<div class="bc-field"><div class="lbl">Trade</div><div class="val">' + SN.esc(z.trade) + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Available workers</div><div class="val">' + z.workers + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Requests</div><div class="val">' + z.requests + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Avg response</div><div class="val">' + z.avgResponse + ' min</div></div>' +
        '</div>' +
        '<hr class="divider">' +
        '<div class="radius-note ' + (z.level === 'vhigh' || z.level === 'high' ? 'expanded' : '') + '">' +
          '<span class="dot ' + (z.level === 'vhigh' ? 'dot-red' : z.level === 'high' ? 'dot-amber' : 'dot-green') + '"></span> ' +
          (z.level === 'vhigh' || z.level === 'high'
            ? 'Recommendation: deploy or cross-train additional ' + SN.esc(z.trade) + ' workers to this zone.'
            : 'Coverage is adequate for current demand levels.') +
        '</div>' +
      '</div>';
  });
};

/* ---------- Complaints ---------- */
SN.PAGES['admin:complaints'] = function (main) {
  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('complaints') + '</h2>' +
    '<p class="ph-sub">Review, resolve and track customer complaints.</p></div></div>' +
    '<div id="cmpHost"></div>';

  function render() {
    var list = SN.state.complaints;
    var host = document.getElementById('cmpHost');
    if (!list.length) { host.innerHTML = SN.empty('No complaints', 'All clear in the cooperative.', '⚠'); return; }

    host.innerHTML = '<div class="grid" style="gap:13px">' + list.map(function (c) {
      return '<article class="card">' +
        '<div class="card-head">' +
          '<div><span class="badge badge-grey">' + SN.esc(c.id) + '</span> ' +
          '<span class="badge badge-amber">' + SN.esc(c.category) + '</span>' +
          '<div style="font-weight:700;font-size:14.5px;margin-top:8px">' + SN.esc(c.detail) + '</div>' +
          '<div class="tiny muted">' + SN.esc(c.customerName) + ' against ' + SN.esc(c.workerName) +
          ' · Booking ' + SN.esc(c.bookingId) + ' · ' + SN.fmtDate(c.date) + ' · ' + SN.esc(c.zone) + '</div></div>' +
          '<span class="badge ' + SN.statusBadge(c.status) + ' badge-lg">' + SN.esc(c.status) + '</span>' +
        '</div>' +
        '<div class="bc-actions">' +
          '<button class="btn btn-ghost btn-sm" data-creview="' + c.id + '">Review</button>' +
          (c.status === 'Open'
            ? '<button class="btn btn-green btn-sm" data-cresolve="' + c.id + '">Resolve</button>'
            : '<span class="small muted">Resolved</span>') +
        '</div>' +
      '</article>';
    }).join('') + '</div>';
  }
  render();
};

document.addEventListener('click', function (e) {
  var rev = e.target.closest('[data-creview]');
  if (rev) {
    var c = SN.state.complaints.filter(function (x) { return x.id === rev.dataset.creview; })[0];
    SN.modal({
      title: 'Complaint ' + c.id,
      sub: c.category,
      body:
        '<p class="small">' + SN.esc(c.detail) + '</p>' +
        '<div class="bc-grid" style="border-top:0;padding-top:0">' +
          '<div class="bc-field"><div class="lbl">Customer</div><div class="val">' + SN.esc(c.customerName) + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Worker</div><div class="val">' + SN.esc(c.workerName) + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Booking</div><div class="val">' + SN.esc(c.bookingId) + '</div></div>' +
          '<div class="bc-field"><div class="lbl">Filed on</div><div class="val">' + SN.fmtDate(c.date) + '</div></div>' +
        '</div>' +
        '<hr class="divider">' +
        '<div class="field mb0"><label>Resolution note</label>' +
        '<textarea class="textarea" id="resNote" placeholder="e.g. Partial refund of ₹150 issued, worker counselled."></textarea></div>',
      actions: [
        { label:'Close', cls:'btn-ghost' },
        { label:'Resolve', cls:'btn-green', onClick: function (cl) {
            c.status = 'Resolved';
            SN.addActivity('Complaint ' + c.id + ' resolved', 'success');
            SN.save();
            cl();
            SN.toast('Complaint resolved.', 'success');
            setTimeout(function () { location.reload(); }, 800);
          } }
      ]
    });
    return;
  }

  var res = e.target.closest('[data-cresolve]');
  if (res) {
    var rc = SN.state.complaints.filter(function (x) { return x.id === res.dataset.cresolve; })[0];
    rc.status = 'Resolved';
    SN.addActivity('Complaint ' + rc.id + ' resolved', 'success');
    SN.save();
    SN.toast('Complaint resolved.', 'success', rc.id + ' marked as resolved.');
    setTimeout(function () { location.reload(); }, 800);
  }
});