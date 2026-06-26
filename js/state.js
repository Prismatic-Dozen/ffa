// --- Central State Database Seeding ---

const BASELINE_FREQUENCIES = [
  { id: 'freq_1', name: 'One Time', desc: 'Single usage, updated progressively over multiple times (e.g., HOTO)', code: 'one_time' },
  { id: 'freq_2', name: 'Specific Day', desc: 'Assigned on specific scheduled dates', code: 'specific_day' },
  { id: 'freq_3', name: 'Daily', desc: 'Every single day including weekends', code: 'daily' },
  { id: 'freq_4', name: 'Weekly', desc: 'Every calendar week', code: 'weekly' },
  { id: 'freq_5', name: 'Monthly', desc: 'Once a month schedule', code: 'monthly' },
  { id: 'freq_6', name: 'Half Yearly', desc: 'Twice a year schedule', code: 'half_yearly' },
  { id: 'freq_7', name: 'Yearly', desc: 'Once a year compliance checklist', code: 'yearly' }
];

const BASELINE_ESCALATIONS = [
  { id: 'esc_1', name: 'Level 1 - Compliance Alert', role: 'Testing Head', threshold: 12, unit: 'Hours', email: true, sms: false, app: true },
  { id: 'esc_2', name: 'Level 2 - Supervisor Notice', role: 'Site Head', threshold: 24, unit: 'Hours', email: true, sms: true, app: true },
  { id: 'esc_3', name: 'Level 3 - Regional Notice', role: 'Zonal Head', threshold: 48, unit: 'Hours', email: true, sms: true, app: true },
  { id: 'esc_4', name: 'Level 4 - Executive Escalation', role: 'O&M Head', threshold: 72, unit: 'Hours', email: true, sms: true, app: true }
];

// Seeding 6 comprehensive Master Checklist templates matching Annexure-A
const BASELINE_MASTER_CHECKLISTS = [
  {
    id: 'ch_master_1',
    name: 'Plant Round Checklist - ICR & Modules',
    desc: 'Daily rounds covering Inverter Control Rooms (ICR) and solar module parameters.',
    freqId: 'freq_3', // Daily
    adoptName: true,
    namingRule: '{{block}}-{{equipment}}-{{index}}',
    equipmentCategory: 'Inverter',
    rating: '2.5 MW',
    checkpoints: [
      { id: 'cp_1_1', location: 'ICR Cabin', text: 'Cabin ambient temperature', type: 'numeric', rangeMin: 15, rangeMax: 50, threshold: 45, unit: '°C', category: 'High', photoMandatory: false, alertRole: 'Site Head', resolveTime: '12 Hours' },
      { id: 'cp_1_2', location: 'ICR Panel', text: 'Busbar joint overheating or discoloration', type: 'radio', category: 'Critical', photoMandatory: true, alertRole: 'Testing Head', resolveTime: '4 Hours' },
      { id: 'cp_1_3', location: 'Solar Block', text: 'Module string voltage checking', type: 'numeric', rangeMin: 600, rangeMax: 1500, threshold: 1200, unit: 'V', category: 'Medium', photoMandatory: false, alertRole: 'Site Head', resolveTime: '24 Hours' }
    ]
  },
  {
    id: 'ch_master_2',
    name: 'HOTO (Handover Takeover) Audit',
    desc: 'Progressive sign-off checklist mapping commission checkpoints to operational compliance.',
    freqId: 'freq_1', // One Time
    adoptName: true,
    namingRule: '{{site}}-HOTO-{{index}}',
    equipmentCategory: 'Switchyard',
    rating: '220 KV',
    checkpoints: [
      { id: 'cp_2_1', location: 'Control Room', text: 'SCADA integration and telemetry active', type: 'radio', category: 'Critical', photoMandatory: false, alertRole: 'Zonal Head', resolveTime: '48 Hours' },
      { id: 'cp_2_2', location: 'Battery Room', text: 'Battery bank backup load discharge test duration', type: 'numeric', rangeMin: 2, rangeMax: 12, threshold: 8, unit: 'Hours', category: 'High', photoMandatory: true, alertRole: 'Testing Head', resolveTime: '24 Hours' },
      { id: 'cp_2_3', location: 'Aux Room', text: 'Fire suppression system hydro-test clearance', type: 'radio', category: 'Critical', photoMandatory: true, alertRole: 'O&M Head', resolveTime: '72 Hours' }
    ]
  },
  {
    id: 'ch_master_3',
    name: 'SCADA & CCRA System Health Check',
    desc: 'Weekly system checks for control system connectivity, logging, and communications.',
    freqId: 'freq_4', // Weekly
    adoptName: false,
    namingRule: '',
    equipmentCategory: 'MCR',
    rating: 'SCADA V2',
    checkpoints: [
      { id: 'cp_3_1', location: 'Server Rack', text: 'Communication ping drop rate', type: 'numeric', rangeMin: 0, rangeMax: 5, threshold: 2, unit: '%', category: 'High', photoMandatory: false, alertRole: 'Site Head', resolveTime: '12 Hours' },
      { id: 'cp_3_2', location: 'Console Desk', text: 'CCRA redundant power supply status', type: 'radio', category: 'Critical', photoMandatory: false, alertRole: 'Zonal Head', resolveTime: '24 Hours' }
    ]
  },
  {
    id: 'ch_master_4',
    name: 'CCTV Safety & Security Inspection',
    desc: 'Monthly camera feed, alignment, safety checks, and hard-drive recording checks.',
    freqId: 'freq_5', // Monthly
    adoptName: true,
    namingRule: '{{site}}-CCTV-{{index}}',
    equipmentCategory: 'CCTV',
    rating: 'IP66 4K',
    checkpoints: [
      { id: 'cp_4_1', location: 'Perimeter Pole', text: 'Camera angle alignment and visibility', type: 'radio', category: 'Medium', photoMandatory: false, alertRole: 'Site Head', resolveTime: '48 Hours' },
      { id: 'cp_4_2', location: 'NVR Rack', text: 'NVR disk storage remaining space', type: 'numeric', rangeMin: 10, rangeMax: 100, threshold: 15, unit: '%', category: 'High', photoMandatory: true, alertRole: 'Zonal Head', resolveTime: '3 Days' }
    ]
  },
  {
    id: 'ch_master_5',
    name: 'Digitized Readings - Earth Resistance',
    desc: 'Half Yearly grounding grid measurements across switchyard and inverter blocks.',
    freqId: 'freq_6', // Half Yearly
    adoptName: true,
    namingRule: '{{block}}-EARTH-{{index}}',
    equipmentCategory: 'IDT',
    rating: 'Neutral Ground',
    checkpoints: [
      { id: 'cp_5_1', location: 'Earth Pit', text: 'Ground grid resistance value', type: 'numeric', rangeMin: 0.1, rangeMax: 5, threshold: 2, unit: 'Ω', category: 'Critical', photoMandatory: true, alertRole: 'Testing Head', resolveTime: '2 Days' }
    ]
  },
  {
    id: 'ch_master_6',
    name: 'Cybersecurity Compliance Checklist',
    desc: 'Quarterly review of software patches, router configurations, and server login auditing.',
    freqId: 'freq_5', // Monthly (acting as quarterly scheduler)
    adoptName: false,
    namingRule: '',
    equipmentCategory: 'MCR',
    rating: 'Network',
    checkpoints: [
      { id: 'cp_6_1', location: 'Firewall', text: 'Unused network ports closed and locked', type: 'radio', category: 'Critical', photoMandatory: true, alertRole: 'O&M Head', resolveTime: '1 Day' },
      { id: 'cp_6_2', location: 'Admin Server', text: 'Failed administrative login count last week', type: 'numeric', rangeMin: 0, rangeMax: 50, threshold: 5, unit: 'count', category: 'High', photoMandatory: false, alertRole: 'Zonal Head', resolveTime: '12 Hours' }
    ]
  }
];

// Seeding default active Sites with coordinates and key equipments specs (4.3)
const BASELINE_SITES = [
  {
    id: 'site_1',
    name: 'Rajasthan Solar Plant',
    acCapacity: 130,
    dcCapacity: 150,
    state: 'Rajasthan',
    village: 'Bhadla',
    zone: 'West',
    geoLatitude: 27.532,
    geoLongitude: 71.915,
    siteHead: 'Rajesh Sharma',
    siteHeadEmail: 'rajesh.sharma@cleanenergy.com',
    siteHeadMobile: '+919876543210',
    zonalHead: 'Vikram Singh',
    zonalHeadEmail: 'vikram.singh@cleanenergy.com',
    zonalHeadMobile: '+919988776655',
    team: [
      { name: 'Amit Patel', email: 'amit.patel@cleanenergy.com', mobile: '+919000011111', role: 'Field Technician' },
      { name: 'Ravi Kumar', email: 'ravi.kumar@cleanenergy.com', mobile: '+919000022222', role: 'Field Technician' }
    ],
    equipments: [
      { name: 'ICR1-INV-1', make: 'ABB', rating: '2.5 MW', latitude: 27.5322, longitude: 71.9155, category: 'Inverter' },
      { name: 'ICR1-INV-2', make: 'ABB', rating: '2.5 MW', latitude: 27.5324, longitude: 71.9158, category: 'Inverter' },
      { name: 'TR-1', make: 'Siemens', rating: '120 MVA', latitude: 27.5330, longitude: 71.9160, category: 'Transformer' }
    ],
    adoptedChecklists: [
      {
        id: 'adopt_1_1',
        masterId: 'ch_master_1',
        name: 'ICR1-INV-1 (Plant Round Checklist)',
        equipmentName: 'ICR1-INV-1',
        freqName: 'Daily',
        checkpoints: [
          { id: 'cp_1_1', location: 'ICR Cabin', text: 'Cabin ambient temperature', type: 'numeric', rangeMin: 15, rangeMax: 50, threshold: 45, unit: '°C', category: 'High', photoMandatory: false, alertRole: 'Site Head', resolveTime: '12 Hours' },
          { id: 'cp_1_2', location: 'ICR Panel', text: 'Busbar joint overheating or discoloration', type: 'radio', category: 'Critical', photoMandatory: true, alertRole: 'Testing Head', resolveTime: '4 Hours' },
          { id: 'cp_1_3', location: 'Solar Block', text: 'Module string voltage checking', type: 'numeric', rangeMin: 600, rangeMax: 1500, threshold: 1200, unit: 'V', category: 'Medium', photoMandatory: false, alertRole: 'Site Head', resolveTime: '24 Hours' }
        ]
      }
    ]
  },
  {
    id: 'site_2',
    name: 'Gujarat Wind Farm',
    acCapacity: 50,
    dcCapacity: 50,
    state: 'Gujarat',
    village: 'Kutch',
    zone: 'West',
    geoLatitude: 23.250,
    geoLongitude: 69.660,
    siteHead: 'Sanjay Mehta',
    siteHeadEmail: 'sanjay.mehta@cleanenergy.com',
    siteHeadMobile: '+919765432109',
    zonalHead: 'Vikram Singh',
    zonalHeadEmail: 'vikram.singh@cleanenergy.com',
    zonalHeadMobile: '+919988776655',
    team: [
      { name: 'Suresh G.', email: 'suresh.g@cleanenergy.com', mobile: '+919000033333', role: 'Field Technician' }
    ],
    equipments: [
      { name: 'WTG-A1', make: 'Vestas', rating: '2.1 MW', latitude: 23.2510, longitude: 69.6610, category: 'Turbine' },
      { name: 'Switchyard-Breaker-1', make: 'Siemens', rating: '33 KV', latitude: 23.2530, longitude: 69.6620, category: 'Breaker' }
    ],
    adoptedChecklists: []
  }
];

// Seeding default active User Permissions matrix (4.5.o)
const DEFAULT_PERMISSIONS = [
  { role: 'Field Technician', view: true, edit: false, create: false, delete: false, adopt: false, override: false },
  { role: 'Site Head', view: true, edit: true, create: false, delete: false, adopt: true, override: false },
  { role: 'Zonal Head', view: true, edit: true, create: true, delete: false, adopt: true, override: true },
  { role: 'Chief - O&M', view: true, edit: true, create: true, delete: true, adopt: true, override: true },
  { role: 'System Administrator', view: true, edit: true, create: true, delete: true, adopt: true, override: true }
];

// Preseeding a few actions tickets for compliance dashboard trend
const DEFAULT_TICKETS = [
  { id: 't_1', siteId: 'site_1', checklistId: 'ch_master_1', checkpointId: 'cp_1_2', checkpointText: 'Busbar joint overheating or discoloration', remark: 'Severe hot spot found on terminal L2', category: 'Critical', assignedTo: 'Rajesh Sharma', date: '2026-06-20', status: 'Closed', rating: 'Critical', actionTaken: 'Tightened bolt contacts and reapplied thermal conducting compound. Re-scanned and confirmed normal.' },
  { id: 't_2', siteId: 'site_1', checklistId: 'ch_master_1', checkpointId: 'cp_1_1', checkpointText: 'Cabin ambient temperature', remark: 'Reading of 47 °C is above threshold (45)', category: 'High', assignedTo: 'Amit Patel', date: '2026-06-24', status: 'Open', rating: 'High', actionTaken: '' }
];

// Activity comments logs (4.5.j)
const DEFAULT_COMMENTS = [
  { id: 'c_1', siteName: 'Rajasthan Solar Plant', checklistName: 'ICR1-INV-1 (Daily)', userName: 'Rajesh Sharma', comment: 'Completed ICR cabin inspection. All ventilation system fans operational.', timestamp: '2026-06-25 10:14' },
  { id: 'c_2', siteName: 'Gujarat Wind Farm', checklistName: 'WTG-A1 Monthly Safety', userName: 'Sanjay Mehta', comment: 'Adopted checklist from Master Library. Threshold alert for temperature set to 60°C.', timestamp: '2026-06-24 16:45' }
];

// Naming preview mapping helper
const DUMMY_PREVIEW_SITE = {
  block: 'Block1',
  equipment: 'INV',
  index: 'A',
  site: 'Rajasthan'
};

// Global App State wrapper
let _appState = {
  frequencies: [],
  escalations: [],
  masterChecklists: [],
  sites: [],
  permissions: [],
  tickets: [],
  comments: [],
  activeUserRole: 'System Administrator', // Default logged-in role
  geofenceEnabled: true, // Global geofencing toggle (4.6)
  offlineMode: false, // Offline sync toggle (4.5.a)
  offlineQueue: [] // Holds submissions in offline cache
};

// Seed/Load database
function initializeDatabase() {
  _appState.frequencies = loadLocalData('lib_frequencies_v2', BASELINE_FREQUENCIES);
  _appState.escalations = loadLocalData('lib_escalations_v2', BASELINE_ESCALATIONS);
  _appState.masterChecklists = loadLocalData('lib_masters_v2', BASELINE_MASTER_CHECKLISTS);
  _appState.sites = loadLocalData('lib_sites_v2', BASELINE_SITES);
  _appState.permissions = loadLocalData('lib_perms_v2', DEFAULT_PERMISSIONS);
  _appState.tickets = loadLocalData('lib_tickets_v2', DEFAULT_TICKETS);
  _appState.comments = loadLocalData('lib_comments_v2', DEFAULT_COMMENTS);
  
  const savedRole = localStorage.getItem('active_role');
  const fullAccessRoles = ['Chief - O&M', 'System Administrator'];
  // Only restore a saved role if it's a full-access role — this prevents
  // a previously-simulated restricted role from hiding Access Control on reload
  if (savedRole && fullAccessRoles.includes(savedRole)) {
    _appState.activeUserRole = savedRole;
  } else {
    // Remove stale restricted role from storage and default to System Administrator
    localStorage.removeItem('active_role');
    _appState.activeUserRole = 'System Administrator';
  }

  const savedGeofence = localStorage.getItem('geofence_toggle');
  if (savedGeofence) _appState.geofenceEnabled = JSON.parse(savedGeofence);
}

function loadLocalData(key, defaultVal) {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
}

function syncState() {
  localStorage.setItem('lib_frequencies_v2', JSON.stringify(_appState.frequencies));
  localStorage.setItem('lib_escalations_v2', JSON.stringify(_appState.escalations));
  localStorage.setItem('lib_masters_v2', JSON.stringify(_appState.masterChecklists));
  localStorage.setItem('lib_sites_v2', JSON.stringify(_appState.sites));
  localStorage.setItem('lib_perms_v2', JSON.stringify(_appState.permissions));
  localStorage.setItem('lib_tickets_v2', JSON.stringify(_appState.tickets));
  localStorage.setItem('lib_comments_v2', JSON.stringify(_appState.comments));
}

// AWS Cloud integration mock-up (4.3.g)
function fetchCentralAWSDatabase(onComplete) {
  // Triggers spinner animation
  const overlay = document.getElementById('aws-sync-loader');
  if (overlay) overlay.classList.add('active');

  setTimeout(() => {
    // Inject mock external sites or updates
    const externalAWSUpdates = [
      {
        id: 'aws_site_3',
        name: 'Punjab Biomass Plant',
        acCapacity: 20,
        dcCapacity: 22,
        state: 'Punjab',
        village: 'Mansa',
        zone: 'North',
        geoLatitude: 29.980,
        geoLongitude: 75.390,
        siteHead: 'Gurnam Singh',
        siteHeadEmail: 'gurnam.singh@cleanenergy.com',
        siteHeadMobile: '+919911223344',
        zonalHead: 'Vikram Singh',
        zonalHeadEmail: 'vikram.singh@cleanenergy.com',
        zonalHeadMobile: '+919988776655',
        team: [{ name: 'Jaspreet S.', email: 'jaspreet@cleanenergy.com', mobile: '+919877777777', role: 'Field Technician' }],
        equipments: [
          { name: 'Biomass-Boiler-1', make: 'Thermax', rating: '80 TPH', latitude: 29.9810, longitude: 75.3910, category: 'Boiler' }
        ],
        adoptedChecklists: []
      }
    ];

    // Check if Punjab site is already present, if not add it
    const exists = _appState.sites.some(s => s.id === 'aws_site_3');
    if (!exists) {
      _appState.sites.push(externalAWSUpdates[0]);
      syncState();
    }

    if (overlay) overlay.classList.remove('active');
    if (onComplete) onComplete(exists ? 'No new site updates found on AWS.' : ' Punjab Biomass Plant data synced from AWS Central Database successfully!');
  }, 2000);
}
