// ===== FAULT LIBRARY FUNCTIONS =====

function renderFaultLibrary() {
  const searchEl = document.getElementById('fault-search');
  const catFilterEl = document.getElementById('fault-cat-filter');
  const search = (searchEl ? searchEl.value : '').toLowerCase();
  const catF = catFilterEl ? catFilterEl.value : 'all';
  const tbody = document.getElementById('fault-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  _state.faults.filter(f => {
    return (!search || f.desc.toLowerCase().includes(search)) && (catF === 'all' || f.cat === catF);
  }).forEach(f => {
    tbody.innerHTML += '<tr><td style="font-weight:600;color:var(--txt)">' + f.desc + '</td>' +
      '<td><span class="badge badge-' + f.cat.toLowerCase() + '">' + f.cat + '</span></td>' +
      '<td><span style="font-size:11px;color:var(--muted)">' + f.type + '</span></td>' +
      '<td style="text-align:center;">' + (f.photoReq ? '<i class="hgi-stroke hgi-tick-01" style="color:var(--success)"></i>' : '&ndash;') + '</td>' +
      '<td style="text-align:center;">' + (f.readingReq ? f.readingUnit || '<i class="hgi-stroke hgi-tick-01" style="color:var(--success)"></i>' : '&ndash;') + '</td>' +
      '<td>' + f.resolveTime + '</td>' +
      '<td>' + f.escalation + '</td>' +
      '<td><button class="btn btn-secondary btn-sm" onclick="editFault(\'' + f.id + '\')">Edit</button> ' +
      '<button class="btn btn-danger btn-sm" onclick="deleteFault(\'' + f.id + '\')">Del</button></td></tr>';
  });
}

function editFault(id) {
  const f = _state.faults.find(x => x.id === id);
  if (!f) return;
  document.getElementById('fault-edit-id').value = id;
  document.getElementById('fault-desc').value = f.desc;
  document.getElementById('fault-cat').value = f.cat;
  document.getElementById('fault-type').value = f.type;
  document.getElementById('fault-equip').value = f.equip;
  document.getElementById('fault-resolve').value = f.resolveTime;
  document.getElementById('fault-escalation').value = f.escalation;
  document.getElementById('fault-reading-unit').value = f.readingUnit;
  document.getElementById('fault-photo-req').checked = f.photoReq;
  document.getElementById('fault-reading-req').checked = f.readingReq;
  
  const title = document.getElementById('fault-modal-title');
  if (title) title.textContent = 'Edit Fault Type';
  
  showModal('fault-modal');
}

function deleteFault(id) {
  if (!confirm('Delete this fault type?')) return;
  _state.faults = _state.faults.filter(f => f.id !== id);
  syncState(); 
  renderFaultLibrary();
}

function saveFaultType() {
  const id = document.getElementById('fault-edit-id').value;
  const obj = {
    id: id || 'f_' + Date.now(),
    desc: document.getElementById('fault-desc').value,
    cat: document.getElementById('fault-cat').value,
    type: document.getElementById('fault-type').value,
    equip: document.getElementById('fault-equip').value,
    resolveTime: document.getElementById('fault-resolve').value,
    escalation: document.getElementById('fault-escalation').value,
    readingUnit: document.getElementById('fault-reading-unit').value,
    photoReq: document.getElementById('fault-photo-req').checked,
    readingReq: document.getElementById('fault-reading-req').checked
  };
  if (!obj.desc) { alert('Fault description required'); return; }
  
  if (id) { 
    const i = _state.faults.findIndex(f => f.id === id); 
    _state.faults[i] = obj; 
  } else {
    _state.faults.push(obj);
  }
  
  syncState(); 
  hideModal('fault-modal'); 
  renderFaultLibrary();
  
  document.getElementById('fault-edit-id').value = '';
  const title = document.getElementById('fault-modal-title');
  if (title) title.textContent = 'Add Fault Type';
}
