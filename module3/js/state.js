// ===== MODULE 3 STATE & SEED DATA =====

let _state = {
  logs: [],
  assets: [],
  permissions: []
};

// Fallback assets if Module 2 assets are not present in localStorage
const M3_FALLBACK_ASSETS = [
  { id:'a1', name:'Rajasthan Solar Plant', type:'Plant', parent:null, sap:'PLANT-001', make:'', rating:'150 MWp', location:'Rajasthan', naming:'RSP' },
  { id:'a2', name:'ICR Block A', type:'Inverter', parent:'a1', sap:'EQ-1001', make:'SMA', rating:'2.5 MW', location:'Block A', naming:'ICR-A' },
  { id:'a3', name:'ICR Block B', type:'Inverter', parent:'a1', sap:'EQ-1002', make:'ABB', rating:'2.5 MW', location:'Block B', naming:'ICR-B' },
  { id:'a4', name:'Main Transformer T1', type:'Transformer', parent:'a1', sap:'EQ-2001', make:'Siemens', rating:'220 KV', location:'Switchyard', naming:'TX-1' },
  { id:'a5', name:'Switchyard', type:'Switchyard', parent:'a1', sap:'EQ-3001', make:'GE', rating:'220 KV', location:'North', naming:'SY-01' },
  { id:'a6', name:'INV-A1', type:'Inverter', parent:'a2', sap:'EQ-1001-01', make:'SMA', rating:'2.5 MW', location:'ICR-A Row 1', naming:'ICR-A/INV-A1' }
];

const SEED_LOGS = [
  {
    id: 'L001',
    date: '2026-06-23',
    shift: 'Day',
    weather: 'Clear Sky, Avg Temp 42°C, Wind speed 12 km/h',
    gridStatus: 'Normal, Grid availability 99.8%',
    activities: [
      { type: 'Generation', desc: 'Plant generation peak reached 142 MW at 13:00 hrs. Cumulative DC generation at 820 MWh.' },
      { type: 'Maintenance', desc: 'Scheduled quarterly PM completed on SCB Block A (SCB-A1 to SCB-A4).' },
      { type: 'Safety', desc: 'Toolbox talk conducted on electrical isolation protocols for O&M technicians.' }
    ],
    anomalies: [
      { equipId: 'a6', description: 'Inverter INV-A1 temperature alarm tripped. High cooling fan dust observed.', severity: 'High' }
    ],
    followups: [
      { id: 'F001', desc: 'Clean cooling fan filters on Inverter INV-A1 and verify alarm reset.', assignedTo: 'Vikram R.', dueDate: '2026-06-24', status: 'Closed', closureNotes: 'Cleaned filters and reset alarm. Temperature returned to normal.' }
    ]
  },
  {
    id: 'L002',
    date: '2026-06-24',
    shift: 'Day',
    weather: 'Sunny with partial clouds, Wind speed 15 km/h',
    gridStatus: 'DISCOM generation curtailment instruction received between 11:30 and 13:00 (loss of ~150 kW)',
    activities: [
      { type: 'Generation', desc: 'Plant generation peak reached 120 MW. Cumulative generation impacted by DISCOM curtailment.' },
      { type: 'Maintenance', desc: 'Minor cleaning and bushing inspections conducted on Main Transformer T1.' }
    ],
    anomalies: [
      { equipId: 'a4', description: 'Transformer T1 oil seepage observed near low-voltage bushing terminal.', severity: 'Critical' }
    ],
    followups: [
      { id: 'F002', desc: 'Bushing replacement and gasket tightening for T1 low-voltage terminal.', assignedTo: 'Sanjay Mehta', dueDate: '2026-06-26', status: 'Open', closureNotes: '' }
    ]
  },
  {
    id: 'L003',
    date: '2026-06-25',
    shift: 'Night',
    weather: 'Cool, Avg Temp 29°C',
    gridStatus: 'Normal, Grid availability 100%',
    activities: [
      { type: 'Safety', desc: 'Night shift security patrol completed. Perimeter fence check normal.' },
      { type: 'Grid Status', desc: 'Night time reactive power support active. SCADA telemetry verified with SLDC.' }
    ],
    anomalies: [
      { equipId: 'a5', description: 'Switchyard control room SCADA communication interface card dropped twice during shift.', severity: 'Medium' }
    ],
    followups: [
      { id: 'F003', desc: 'Inspect SCADA comm fiber patch cable and check connection terminals.', assignedTo: 'Rajesh Sharma', dueDate: '2026-06-27', status: 'Open', closureNotes: '' }
    ]
  }
];

const SEED_PERMS = [
  { role: 'Field Technician', view: true, create: true, close: false, admin: false },
  { role: 'Site Head', view: true, create: true, close: true, admin: false },
  { role: 'Zonal Head', view: true, create: true, close: true, admin: false },
  { role: 'Chief - O&M', view: true, create: true, close: true, admin: true },
  { role: 'System Administrator', view: true, create: true, close: true, admin: true }
];

function initState() {
  // Load logs
  _state.logs = JSON.parse(localStorage.getItem('m3_logs') || 'null') || SEED_LOGS;
  
  // Load assets from Module 2 (m2_assets)
  _state.assets = JSON.parse(localStorage.getItem('m2_assets') || 'null') || M3_FALLBACK_ASSETS;
  
  // Load permissions
  _state.permissions = SEED_PERMS;
}

function syncState() {
  localStorage.setItem('m3_logs', JSON.stringify(_state.logs));
}
