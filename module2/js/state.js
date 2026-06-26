// ===== STATE STORAGE & Baseline Data Seeding =====

let _state = {
  assets: [],
  faults: [],
  sites: [],
  defects: [],
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

const SEED_FAULTS = [
  { id:'f1', desc:'Busbar joint overheating or discoloration', cat:'Critical', type:'Defect', equip:'Inverter', resolveTime:'4 Hours', escalation:'Testing Head', photoReq:true, readingReq:false, readingUnit:'' },
  { id:'f2', desc:'Cabin ambient temperature high', cat:'High', type:'Defect', equip:'Inverter', resolveTime:'12 Hours', escalation:'Site Head', photoReq:false, readingReq:true, readingUnit:'°C' },
  { id:'f3', desc:'Cooling fan failure in inverter', cat:'High', type:'Defect', equip:'Inverter', resolveTime:'8 Hours', escalation:'Site Head', photoReq:true, readingReq:false, readingUnit:'' },
  { id:'f4', desc:'Oil leak detected in transformer', cat:'Critical', type:'Defect', equip:'Transformer', resolveTime:'2 Hours', escalation:'O&M Head', photoReq:true, readingReq:false, readingUnit:'' },
  { id:'f5', desc:'Breaker trip without apparent cause', cat:'High', type:'Defect', equip:'Breaker', resolveTime:'6 Hours', escalation:'Zonal Head', photoReq:false, readingReq:false, readingUnit:'' },
  { id:'f6', desc:'Generation curtailment by DISCOM', cat:'Medium', type:'Curtailment', equip:'all', resolveTime:'N/A', escalation:'Zonal Head', photoReq:false, readingReq:true, readingUnit:'kW' },
  { id:'f7', desc:'TRAS event recorded', cat:'Medium', type:'TRAS', equip:'all', resolveTime:'N/A', escalation:'Site Head', photoReq:false, readingReq:true, readingUnit:'kWh' },
  { id:'f8', desc:'SCB fuse failure', cat:'Medium', type:'Defect', equip:'SCB', resolveTime:'4 Hours', escalation:'Testing Head', photoReq:true, readingReq:false, readingUnit:'' }
];

const SEED_SITES = [
  { id:'s1', name:'Rajasthan Solar Plant', zone:'West', dc:150, ac:130, state:'Rajasthan', shName:'Rajesh Sharma', shEmail:'rajesh.sharma@cleanenergy.com', equips:['ICR1-INV-1','ICR1-INV-2','TR-1'] },
  { id:'s2', name:'Gujarat Wind Farm', zone:'West', dc:50, ac:50, state:'Gujarat', shName:'Sanjay Mehta', shEmail:'sanjay.mehta@cleanenergy.com', equips:['WTG-A1','Switchyard-Breaker-1'] }
];

const SEED_DEFECTS = [
  { id:'D001', siteId:'s1', equipId:'a6', faultId:'f1', obs:'Severe hot spot found on terminal L2', cat:'Critical', status:'Closed', assignedTo:'Rajesh Sharma', raisedOn:'2026-06-20', raisedBy:'Ravi Kumar', closedOn:'2026-06-21', actionTaken:'Tightened bolt contacts and reapplied thermal conducting compound. Re-scanned and confirmed normal.' },
  { id:'D002', siteId:'s1', equipId:'a6', faultId:'f2', obs:'Reading of 48 °C is above threshold (45)', cat:'High', status:'Open', assignedTo:'Amit Patel', raisedOn:'2026-06-24', raisedBy:'Amit Patel', closedOn:'', actionTaken:'', reading:'48' },
  { id:'D003', siteId:'s1', equipId:'a4', faultId:'f4', obs:'Main Transformer TR-1 low-voltage bushing oil seepage observed.', cat:'Critical', status:'Open', assignedTo:'Rajesh Sharma', raisedOn:'2026-06-25', raisedBy:'Ravi Kumar', closedOn:'', actionTaken:'' }
];

const SEED_PERMS = [
  { role:'Field Technician', view:true, create:true, close:false, editLib:false, manageAssets:false, admin:false },
  { role:'Site Head', view:true, create:true, close:true, editLib:false, manageAssets:false, admin:false },
  { role:'Zonal Head', view:true, create:true, close:true, editLib:true, manageAssets:false, admin:false },
  { role:'Chief - O&M', view:true, create:true, close:true, editLib:true, manageAssets:true, admin:false },
  { role:'System Administrator', view:true, create:true, close:true, editLib:true, manageAssets:true, admin:true }
];

function initState() {
  _state.assets = JSON.parse(localStorage.getItem('m2_assets') || 'null') || SEED_ASSETS;
  _state.faults = JSON.parse(localStorage.getItem('m2_faults') || 'null') || SEED_FAULTS;
  _state.sites  = JSON.parse(localStorage.getItem('m2_sites')  || 'null') || SEED_SITES;
  _state.defects= JSON.parse(localStorage.getItem('m2_defects')|| 'null') || SEED_DEFECTS;
  _state.permissions = SEED_PERMS;
}

function syncState() {
  localStorage.setItem('m2_assets', JSON.stringify(_state.assets));
  localStorage.setItem('m2_faults', JSON.stringify(_state.faults));
  localStorage.setItem('m2_sites', JSON.stringify(_state.sites));
  localStorage.setItem('m2_defects', JSON.stringify(_state.defects));
}
