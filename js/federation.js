/* ============================================================
   SahyogNET — federation.js
   Federation / super admin page renderers.
   ============================================================ */

/* ---------- Dashboard ---------- */
SN.PAGES['federation:dashboard'] = function (main) {
  var coops = SN.DATA.cooperatives;
  var totalWorkers = coops.reduce(function (a, c) { return a + c.workers; }, 0);
  var totalJobs = coops.reduce(function (a, c) { return a + c.jobs; }, 0);
  var totalCustomers = coops.reduce(function (a, c) { return a + c.customers; }, 0);
  var avgRating = (coops.reduce(function (a, c) { return a + c.rating; }, 0) / coops.length).toFixed(2);

  main.innerHTML =
    '<div class="page-head"><div><h2>Federation Dashboard</h2>' +
    '<p class="ph-sub">UP Federation of Cooperatives · network-wide oversight</p></div>' +
    '<div class="btn-row">' +
      '<a class="btn btn-ghost" href="regional-demand.html">Regional Demand</a>' +
      '<a class="btn btn-primary" href="skill-gaps.html">Skill Gap Analysis</a>' +
    '</div></div>' +

    '<div class="kpi-grid">' +
      SN.kpi('Total Cooperatives', coops.length, 'Active in network', 'kpi-up') +
      SN.kpi('Total Workers', totalWorkers.toLocaleString('en-IN'), 'Verified across network') +
      SN.kpi('Total Customers', totalCustomers.toLocaleString('en-IN'), 'Served this cycle') +
      SN.kpi('Services Completed', totalJobs.toLocaleString('en-IN'), 'All cooperatives') +
      SN.kpi('Average Rating', avgRating + ' ★', 'Network-wide') +
      SN.kpi('Regional Growth', '+12.4%', 'Quarter on quarter', 'kpi-up') +
    '</div>' +

    '<div class="grid" style="grid-template-columns:1.4fr 1fr;gap:16px" id="fdGrid">' +
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Network Jobs Trend</div>' +
        '<span class="badge badge-blue">Last 7 days</span></div>' +
        SN.barChart(SN.DATA.jobsSeries, { key:'jobs', alt:true }) +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title mb12">Cooperative Performance</div>' +
        SN.hBarChart(coops.map(function (c) { return { label:c.region, value:Math.round(c.jobs / 10) }; })) +
        '<p class="tiny muted mt12 mb0">Values scaled (jobs ÷ 10) for readability.</p>' +
      '</div>' +
    '</div>' +

    '<div class="card mt16">' +
      '<div class="card-head"><div class="card-title">Network Health Signals</div></div>' +
      '<div class="grid grid-3">' +
        '<div class="card" style="box-shadow:none;background:var(--amber-50);border-color:var(--amber-100)">' +
          '<div class="badge badge-amber mb8">Attention</div>' +
          '<h4>Solar Equipment Repair</h4>' +
          '<p class="small mb0">High demand with only 8 verified workers network-wide. Skill gap detected.</p>' +
          '<a class="btn btn-ghost btn-sm mt12" href="skill-gaps.html">Analyse</a>' +
        '</div>' +
        '<div class="card" style="box-shadow:none;background:var(--green-50);border-color:var(--green-100)">' +
          '<div class="badge badge-green mb8">Healthy</div>' +
          '<h4>Plumbing Coverage</h4>' +
          '<p class="small mb0">151 verified workers against medium demand. Balanced across all regions.</p>' +
        '</div>' +
        '<div class="card" style="box-shadow:none;background:var(--red-50);border-color:#F5D2D2">' +
          '<div class="badge badge-red mb8">Watch</div>' +
          '<h4>Gorakhpur Karigar Mandal</h4>' +
          '<p class="small mb0">Growth at +3% — slowest in the network. Review training and deployment.</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  if (window.innerWidth < 900) {
    document.getElementById('fdGrid').style.gridTemplateColumns = '1fr';
  }
};

/* ---------- Cooperatives comparison ---------- */
SN.PAGES['federation:cooperatives'] = function (main) {
  var coops = SN.DATA.cooperatives;

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('cooperatives') + '</h2>' +
    '<p class="ph-sub">Compare performance across the federation. Sample prototype data.</p></div></div>' +

    '<div class="table-wrap mb16"><table class="tbl"><thead><tr>' +
      '<th>Cooperative</th><th>Region</th><th>Workers</th><th>Jobs</th><th>Customers</th>' +
      '<th>Rating</th><th>Revenue</th><th>Growth</th><th>Status</th>' +
      '</tr></thead><tbody>' +
      coops.map(function (c) {
        var growthNum = parseFloat(c.growth.replace('+', ''));
        return '<tr>' +
          '<td class="tbl-name">' + SN.esc(c.name) + '</td>' +
          '<td>' + SN.esc(c.region) + '</td>' +
          '<td>' + c.workers + '</td>' +
          '<td>' + c.jobs.toLocaleString('en-IN') + '</td>' +
          '<td>' + c.customers.toLocaleString('en-IN') + '</td>' +
          '<td><strong>' + c.rating + '</strong> ★</td>' +
          '<td>' + SN.money(c.revenue) + '</td>' +
          '<td class="' + (growthNum >= 10 ? 'kpi-up' : growthNum >= 6 ? '' : 'kpi-down') + '">' + c.growth + '</td>' +
          '<td><span class="badge ' + SN.statusBadge(c.status) + '">' + SN.esc(c.status) + '</span></td>' +
        '</tr>';
      }).join('') +
    '</tbody></table></div>' +

    '<div class="grid grid-2">' +
      '<div class="card">' +
        '<div class="card-title mb12">Workers per Cooperative</div>' +
        SN.hBarChart(coops.map(function (c) { return { label:c.region, value:c.workers }; })) +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title mb12">Jobs Completed</div>' +
        SN.hBarChart(coops.map(function (c) { return { label:c.region, value:c.jobs }; })) +
      '</div>' +
    '</div>';
};

/* ---------- Regional demand ---------- */
SN.PAGES['federation:regional-demand'] = function (main) {
  var demand = SN.DATA.regionalDemand;

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('regional-demand') + '</h2>' +
    '<p class="ph-sub">Top requested services across the federation.</p></div>' +
    '<span class="badge badge-blue badge-lg">Aggregated from ' + SN.DATA.cooperatives.length + ' cooperatives</span></div>' +

    '<div class="grid" style="grid-template-columns:1.2fr 1fr;gap:16px" id="rdGrid">' +
      '<div class="card">' +
        '<div class="card-title mb12">Service Demand Share</div>' +
        SN.bars(demand.map(function (d) { return { label:d.service, value:d.pct, cls:'a' }; })) +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title mb12">Trend Direction</div>' +
        demand.map(function (d) {
          var badge = d.trend === 'up' ? 'badge-green' : d.trend === 'down' ? 'badge-red' : 'badge-grey';
          var arrow = d.trend === 'up' ? '↑' : d.trend === 'down' ? '↓' : '→';
          return '<div class="row-between" style="padding:11px 0;border-bottom:1px solid var(--line)">' +
            '<span style="font-size:13.5px;font-weight:600">' + SN.esc(d.service) + '</span>' +
            '<span><strong style="margin-right:10px">' + d.pct + '%</strong>' +
            '<span class="badge ' + badge + '">' + arrow + ' ' + d.trend + '</span></span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>' +

    '<div class="card mt16">' +
      '<div class="card-head"><div class="card-title">Regional Distribution</div></div>' +
      '<div class="table-wrap"><table class="tbl"><thead><tr>' +
        '<th>Region</th><th>Top Service</th><th>Demand Level</th><th>Available Workers</th><th>Avg Response</th>' +
        '</tr></thead><tbody>' +
        SN.DATA.zones.map(function (z) {
          return '<tr>' +
            '<td class="tbl-name">' + SN.esc(z.name) + '</td>' +
            '<td>' + SN.esc(z.trade) + '</td>' +
            '<td><span class="badge ' + (z.level === 'vhigh' ? 'badge-red' : z.level === 'high' ? 'badge-amber' : z.level === 'medium' ? 'badge-blue' : 'badge-green') + '">' +
              SN.esc(z.demand) + '</span></td>' +
            '<td>' + z.workers + '</td>' +
            '<td>' + z.avgResponse + ' min</td>' +
          '</tr>';
        }).join('') +
      '</tbody></table></div>' +
    '</div>';

  if (window.innerWidth < 900) {
    document.getElementById('rdGrid').style.gridTemplateColumns = '1fr';
  }
};

/* ---------- Skill gaps ---------- */
SN.PAGES['federation:skill-gaps'] = function (main) {
  var gaps = SN.DATA.skillGaps;

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('skill-gaps') + '</h2>' +
    '<p class="ph-sub">Compares service demand against available verified worker skills.</p></div>' +
    '<span class="badge badge-red badge-lg">' + gaps.filter(function (g) { return g.level === 'Gap'; }).length + ' critical gap(s)</span></div>' +

    '<div class="card mb16">' +
      '<div class="card-head"><div class="card-title">Demand vs Available Skills</div>' +
      '<span class="badge badge-blue">Federation-wide</span></div>' +
      gaps.map(function (g) {
        var demandCls = g.demandPct >= 80 ? 'r' : g.demandPct >= 60 ? 'a' : 'g';
        var supplyPct = Math.min(100, Math.round((g.workersAvail / g.workersNeed) * 100));
        var supplyCls = supplyPct >= 95 ? 'g' : supplyPct >= 70 ? 'a' : 'r';
        return '<div class="gap-item">' +
          '<div><div class="gap-name">' + SN.esc(g.service) + '</div>' +
          '<div class="gap-sub">Need ' + g.workersNeed + ' workers · have ' + g.workersAvail + '</div></div>' +
          '<div class="gap-bar"><span class="tiny muted">Demand ' + g.demandPct + '%</span>' +
            '<span class="bar-track"><span class="bar-fill ' + demandCls + '" style="width:' + g.demandPct + '%"></span></span></div>' +
          '<div class="gap-bar"><span class="tiny muted">Supply ' + supplyPct + '%</span>' +
            '<span class="bar-track"><span class="bar-fill ' + supplyCls + '" style="width:' + supplyPct + '%"></span></span></div>' +
          '<span class="badge ' + (g.level === 'Gap' ? 'badge-red' : g.level === 'Watch' ? 'badge-amber' : 'badge-green') + '">' +
            SN.esc(g.level) + '</span>' +
        '</div>';
      }).join('') +
    '</div>' +

    '<div class="grid grid-2">' +
      '<div class="card" style="border-left:3px solid var(--red)">' +
        '<div class="badge badge-red mb8">Skill Gap Detected</div>' +
        '<h4>Solar Equipment Repair</h4>' +
        '<p class="small">Demand is <strong>High</strong> across Chinhat and eastern zones, but only <strong>8</strong> verified workers exist network-wide. ' +
        'Estimated need is <strong>25</strong> workers.</p>' +
        '<div class="radius-note expanded"><span class="dot dot-red"></span> Train 15 additional workers to close this gap.</div>' +
        '<a class="btn btn-primary btn-sm mt12" href="training.html">Open Training Recommendation →</a>' +
      '</div>' +
      '<div class="card" style="border-left:3px solid var(--amber)">' +
        '<div class="badge badge-amber mb8">Watch</div>' +
        '<h4>AC &amp; Appliance Repair</h4>' +
        '<p class="small">Summer demand is rising sharply. <strong>96</strong> workers available against an estimated need of <strong>130</strong>. ' +
        'Electricians with appliance experience are the fastest cross-training pool.</p>' +
        '<div class="radius-note expanded"><span class="dot dot-amber"></span> Train 34 additional workers before peak season.</div>' +
      '</div>' +
    '</div>';

  /* Responsive fallback for the gap grid */
  if (window.innerWidth < 720) {
    document.querySelectorAll('.gap-item').forEach(function (el) {
      el.style.gridTemplateColumns = '1fr';
    });
  }
};

/* ---------- Training recommendations ---------- */
SN.PAGES['federation:training'] = function (main) {
  var list = SN.state.training;

  main.innerHTML =
    '<div class="page-head"><div><h2>' + SN.t('training') + '</h2>' +
    '<p class="ph-sub">Training programs recommended from live demand and skill gap data.</p></div></div>' +

    '<div class="grid grid-2 mb16">' +
      list.slice(0, 2).map(function (t) {
        return '<div class="card" style="border-left:3px solid var(--amber)">' +
          '<div class="badge badge-amber mb8">Recommended Training</div>' +
          '<h4>' + SN.esc(t.title) + '</h4>' +
          '<div class="bc-grid" style="border-top:0;padding-top:0;margin-top:10px">' +
            '<div class="bc-field"><div class="lbl">Demand</div><div class="val">' + SN.esc(t.demand) + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Available skilled</div><div class="val">' + t.available + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Estimated need</div><div class="val">' + t.needed + '</div></div>' +
            '<div class="bc-field"><div class="lbl">Duration</div><div class="val">' + SN.esc(t.duration) + '</div></div>' +
          '</div>' +
          '<div class="radius-note expanded mt12"><span class="dot dot-amber"></span> ' +
            'Recommendation: train <strong>' + t.recommend + '</strong> additional workers.</div>' +
          '<button class="btn btn-primary btn-sm mt12" data-train="' + t.id + '">Create Training Program</button>' +
        '</div>';
      }).join('') +
    '</div>' +

    '<div class="card">' +
      '<div class="card-head"><div class="card-title">All Recommendations</div>' +
      '<span class="badge badge-blue">' + list.length + ' programs</span></div>' +
      '<div class="table-wrap"><table class="tbl"><thead><tr>' +
        '<th>Program</th><th>Demand</th><th>Available</th><th>Needed</th><th>Recommend</th>' +
        '<th>Duration</th><th>Mode</th><th>Status</th><th></th>' +
        '</tr></thead><tbody>' +
        list.map(function (t) {
          return '<tr>' +
            '<td class="tbl-name">' + SN.esc(t.title) + '</td>' +
            '<td><span class="badge ' + (t.demand === 'High' ? 'badge-amber' : 'badge-grey') + '">' + SN.esc(t.demand) + '</span></td>' +
            '<td>' + t.available + '</td>' +
            '<td>' + t.needed + '</td>' +
            '<td><strong>' + t.recommend + '</strong></td>' +
            '<td>' + SN.esc(t.duration) + '</td>' +
            '<td>' + SN.esc(t.mode) + '</td>' +
            '<td><span class="badge ' + (t.status === 'Recommended' ? 'badge-amber' : 'badge-grey') + '">' + SN.esc(t.status) + '</span></td>' +
            '<td><button class="btn btn-ghost btn-sm" data-train="' + t.id + '">Create</button></td>' +
          '</tr>';
        }).join('') +
      '</tbody></table></div>' +
    '</div>';

  /* Future scope note */
  main.insertAdjacentHTML('beforeend',
    '<div class="card mt16">' +
      '<div class="card-head"><div class="card-title">Future Scope</div></div>' +
      '<div class="grid grid-3">' +
        '<div><div class="badge badge-grey mb8">Planned</div><p class="small mb0">Real backend, database and authentication.</p></div>' +
        '<div><div class="badge badge-grey mb8">Planned</div><p class="small mb0">Real GPS, live tracking and payment gateway.</p></div>' +
        '<div><div class="badge badge-grey mb8">Planned</div><p class="small mb0">AI/ML matching and government cooperative data integration.</p></div>' +
      '</div>' +
    '</div>');
};

document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-train]');
  if (!btn) return;
  e.preventDefault();
  var t = SN.state.training.filter(function (x) { return x.id === btn.dataset.train; })[0];
  if (!t) return;

  SN.modal({
    title: 'Create Training Program',
    sub: t.title,
    body:
      '<div class="bc-grid" style="border-top:0;padding-top:0">' +
        '<div class="bc-field"><div class="lbl">Demand</div><div class="val">' + SN.esc(t.demand) + '</div></div>' +
        '<div class="bc-field"><div class="lbl">Available skilled workers</div><div class="val">' + t.available + '</div></div>' +
        '<div class="bc-field"><div class="lbl">Estimated need</div><div class="val">' + t.needed + '</div></div>' +
        '<div class="bc-field"><div class="lbl">Recommended intake</div><div class="val">' + t.recommend + ' workers</div></div>' +
      '</div>' +
      '<hr class="divider">' +
      '<div class="form-row">' +
        '<div class="field"><label>Duration</label><input class="input" value="' + SN.esc(t.duration) + '"></div>' +
        '<div class="field"><label>Mode</label><input class="input" value="' + SN.esc(t.mode) + '"></div>' +
      '</div>' +
      '<div class="field mb0"><label>Target cooperative(s)</label>' +
      '<select class="select" multiple size="3">' +
        SN.DATA.cooperatives.map(function (c) { return '<option>' + SN.esc(c.name) + '</option>'; }).join('') +
      '</select></div>' +
      '<p class="tiny muted mt12 mb0">In production this would create a real training batch, notify cooperatives and track enrolment.</p>',
    actions: [
      { label:'Cancel', cls:'btn-ghost' },
      { label:'Create Program', cls:'btn-primary', onClick: function (close) {
          t.status = 'Scheduled';
          SN.addActivity('Training program created: ' + t.title + ' (' + t.recommend + ' workers)', 'success');
          SN.save();
          close();
          SN.modal({
            title: 'Training Program Created',
            body: '<div style="text-align:center"><div class="success-mark">✓</div>' +
              '<h3>' + SN.esc(t.title) + '</h3>' +
              '<p class="small muted">' + t.recommend + ' workers will be trained over ' + SN.esc(t.duration) + '.</p>' +
              '<span class="badge badge-green badge-lg">Status: Scheduled</span></div>',
            actions: [{ label:'Done', cls:'btn-primary', onClick: function (c) { c(); location.reload(); } }]
          });
        } }
    ]
  });
});