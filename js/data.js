/* ============================================================
   SahyogNET — data.js
   All mock/seed data. No backend. Everything here is sample data.
   ============================================================ */

window.SN = window.SN || {};

SN.DATA = {

  /* ---------------- Service categories ---------------- */
  services: [
    { key:'electrician', name:'Electrician',              icon:'⚡', demand:'High',   workers:184, avgPrice:'₹250–₹400' },
    { key:'plumber',     name:'Plumber',                  icon:'🚰', demand:'High',   workers:151, avgPrice:'₹200–₹350' },
    { key:'carpenter',   name:'Carpenter',                icon:'🪚', demand:'Medium', workers:118, avgPrice:'₹300–₹500' },
    { key:'ac',          name:'AC & Appliance Repair',    icon:'❄️', demand:'High',   workers:96,  avgPrice:'₹350–₹600' },
    { key:'mechanic',    name:'Mechanic',                 icon:'🔧', demand:'Medium', workers:132, avgPrice:'₹300–₹700' },
    { key:'painter',     name:'Painter',                  icon:'🎨', demand:'Low',    workers:87,  avgPrice:'₹18–₹30 /sqft' },
    { key:'tailor',      name:'Tailor',                   icon:'🧵', demand:'Medium', workers:104, avgPrice:'₹150–₹600' },
    { key:'mason',       name:'Mason',                    icon:'🧱', demand:'Low',    workers:73,  avgPrice:'₹400–₹800' },
    { key:'cleaning',    name:'Cleaning',                 icon:'🧹', demand:'Medium', workers:141, avgPrice:'₹300–₹900' },
    { key:'computer',    name:'Computer & Mobile Repair', icon:'💻', demand:'High',   workers:68,  avgPrice:'₹250–₹1,200' },
    { key:'solar',       name:'Solar Equipment Repair',   icon:'☀️', demand:'High',   workers:8,   avgPrice:'₹500–₹1,500' }
  ],

  /* ---------------- Workers ---------------- */
  /* distanceKm = mock distance from the demo customer's location (Gomti Nagar, Lucknow) */
  workers: [
    {
      id:'w1', name:'Rajesh Kumar', initials:'RK', trade:'Electrician', serviceKey:'electrician',
      altServices:['ac','computer'], zone:'Gomti Nagar', coop:'Sahyog Cooperative',
      rating:4.8, jobs:342, experience:7, distanceKm:1.8,
      priceMin:250, priceMax:400, available:true, verified:true, verifyLevel:'High',
      responseRate:96, completionRate:98, avgResponseMin:9,
      phone:'+91 98xxx 10231',
      skills:['Electrical Wiring','Fan Installation','Switchboard Repair','Appliance Repair'],
      pendingSkills:[],
      certificates:[
        { name:'ITI Electrician Certificate', issuer:'NCVT', year:2019 },
        { name:'Cooperative Skill Assessment — Level 2', issuer:'Sahyog Cooperative', year:2024 }
      ]
    },
    {
      id:'w2', name:'Sunil Yadav', initials:'SY', trade:'Plumber', serviceKey:'plumber',
      altServices:['mason'], zone:'Hazratganj', coop:'Sahyog Cooperative',
      rating:4.9, jobs:421, experience:9, distanceKm:2.4,
      priceMin:200, priceMax:350, available:true, verified:true, verifyLevel:'High',
      responseRate:94, completionRate:97, avgResponseMin:12,
      phone:'+91 98xxx 11442',
      skills:['Pipe Fitting','Leak Repair','Bathroom Fittings','Water Tank Cleaning'],
      pendingSkills:[],
      certificates:[{ name:'Plumbing Trade Certificate', issuer:'ITI Lucknow', year:2017 }]
    },
    {
      id:'w3', name:'Mohammad Arif', initials:'MA', trade:'AC & Appliance Technician', serviceKey:'ac',
      altServices:['electrician','computer'], zone:'Aliganj', coop:'Sahyog Cooperative',
      rating:4.7, jobs:218, experience:5, distanceKm:3.1,
      priceMin:350, priceMax:600, available:true, verified:true, verifyLevel:'High',
      responseRate:92, completionRate:95, avgResponseMin:14,
      phone:'+91 98xxx 12876',
      skills:['AC Service','AC Gas Refilling','Refrigerator Repair','Washing Machine Repair'],
      pendingSkills:['Inverter Repair'],
      certificates:[{ name:'Refrigeration & AC Technician', issuer:'NCVT', year:2021 }]
    },
    {
      id:'w4', name:'Priya Sharma', initials:'PS', trade:'Tailor', serviceKey:'tailor',
      altServices:[], zone:'Indira Nagar', coop:'Sahyog Cooperative',
      rating:4.8, jobs:287, experience:6, distanceKm:2.9,
      priceMin:150, priceMax:600, available:false, verified:true, verifyLevel:'High',
      responseRate:90, completionRate:96, avgResponseMin:22,
      phone:'+91 98xxx 13090',
      skills:['Blouse Stitching','Alteration','Suit Stitching','Embroidery'],
      pendingSkills:[],
      certificates:[{ name:'Garment Construction — Level 2', issuer:'Sahyog Cooperative', year:2023 }]
    },
    {
      id:'w5', name:'Amit Verma', initials:'AV', trade:'Carpenter', serviceKey:'carpenter',
      altServices:['mason'], zone:'Gomti Nagar', coop:'Sahyog Cooperative',
      rating:4.7, jobs:301, experience:8, distanceKm:2.2,
      priceMin:300, priceMax:500, available:true, verified:true, verifyLevel:'High',
      responseRate:93, completionRate:96, avgResponseMin:15,
      phone:'+91 98xxx 14755',
      skills:['Furniture Repair','Door Fitting','Modular Kitchen','Wood Polishing'],
      pendingSkills:[],
      certificates:[{ name:'Carpentry Trade Certificate', issuer:'ITI Lucknow', year:2018 }]
    },
    {
      id:'w6', name:'Suresh Yadav', initials:'SUY', trade:'Electrician', serviceKey:'electrician',
      altServices:['solar'], zone:'Alambagh', coop:'Sahyog Cooperative',
      rating:4.6, jobs:196, experience:6, distanceKm:3.7,
      priceMin:250, priceMax:420, available:true, verified:true, verifyLevel:'Medium',
      responseRate:88, completionRate:93, avgResponseMin:18,
      phone:'+91 98xxx 15210',
      skills:['Electrical Wiring','Inverter Installation','Fan Installation'],
      pendingSkills:['Solar Panel Wiring'],
      certificates:[]
    },
    {
      id:'w7', name:'Ramesh Kumar', initials:'RM', trade:'Electrician', serviceKey:'electrician',
      altServices:['ac'], zone:'Chinhat', coop:'Sahyog Cooperative',
      rating:4.4, jobs:121, experience:6, distanceKm:4.2,
      priceMin:240, priceMax:400, available:true, verified:false, verifyLevel:'Pending',
      responseRate:80, completionRate:89, avgResponseMin:26,
      phone:'+91 98xxx 16633',
      skills:['Electrical Wiring','Appliance Repair'],
      pendingSkills:['Electrical Wiring','Appliance Repair'],
      certificates:[{ name:'ITI Electrician (uploaded)', issuer:'NCVT', year:2019 }]
    },
    {
      id:'w8', name:'Deepak Singh', initials:'DS', trade:'Solar Equipment Repair', serviceKey:'solar',
      altServices:['electrician'], zone:'Varanasi', coop:'Kashi Cooperative',
      rating:4.5, jobs:64, experience:4, distanceKm:5.6,
      priceMin:500, priceMax:1500, available:true, verified:true, verifyLevel:'Medium',
      responseRate:84, completionRate:91, avgResponseMin:29,
      phone:'+91 98xxx 17011',
      skills:['Solar Panel Wiring','Inverter Repair','Battery Maintenance'],
      pendingSkills:[],
      certificates:[{ name:'Solar PV Installer — Suryamitra', issuer:'NISE', year:2022 }]
    },
    {
      id:'w9', name:'Anil Prajapati', initials:'AP', trade:'Painter', serviceKey:'painter',
      altServices:['mason'], zone:'Rajajipuram', coop:'Sahyog Cooperative',
      rating:4.6, jobs:178, experience:10, distanceKm:4.6,
      priceMin:18, priceMax:30, available:false, verified:true, verifyLevel:'High',
      responseRate:86, completionRate:94, avgResponseMin:24,
      phone:'+91 98xxx 18422',
      skills:['Interior Painting','Exterior Painting','Putty & Primer','Texture Finish'],
      pendingSkills:[],
      certificates:[]
    },
    {
      id:'w10', name:'Farhan Ali', initials:'FA', trade:'Computer & Mobile Repair', serviceKey:'computer',
      altServices:['ac'], zone:'Gomti Nagar', coop:'Sahyog Cooperative',
      rating:4.7, jobs:209, experience:5, distanceKm:1.4,
      priceMin:250, priceMax:1200, available:true, verified:true, verifyLevel:'High',
      responseRate:95, completionRate:96, avgResponseMin:11,
      phone:'+91 98xxx 19544',
      skills:['Laptop Repair','Mobile Screen Replacement','Software Installation','Data Recovery'],
      pendingSkills:[],
      certificates:[{ name:'Computer Hardware & Networking', issuer:'NIELIT', year:2020 }]
    },
    {
      id:'w11', name:'Kavita Devi', initials:'KD', trade:'Cleaning', serviceKey:'cleaning',
      altServices:[], zone:'Indira Nagar', coop:'Sahyog Cooperative',
      rating:4.9, jobs:312, experience:7, distanceKm:2.6,
      priceMin:300, priceMax:900, available:true, verified:true, verifyLevel:'High',
      responseRate:97, completionRate:99, avgResponseMin:8,
      phone:'+91 98xxx 20311',
      skills:['Deep Cleaning','Kitchen Cleaning','Sofa Shampooing','Bathroom Sanitisation'],
      pendingSkills:[],
      certificates:[{ name:'Professional Housekeeping', issuer:'Sahyog Cooperative', year:2023 }]
    },
    {
      id:'w12', name:'Vikas Chauhan', initials:'VC', trade:'Mechanic', serviceKey:'mechanic',
      altServices:['electrician'], zone:'Alambagh', coop:'Sahyog Cooperative',
      rating:4.5, jobs:243, experience:11, distanceKm:4.9,
      priceMin:300, priceMax:700, available:true, verified:true, verifyLevel:'Medium',
      responseRate:82, completionRate:92, avgResponseMin:27,
      phone:'+91 98xxx 21455',
      skills:['Two-Wheeler Repair','Car Servicing','Battery Replacement','Brake Repair'],
      pendingSkills:[],
      certificates:[]
    }
  ],

  /* ---------------- Customers ---------------- */
  customers: [
    { id:'c1', name:'Aman Sharma',   initials:'AS', phone:'+91 90xxx 22110', zone:'Gomti Nagar',  bookings:7,  status:'Active',   recentService:'Electrician',  complaints:0, since:'2024' },
    { id:'c2', name:'Neha Gupta',    initials:'NG', phone:'+91 90xxx 23344', zone:'Hazratganj',   bookings:12, status:'Active',   recentService:'Cleaning',     complaints:1, since:'2023' },
    { id:'c3', name:'Rohit Mishra',  initials:'RM', phone:'+91 90xxx 24566', zone:'Indira Nagar', bookings:4,  status:'Active',   recentService:'Plumber',      complaints:0, since:'2025' },
    { id:'c4', name:'Farida Khan',   initials:'FK', phone:'+91 90xxx 25788', zone:'Aliganj',      bookings:9,  status:'Active',   recentService:'AC Repair',    complaints:1, since:'2024' },
    { id:'c5', name:'Sandeep Rawat', initials:'SR', phone:'+91 90xxx 26900', zone:'Chinhat',      bookings:2,  status:'Inactive', recentService:'Carpenter',    complaints:0, since:'2025' },
    { id:'c6', name:'Pooja Tiwari',  initials:'PT', phone:'+91 90xxx 27112', zone:'Alambagh',     bookings:15, status:'Active',   recentService:'Tailor',       complaints:0, since:'2022' }
  ],

  /* ---------------- Bookings ----------------
     status: Request Sent | Accepted | On The Way | Arrived | In Progress | Completed | Cancelled
  -------------------------------------------- */
  bookings: [
    {
      id:'BK1001', customerId:'c1', customerName:'Aman Sharma', customerZone:'Gomti Nagar',
      workerId:'w2', workerName:'Sunil Yadav', workerTrade:'Plumber',
      service:'Pipe Leak Repair', serviceKey:'plumber',
      date:'2026-03-14', time:'11:00 AM', address:'C-42, Gomti Nagar, Lucknow',
      description:'Kitchen sink pipe leaking since yesterday.',
      priceMin:200, priceMax:350, status:'Completed', urgent:false,
      createdAt:'2026-03-13T09:20:00', completedAt:'2026-03-14T12:10:00',
      payment:{ method:'UPI', txnId:'TXN8842110', amount:280, at:'2026-03-14T12:20:00' },
      rating:{ stars:5, quality:5, professionalism:5, timeliness:4, at:'2026-03-14T12:30:00' }
    },
    {
      id:'BK1002', customerId:'c1', customerName:'Aman Sharma', customerZone:'Gomti Nagar',
      workerId:'w5', workerName:'Amit Verma', workerTrade:'Carpenter',
      service:'Door Fitting', serviceKey:'carpenter',
      date:'2026-03-20', time:'04:00 PM', address:'C-42, Gomti Nagar, Lucknow',
      description:'Main door hinge replacement and alignment.',
      priceMin:300, priceMax:500, status:'Completed', urgent:false,
      createdAt:'2026-03-18T14:05:00', completedAt:'2026-03-20T18:30:00',
      payment:{ method:'Cooperative Wallet', txnId:'TXN8851902', amount:420, at:'2026-03-20T18:40:00' },
      rating:{ stars:4, quality:4, professionalism:5, timeliness:4, at:'2026-03-20T19:00:00' }
    },
    {
      id:'BK1003', customerId:'c1', customerName:'Aman Sharma', customerZone:'Gomti Nagar',
      workerId:'w4', workerName:'Priya Sharma', workerTrade:'Tailor',
      service:'Blouse Stitching', serviceKey:'tailor',
      date:'2026-02-28', time:'01:00 PM', address:'C-42, Gomti Nagar, Lucknow',
      description:'Two blouses, measurements shared.',
      priceMin:400, priceMax:600, status:'Cancelled', urgent:false,
      createdAt:'2026-02-26T10:00:00', completedAt:null,
      payment:null, rating:null, cancelReason:'Customer rescheduled'
    },
    {
      id:'BK1004', customerId:'c2', customerName:'Neha Gupta', customerZone:'Hazratganj',
      workerId:'w11', workerName:'Kavita Devi', workerTrade:'Cleaning',
      service:'Deep Home Cleaning', serviceKey:'cleaning',
      date:'2026-03-22', time:'09:00 AM', address:'12, Hazratganj, Lucknow',
      description:'3BHK full deep cleaning before Holi.',
      priceMin:700, priceMax:900, status:'In Progress', urgent:false,
      createdAt:'2026-03-20T08:00:00',
      payment:null, rating:null
    },
    {
      id:'BK1005', customerId:'c4', customerName:'Farida Khan', customerZone:'Aliganj',
      workerId:'w3', workerName:'Mohammad Arif', workerTrade:'AC & Appliance Technician',
      service:'AC Gas Refilling', serviceKey:'ac',
      date:'2026-03-23', time:'02:30 PM', address:'8/21, Aliganj, Lucknow',
      description:'Split AC not cooling, needs gas top-up.',
      priceMin:450, priceMax:600, status:'Accepted', urgent:false,
      createdAt:'2026-03-22T17:40:00',
      payment:null, rating:null
    },
    {
      id:'BK1006', customerId:'c3', customerName:'Rohit Mishra', customerZone:'Indira Nagar',
      workerId:'w1', workerName:'Rajesh Kumar', workerTrade:'Electrician',
      service:'Switchboard Repair', serviceKey:'electrician',
      date:'2026-03-24', time:'10:30 AM', address:'B-7, Indira Nagar, Lucknow',
      description:'Bedroom switchboard sparking.',
      priceMin:250, priceMax:400, status:'Request Sent', urgent:true,
      createdAt:'2026-03-23T19:05:00',
      payment:null, rating:null
    }
  ],

  /* ---------------- Notifications ---------------- */
  notifications: [
    { id:'n1', role:'customer', type:'success', title:'Rajesh accepted your booking.', body:'Your electrician will reach by 10:30 AM.', time:'2026-03-23T19:12:00', read:false },
    { id:'n2', role:'customer', type:'info',    title:'Worker is on the way.',          body:'Live tracking is available on the booking page.', time:'2026-03-22T17:55:00', read:false },
    { id:'n3', role:'customer', type:'warn',    title:'Worker has not responded.',     body:'We found alternative verified workers nearby.',  time:'2026-03-21T15:30:00', read:false },
    { id:'n4', role:'customer', type:'success', title:'Service completed.',            body:'Please rate Sunil Yadav for BK1001.',            time:'2026-03-14T12:10:00', read:true  },
    { id:'n5', role:'customer', type:'success', title:'Payment successful.',           body:'₹280 paid via UPI. Txn TXN8842110.',             time:'2026-03-14T12:20:00', read:true  },
    { id:'n6', role:'customer', type:'info',    title:'New worker recommendation available.', body:'Farhan Ali (97% match) is now available near you.', time:'2026-03-23T08:00:00', read:true },
    { id:'n7', role:'worker',   type:'info',    title:'New service request received.', body:'Switchboard Repair · 2.1 km · ₹300 estimated.',  time:'2026-03-23T19:05:00', read:false },
    { id:'n8', role:'worker',   type:'success', title:'Payment settled to your wallet.', body:'₹420 credited for BK1002.',                    time:'2026-03-20T18:45:00', read:true  }
  ],

  /* ---------------- Complaints ---------------- */
  complaints: [
    { id:'CP201', customerName:'Neha Gupta',   workerName:'Anil Prajapati', category:'Poor quality',      bookingId:'BK0987', detail:'Paint finish uneven on two walls.',           status:'Open',     date:'2026-03-21', zone:'Hazratganj' },
    { id:'CP202', customerName:'Farida Khan',  workerName:'Vikas Chauhan',  category:"Worker didn't arrive", bookingId:'BK0975', detail:'No show, no call for scheduled service.',   status:'Open',     date:'2026-03-19', zone:'Aliganj' },
    { id:'CP203', customerName:'Pooja Tiwari', workerName:'Suresh Yadav',   category:'Incorrect pricing', bookingId:'BK0961', detail:'Charged ₹500 against estimate of ₹350.',      status:'Resolved', date:'2026-03-15', zone:'Alambagh' },
    { id:'CP204', customerName:'Rohit Mishra', workerName:'Deepak Singh',   category:'Other',             bookingId:'BK0940', detail:'Requested invoice copy, not received.',       status:'Resolved', date:'2026-03-10', zone:'Indira Nagar' }
  ],

  /* ---------------- Pending verifications ---------------- */
  verifications: [
    { id:'v1', workerId:'w7', name:'Ramesh Kumar', trade:'Electrician', experience:6, zone:'Chinhat',
      coop:'Sahyog Cooperative', submitted:'2026-03-21',
      skillsPending:['Electrical Wiring','Appliance Repair'],
      docs:['Aadhaar (verified)','ITI Electrician Certificate','Cooperative membership form'],
      status:'Pending' },
    { id:'v2', workerId:'w3', name:'Mohammad Arif', trade:'AC & Appliance Technician', experience:5, zone:'Aliganj',
      coop:'Sahyog Cooperative', submitted:'2026-03-22',
      skillsPending:['Inverter Repair'],
      docs:['Aadhaar (verified)','Refrigeration & AC Certificate','Skill demo video'],
      status:'Pending' },
    { id:'v3', workerId:'w6', name:'Suresh Yadav', trade:'Electrician', experience:6, zone:'Alambagh',
      coop:'Sahyog Cooperative', submitted:'2026-03-20',
      skillsPending:['Solar Panel Wiring'],
      docs:['Aadhaar (verified)','Cooperative skill assessment'],
      status:'Pending' },
    { id:'v4', workerId:'w9', name:'Anil Prajapati', trade:'Painter', experience:10, zone:'Rajajipuram',
      coop:'Sahyog Cooperative', submitted:'2026-03-18',
      skillsPending:['Texture Finish'],
      docs:['Aadhaar (verified)','Work sample photos'],
      status:'Approved' }
  ],

  /* ---------------- Cooperatives (federation view) ---------------- */
  cooperatives: [
    { id:'coop1', name:'Sahyog Cooperative',      region:'Lucknow',   workers:284, jobs:3120, rating:4.8, growth:'+18%', revenue:842000, customers:2140, status:'Active' },
    { id:'coop2', name:'Kashi Service Cooperative', region:'Varanasi', workers:196, jobs:2240, rating:4.7, growth:'+14%', revenue:596000, customers:1580, status:'Active' },
    { id:'coop3', name:'Azamgarh Kaushal Sangh',  region:'Azamgarh',  workers:142, jobs:1480, rating:4.5, growth:'+9%',  revenue:361000, customers:990,  status:'Active' },
    { id:'coop4', name:'Jaunpur Seva Sahkari',    region:'Jaunpur',   workers:118, jobs:1120, rating:4.4, growth:'+6%',  revenue:274000, customers:760,  status:'Active' },
    { id:'coop5', name:'Prayagraj Shramik Cooperative', region:'Prayagraj', workers:167, jobs:1890, rating:4.6, growth:'+12%', revenue:468000, customers:1310, status:'Active' },
    { id:'coop6', name:'Gorakhpur Karigar Mandal', region:'Gorakhpur', workers:96,  jobs:820,  rating:4.2, growth:'+3%',  revenue:189000, customers:540,  status:'Watch'  }
  ],

  /* ---------------- Demand heatmap zones ---------------- */
  zones: [
    { id:'z1', name:'Zone A — Gomti Nagar',  trade:'Electrical', demand:'High',     level:'high',  workers:18, requests:64, avgResponse:9,  topService:'Electrician' },
    { id:'z2', name:'Zone B — Hazratganj',   trade:'Plumbing',   demand:'Medium',   level:'medium',workers:11, requests:38, avgResponse:14, topService:'Plumber' },
    { id:'z3', name:'Zone C — Aliganj',      trade:'AC Repair',  demand:'Very High',level:'vhigh', workers:9,  requests:82, avgResponse:17, topService:'AC & Appliance Repair' },
    { id:'z4', name:'Zone D — Indira Nagar', trade:'Cleaning',   demand:'Low',      level:'low',   workers:22, requests:16, avgResponse:8,  topService:'Cleaning' },
    { id:'z5', name:'Zone E — Alambagh',     trade:'Carpentry',  demand:'Medium',   level:'medium',workers:13, requests:41, avgResponse:16, topService:'Carpenter' },
    { id:'z6', name:'Zone F — Chinhat',      trade:'Solar Repair',demand:'High',    level:'high',  workers:4,  requests:57, avgResponse:31, topService:'Solar Equipment Repair' }
  ],

  /* ---------------- Skill gap analysis ---------------- */
  skillGaps: [
    { service:'Solar Equipment Repair', key:'solar',     demand:'High',   demandPct:92, workersAvail:8,  workersNeed:25, level:'Gap'      },
    { service:'AC & Appliance Repair',  key:'ac',        demand:'High',   demandPct:88, workersAvail:96, workersNeed:130,level:'Watch'    },
    { service:'Computer & Mobile Repair',key:'computer', demand:'High',   demandPct:81, workersAvail:68, workersNeed:95, level:'Watch'    },
    { service:'Electrician',            key:'electrician',demand:'High',  demandPct:86, workersAvail:184,workersNeed:190,level:'Balanced' },
    { service:'Plumbing',               key:'plumber',   demand:'Medium', demandPct:64, workersAvail:151,workersNeed:150,level:'Balanced' },
    { service:'Carpentry',              key:'carpenter', demand:'Medium', demandPct:58, workersAvail:118,workersNeed:115,level:'Balanced' },
    { service:'Painting',               key:'painter',   demand:'Low',    demandPct:34, workersAvail:87, workersNeed:70, level:'Surplus'  }
  ],

  /* ---------------- Training recommendations ---------------- */
  training: [
    { id:'TR1', title:'Solar Equipment Repair',     demand:'High',   available:8,  needed:25, recommend:15, duration:'6 weeks', mode:'Cooperative centre + field', status:'Recommended' },
    { id:'TR2', title:'AC & Appliance Repair',      demand:'High',   available:96, needed:130,recommend:34, duration:'4 weeks', mode:'ITI partnership',            status:'Recommended' },
    { id:'TR3', title:'Computer & Mobile Repair',   demand:'High',   available:68, needed:95, recommend:27, duration:'5 weeks', mode:'Online + lab',               status:'Recommended' },
    { id:'TR4', title:'Advanced Electrical Wiring', demand:'Medium', available:184,needed:190,recommend:6,  duration:'2 weeks', mode:'Cooperative centre',         status:'Optional'    }
  ],

  /* ---------------- Regional demand (federation) ---------------- */
  regionalDemand: [
    { service:'Electrician',            pct:28, trend:'up'   },
    { service:'Plumbing',               pct:21, trend:'up'   },
    { service:'AC Repair',              pct:17, trend:'up'   },
    { service:'Carpenter',              pct:13, trend:'flat' },
    { service:'Mechanic',               pct:11, trend:'down' },
    { service:'Solar Equipment Repair', pct:6,  trend:'up'   },
    { service:'Others',                 pct:4,  trend:'flat' }
  ],

  /* ---------------- Analytics series ---------------- */
  jobsSeries: [
    { label:'Mon', jobs:42, revenue:11800 },
    { label:'Tue', jobs:56, revenue:15200 },
    { label:'Wed', jobs:48, revenue:13400 },
    { label:'Thu', jobs:67, revenue:18900 },
    { label:'Fri', jobs:74, revenue:21200 },
    { label:'Sat', jobs:88, revenue:25600 },
    { label:'Sun', jobs:39, revenue:10400 }
  ],

  monthlyEarnings: [
    { label:'Oct', value:28400 },
    { label:'Nov', value:31200 },
    { label:'Dec', value:35600 },
    { label:'Jan', value:29800 },
    { label:'Feb', value:33400 },
    { label:'Mar', value:18700 }
  ],

  workerActivity: [
    { label:'Rajesh Kumar',     jobs:28 },
    { label:'Sunil Yadav',      jobs:34 },
    { label:'Mohammad Arif',    jobs:22 },
    { label:'Kavita Devi',      jobs:31 },
    { label:'Amit Verma',       jobs:19 },
    { label:'Farhan Ali',       jobs:24 }
  ],

  /* ---------------- Recent activity feed (admin) ---------------- */
  activities: [
    { id:'a1', text:'Rajesh Kumar accepted booking BK1006',      time:'2026-03-23T19:12:00', type:'info' },
    { id:'a2', text:'Kavita Devi started service for BK1004',    time:'2026-03-22T09:05:00', type:'success' },
    { id:'a3', text:'Ramesh Kumar submitted verification request',time:'2026-03-21T11:40:00', type:'warn' },
    { id:'a4', text:'Complaint CP201 filed against Anil Prajapati',time:'2026-03-21T16:20:00', type:'error' },
    { id:'a5', text:'Mohammad Arif completed AC Gas Refilling',  time:'2026-03-20T15:50:00', type:'success' },
    { id:'a6', text:'New worker Farhan Ali onboarded',           time:'2026-03-19T10:10:00', type:'info' }
  ],

  /* ---------------- Ratings breakdown (worker profile) ---------------- */
  ratingBreakdown: [
    { label:'5 star', pct:72 },
    { label:'4 star', pct:21 },
    { label:'3 star', pct:5  },
    { label:'2 star', pct:1  },
    { label:'1 star', pct:1  }
  ]
};