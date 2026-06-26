// ===== MODULE 7 STATE & Baseline Data Seeding =====

let _state = {
  assets: [],
  team: [],
  tasks: [],
  permissions: []
};

const SEED_ASSETS = [
  { id:'a1', name:'Rajasthan Solar Plant', type:'Plant', parent:null, sap:'PLANT-001', make:'', rating:'150 MWp', location:'Rajasthan', naming:'RSP' },
  { id:'a2', name:'ICR Block 1', type:'Inverter Block', parent:'a1', sap:'EQ-1001', make:'ABB', rating:'2.5 MW', location:'Block 1', naming:'ICR-1' },
  { id:'a3', name:'ICR Block 2', type:'Inverter Block', parent:'a1', sap:'EQ-1002', make:'ABB', rating:'2.5 MW', location:'Block 2', naming:'ICR-2' },
  { id:'a4', name:'Main Transformer TR-1', type:'Transformer', parent:'a1', sap:'EQ-2001', make:'Siemens', rating:'120 MVA', location:'Switchyard', naming:'TR-1' },
  { id:'a5', name:'Switchyard', type:'Switchyard', parent:'a1', sap:'EQ-3001', make:'GE', rating:'220 KV', location:'North', naming:'SY-01' },
  { id:'a6', name:'ICR1-INV-1', type:'Inverter', parent:'a2', sap:'EQ-1001-01', make:'ABB', rating:'2.5 MW', location:'ICR-1 Row 1', naming:'ICR1-INV-1' },
  { id:'a7', name:'ICR1-INV-2', type:'Inverter', parent:'a2', sap:'EQ-1001-02', make:'ABB', rating:'2.5 MW', location:'ICR-1 Row 1', naming:'ICR1-INV-2' }
];

const SEED_TEAM = [
  { email: 'amit.patel@cleanenergy.com', name: 'Amit Patel', role: 'Field Technician', baseHours: 8, isDirect: true },
  { email: 'ravi.kumar@cleanenergy.com', name: 'Ravi Kumar', role: 'Field Technician', baseHours: 8, isDirect: true },
  { email: 'rajesh.sharma@cleanenergy.com', name: 'Rajesh Sharma', role: 'Site Head', baseHours: 8, isDirect: false },
  { email: 'suresh.g@cleanenergy.com', name: 'Suresh G.', role: 'Field Technician', baseHours: 8, isDirect: false }
];

const SEED_TASKS = [
  {
    id: 'WA001',
    title: 'Inspect ventilation fans and clean air filters on Inverter ICR1-INV-1',
    source: 'Checklist Exception (cp_1_1)',
    assetId: 'a6',
    assignedTo: 'amit.patel@cleanenergy.com',
    priority: 'High',
    estHours: 12,
    dueDate: '2026-06-25',
    status: 'In Progress',
    createdOn: '2026-06-24',
    closedOn: '',
    remarks: '',
    photo: ''
  },
  {
    id: 'WA002',
    title: 'Tighten L2 terminal bolts and reapply thermal compound on Inverter ICR1-INV-1',
    source: 'Defect Management (D001)',
    assetId: 'a6',
    assignedTo: 'rajesh.sharma@cleanenergy.com',
    priority: 'Critical',
    estHours: 4,
    dueDate: '2026-06-21',
    status: 'Closed',
    createdOn: '2026-06-20',
    closedOn: '2026-06-21',
    remarks: 'Tightened contacts, compound applied. scanned joint temperature normal.',
    photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'
  },
  {
    id: 'WA003',
    title: 'Tighten gasket bolts and inspect bushing oil seepage on Transformer TR-1',
    source: 'Defect Management (D003)',
    assetId: 'a4',
    assignedTo: 'ravi.kumar@cleanenergy.com',
    priority: 'Critical',
    estHours: 4,
    dueDate: '2026-06-26',
    status: 'Open',
    createdOn: '2026-06-25',
    closedOn: '',
    remarks: '',
    photo: ''
  },
  {
    id: 'WA004',
    title: 'Grass cutting around inverter room blocks',
    source: 'Direct Allocation',
    assetId: 'a2',
    assignedTo: 'ravi.kumar@cleanenergy.com',
    priority: 'Low',
    estHours: 8,
    dueDate: '2026-06-27',
    status: 'Open',
    createdOn: '2026-06-25',
    closedOn: '',
    remarks: '',
    photo: ''
  }
];

const SEED_PERMS = [
  { role: 'Field Technician', view: true, assign: false, complete: true, admin: false },
  { role: 'Site Head', view: true, assign: true, complete: true, admin: false },
  { role: 'Zonal Head', view: true, assign: true, complete: true, admin: true },
  { role: 'Chief - O&M', view: true, assign: true, complete: true, admin: true },
  { role: 'System Administrator', view: true, assign: true, complete: true, admin: true }
];

function initState() {
  _state.assets = JSON.parse(localStorage.getItem('m2_assets') || 'null') || SEED_ASSETS;
  _state.team = SEED_TEAM;
  _state.tasks = JSON.parse(localStorage.getItem('m7_tasks') || 'null') || SEED_TASKS;
  _state.permissions = SEED_PERMS;
}

function syncState() {
  localStorage.setItem('m7_tasks', JSON.stringify(_state.tasks));
}
