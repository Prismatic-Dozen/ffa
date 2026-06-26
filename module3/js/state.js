// ===== MODULE 3 STATE & SEED DATA =====

let _state = {
  logs: [],
  assets: [],
  permissions: []
};

// Fallback assets if Module 2 assets are not present in localStorage
const M3_FALLBACK_ASSETS = [
  { id:'a1', name:'Rajasthan Solar Plant', type:'Plant', parent:null, sap:'PLANT-001', make:'', rating:'150 MWp', location:'Rajasthan', naming:'RSP' },
  { id:'a2', name:'ICR Block 1', type:'Inverter Block', parent:'a1', sap:'EQ-1001', make:'ABB', rating:'2.5 MW', location:'Block 1', naming:'ICR-1' },
  { id:'a3', name:'ICR Block 2', type:'Inverter Block', parent:'a1', sap:'EQ-1002', make:'ABB', rating:'2.5 MW', location:'Block 2', naming:'ICR-2' },
  { id:'a4', name:'Main Transformer TR-1', type:'Transformer', parent:'a1', sap:'EQ-2001', make:'Siemens', rating:'120 MVA', location:'Switchyard', naming:'TR-1' },
  { id:'a5', name:'Switchyard', type:'Switchyard', parent:'a1', sap:'EQ-3001', make:'GE', rating:'220 KV', location:'North', naming:'SY-01' },
  { id:'a6', name:'ICR1-INV-1', type:'Inverter', parent:'a2', sap:'EQ-1001-01', make:'ABB', rating:'2.5 MW', location:'ICR-1 Row 1', naming:'ICR1-INV-1' },
  { id:'a7', name:'ICR1-INV-2', type:'Inverter', parent:'a2', sap:'EQ-1001-02', make:'ABB', rating:'2.5 MW', location:'ICR-1 Row 1', naming:'ICR1-INV-2' }
];

const SEED_LOGS = [
  {
    id: 'L001',
    date: '2026-06-20',
    shift: 'Day',
    weather: 'Clear Sky, Avg Temp 42°C, Wind speed 12 km/h',
    gridStatus: 'Normal, Grid availability 100%',
    activities: [
      { type: 'Generation', desc: 'Plant generation peak reached 142 MW at 13:00 hrs. Cumulative daily generation at 820 MWh.' },
      { type: 'Maintenance', desc: 'Conducted daily plant rounds and checklists.' }
    ],
    anomalies: [
      { equipId: 'a6', description: 'ICR1-INV-1 Busbar joint overheating and discoloration observed during morning routine checklist.', severity: 'Critical' }
    ],
    followups: [
      { id: 'F001', desc: 'Tighten bolt contacts and reapply thermal conducting compound on Inverter ICR1-INV-1.', assignedTo: 'Rajesh Sharma', dueDate: '2026-06-21', status: 'Closed', closureNotes: 'Completed maintenance on joint. Verified temperature returned to normal under load.' }
    ]
  },
  {
    id: 'L002',
    date: '2026-06-24',
    shift: 'Day',
    weather: 'Sunny, Avg Temp 44°C, Wind speed 15 km/h',
    gridStatus: 'DISCOM generation curtailment instruction received between 11:30 and 13:00 (loss of ~150 kW)',
    activities: [
      { type: 'Generation', desc: 'Plant generation peak reached 120 MW. Cumulative generation impacted by DISCOM curtailment.' }
    ],
    anomalies: [
      { equipId: 'a6', description: 'ICR1-INV-1 cabin ambient temperature alarm (48°C) tripped during afternoon round (above threshold of 45°C).', severity: 'High' }
    ],
    followups: [
      { id: 'F002', desc: 'Inspect ventilation fans and clean air filters on Inverter ICR1-INV-1.', assignedTo: 'Amit Patel', dueDate: '2026-06-25', status: 'Open', closureNotes: '' }
    ]
  },
  {
    id: 'L003',
    date: '2026-06-25',
    shift: 'Night',
    weather: 'Cool, Avg Temp 29°C',
    gridStatus: 'Normal',
    activities: [
      { type: 'Safety', desc: 'Night shift security patrol completed. Perimeter fence check normal.' }
    ],
    anomalies: [
      { equipId: 'a4', description: 'Main Transformer TR-1 low-voltage bushing oil seepage observed.', severity: 'Critical' }
    ],
    followups: [
      { id: 'F003', desc: 'Tighten gasket bolts on TR-1 and monitor oil level.', assignedTo: 'Rajesh Sharma', dueDate: '2026-06-26', status: 'Open', closureNotes: '' }
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
