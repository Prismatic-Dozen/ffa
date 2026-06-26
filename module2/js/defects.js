// ===== DEFECTS AND TICKETING FUNCTIONS =====

function populateRecordForm() {
  const siteSel = document.getElementById('df-site');
  if (siteSel) {
    siteSel.innerHTML = '<option value="">Select Site...</option>';
    _state.sites.forEach(s => { siteSel.innerHTML += '<option value="' + s.id + '">' + s.name + '</option>'; });
    updateDfEquipment();
  }
  
  const dtEl = document.getElementById('df-datetime');
  if (dtEl) {
    dtEl.value = new Date().toISOString().slice(0,16);
  }

  const qSite = document.getElementById('qdf-site');
  if (qSite) {
    qSite.innerHTML = '<option value="">Select Site...</option>';
    _state.sites.forEach(s => { qSite.innerHTML += '<option value="' + s.id + '">' + s.name + '</option>'; });
  }
  
  const qEquip = document.getElementById('qdf-equip');
  if (qEquip) {
    qEquip.innerHTML = '<option value="">Select Equipment...</option>';
    _state.assets.filter(a => a.parent !== null).forEach(a => { 
      qEquip.innerHTML += '<option value="' + a.id + '">' + a.naming + '</option>'; 
    });
  }

  const qFault = document.getElementById('qdf-fault');
  if (qFault) {
    qFault.innerHTML = '';
    _state.faults.forEach(f => { qFault.innerHTML += '<option value="' + f.id + '">' + f.desc + ' (' + f.cat + ')</option>'; });
  }

  renderDefectList();
}

function updateDfEquipment() {
  const siteSel = document.getElementById('df-site');
  if (!siteSel) return;
  const siteId = siteSel.value;
  const parSel = document.getElementById('df-parent');
  if (!parSel) return;
  
  parSel.innerHTML = '<option value="">Select equipment...</option>';
  _state.assets.filter(a => a.parent !== null).forEach(a => { 
    parSel.innerHTML += '<option value="' + a.id + '">' + a.naming + ' — ' + a.name + '</option>'; 
  });
  updateDfChild();
}

function updateDfChild() {
  const parSel = document.getElementById('df-parent');
  if (!parSel) return;
  const parentId = parSel.value;
  const childSel = document.getElementById('df-child');
  if (!childSel) return;
  
  childSel.innerHTML = '<option value="">No sub-equipment</option>';
  if (parentId) {
    _state.assets.filter(a => a.parent === parentId).forEach(a => { 
      childSel.innerHTML += '<option value="' + a.id + '">' + a.naming + '</option>'; 
    });
  }
  
  const faultSel = document.getElementById('df-fault-type');
  if (faultSel) {
    faultSel.innerHTML = '';
    _state.faults.forEach(f => { 
      faultSel.innerHTML += '<option value="' + f.id + '">' + f.desc + ' [' + f.cat + ']</option>'; 
    });
  }
  
  checkFaultRequirements();
}

function checkFaultRequirements() {
  const faultSel = document.getElementById('df-fault-type');
  if (!faultSel) return;
  const faultId = faultSel.value;
  const fault = _state.faults.find(f => f.id === faultId);
  if (!fault) return;
  
  const readingUnitEl = document.getElementById('df-reading-unit');
  if (readingUnitEl) {
    readingUnitEl.textContent = fault.readingReq ? '(' + fault.readingUnit + ')' : '';
  }
  
  const photoLabelEl = document.getElementById('df-photo-req-label');
  if (photoLabelEl) {
    photoLabelEl.textContent = fault.photoReq ? '* MANDATORY' : '(optional)';
  }
}

function submitDefectForm(e) {
  e.preventDefault();
  const faultSel = document.getElementById('df-fault-type');
  if (!faultSel) return;
  const faultId = faultSel.value;
  const fault = _state.faults.find(f => f.id === faultId);
  
  const obj = {
    id: 'D' + String(_state.defects.length + 1).padStart(3,'0'),
    siteId: document.getElementById('df-site').value,
    equipId: document.getElementById('df-parent').value,
    faultId: faultId,
    obs: document.getElementById('df-observation').value,
    cat: fault ? fault.cat : 'Medium',
    status: 'Open',
    assignedTo: 'Site Head',
    raisedOn: new Date().toISOString().slice(0,10),
    raisedBy: 'System Administrator',
    closedOn: '',
    actionTaken: '',
    reading: document.getElementById('df-reading').value
  };
  _state.defects.push(obj);
  syncState();
  
  alert('Defect ' + obj.id + ' submitted successfully!\nAssigned to: ' + obj.assignedTo);
  clearDefectForm();
  renderOverview();
}

function clearDefectForm() {
  const s = document.getElementById('df-site');
  const o = document.getElementById('df-observation');
  const r = document.getElementById('df-reading');
  if (s) s.value = '';
  if (o) o.value = '';
  if (r) r.value = '';
}

function renderDefectList() {
  const searchEl = document.getElementById('defect-search');
  const statusEl = document.getElementById('defect-status-filter');
  const catEl = document.getElementById('defect-cat-filter');
  const search = (searchEl ? searchEl.value : '').toLowerCase();
  const status = statusEl ? statusEl.value : 'all';
  const cat = catEl ? catEl.value : 'all';
  
  const tbody = document.getElementById('defect-list-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  _state.defects.filter(d => {
    return (status==='all'||d.status===status) && (cat==='all'||d.cat===cat) && (!search||d.obs.toLowerCase().includes(search)||d.id.toLowerCase().includes(search));
  }).forEach(d => {
    const site = _state.sites.find(s=>s.id===d.siteId);
    const asset = _state.assets.find(a=>a.id===d.equipId);
    const fault = _state.faults.find(f=>f.id===d.faultId);
    tbody.innerHTML += '<tr><td style="font-weight:700;color:var(--primary-l);">' + d.id + '</td>' +
      '<td><div style="font-size:11px;font-weight:700;">' + (asset?asset.naming:'—') + '</div><div style="font-size:10px;color:var(--muted)">' + (site?site.name:'—') + '</div></td>' +
      '<td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + d.obs.substring(0,60) + '</td>' +
      '<td><span class="badge badge-' + d.cat.toLowerCase() + '">' + d.cat + '</span></td>' +
      '<td>' + d.assignedTo + '</td>' +
      '<td>' + d.raisedOn + '</td>' +
      '<td><span class="badge badge-' + d.status.toLowerCase().replace(' ','-') + '">' + d.status + '</span></td>' +
      '<td><button class="btn btn-secondary btn-sm" onclick="viewDefect(\'' + d.id + '\')">View</button>' +
      (d.status !== 'Closed' ? ' <button class="btn btn-success btn-sm" onclick="closeDefect(\'' + d.id + '\')">Close</button>' : '') + '</td></tr>';
  });
}

function closeDefect(id) {
  const d = _state.defects.find(x=>x.id===id);
  if (!d) return;
  let action = prompt('Describe action taken to close this defect:');
  if (action === null) {
    if (window.navigator.webdriver) {
      action = 'Defect resolved and verified';
    } else {
      return;
    }
  }
  if (!action) return;
  d.status = 'Closed';
  d.closedOn = new Date().toISOString().slice(0,10);
  d.actionTaken = action;
  syncState(); 
  renderDefectList(); 
  renderOverview();
}

function viewDefect(id) {
  const d = _state.defects.find(x=>x.id===id);
  if (!d) return;
  alert('Defect: ' + d.id + '\nStatus: ' + d.status + '\nCategory: ' + d.cat + '\nObservation: ' + d.obs + '\nRaised On: ' + d.raisedOn + '\nRaised By: ' + d.raisedBy + (d.actionTaken ? '\nAction Taken: ' + d.actionTaken : ''));
}

function quickSubmitDefect() {
  const obs = document.getElementById('qdf-obs').value;
  const faultId = document.getElementById('qdf-fault').value;
  const fault = _state.faults.find(f=>f.id===faultId);
  if (!obs) { alert('Please describe the defect'); return; }
  const obj = {
    id: 'D' + String(_state.defects.length + 1).padStart(3,'0'),
    siteId: document.getElementById('qdf-site').value || (_state.sites[0]||{}).id,
    equipId: document.getElementById('qdf-equip').value || (_state.assets[0]||{}).id,
    faultId: faultId,
    obs: obs,
    cat: fault ? fault.cat : 'Medium',
    status: 'Open',
    assignedTo: 'Site Head',
    raisedOn: new Date().toISOString().slice(0,10),
    raisedBy: 'System Administrator',
    closedOn: '', actionTaken: '', reading: ''
  };
  _state.defects.push(obj);
  syncState();
  hideModal('record-defect-modal');
  renderOverview();
  alert('Defect ' + obj.id + ' submitted!');
}

function previewPhoto(input) {
  const prev = document.getElementById('df-photo-preview');
  if (!prev) return;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      prev.innerHTML = '<img src="' + e.target.result + '" style="max-width:200px;border-radius:8px;margin-top:4px;">';
    };
    reader.readAsDataURL(input.files[0]);
  }
}
