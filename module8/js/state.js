// ===== MODULE 8 STATE & Baseline Data Seeding =====

let _state = {
  incidents: [],
  permissions: []
};

const SEED_INCIDENTS = [
  {
    id: 'INC001',
    siteName: 'Rajasthan Solar Plant',
    equipType: 'Inverter',
    equipName: 'ICR1-INV-1',
    mwImpact: 2.5,
    startTime: '2026-06-24T14:15',
    downtime: '03:00',
    restorationTime: '2026-06-24T17:15',
    remarks: 'High temperature alarm tripped. Cleared after cleaning ventilation fan filters.',
    status: 'Resolved',
    actualRestoration: '2026-06-24T17:00',
    pushedToCreams: true,
    loggedBy: 'Amit Patel'
  },
  {
    id: 'INC002',
    siteName: 'Rajasthan Solar Plant',
    equipType: 'Power Transformer',
    equipName: 'TR-1',
    mwImpact: 120.0,
    startTime: '2026-06-25T11:00',
    downtime: '04:00',
    restorationTime: '2026-06-25T15:00',
    remarks: 'Emergency trip due to low-voltage bushing oil leakage observation. Tightening gaskets.',
    status: 'Active',
    actualRestoration: '',
    pushedToCreams: true,
    loggedBy: 'Ravi Kumar'
  },
  {
    id: 'INC003',
    siteName: 'Gujarat Wind Farm',
    equipType: 'Grid Outage',
    equipName: 'Switchyard-Breaker-1',
    mwImpact: 50.0,
    startTime: '2026-06-26T08:00',
    downtime: '02:30',
    restorationTime: '2026-06-26T10:30',
    remarks: 'State transmission line utility breaker tripped at sub-station.',
    status: 'Resolved',
    actualRestoration: '2026-06-26T10:15',
    pushedToCreams: true,
    loggedBy: 'Sanjay Mehta'
  }
];

const SEED_PERMS = [
  { role: 'Field Technician', view: true, report: true, update: false },
  { role: 'Site Head', view: true, report: true, update: true },
  { role: 'Zonal Head', view: true, report: true, update: true },
  { role: 'Chief - O&M', view: true, report: true, update: true },
  { role: 'System Administrator', view: true, report: true, update: true }
];

function initState() {
  _state.incidents = JSON.parse(localStorage.getItem('m8_incidents') || 'null') || SEED_INCIDENTS;
  _state.permissions = SEED_PERMS;
}

function syncState() {
  localStorage.setItem('m8_incidents', JSON.stringify(_state.incidents));
}
