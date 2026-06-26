// ===== SITES FUNCTIONS =====

function renderSites() {
  const grid = document.getElementById('sites-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';
  _state.sites.forEach(s => {
    grid.innerHTML += '<div class="glass glass-p" style="border-radius:14px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">' +
      '<div><div style="font-size:15px;font-weight:800;">' + s.name + '</div>' +
      '<div style="font-size:11px;color:var(--muted);margin-top:2px;">' + s.zone + ' Zone &middot; ' + s.state + '</div></div>' +
      '<span class="badge badge-open">' + s.zone + '</span></div>' +
      '<div style="font-size:12px;color:var(--text2);"><i class="hgi-stroke hgi-flash" style="font-size: 13px; vertical-align: middle;"></i> ' + s.dc + ' MWp DC / ' + s.ac + ' MW AC</div>' +
      '<div style="font-size:12px;color:var(--text2);margin-top:4px;"><i class="hgi-stroke hgi-user" style="font-size: 13px; vertical-align: middle;"></i> ' + s.shName + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:14px;">' +
      '<button class="btn btn-secondary btn-sm" onclick="editSiteM2(\'' + s.id + '\')">Edit</button>' +
      '<button class="btn btn-danger btn-sm" onclick="deleteSiteM2(\'' + s.id + '\')">Delete</button>' +
      '</div></div>';
  });
}

function saveSiteM2() {
  const id = document.getElementById('site-edit-id-m2').value;
  const obj = {
    id: id || 's_' + Date.now(),
    name: document.getElementById('sm2-name').value,
    zone: document.getElementById('sm2-zone').value,
    dc: +document.getElementById('sm2-dc').value,
    ac: +document.getElementById('sm2-ac').value,
    state: document.getElementById('sm2-state').value,
    shName: document.getElementById('sm2-sh-name').value,
    shEmail: document.getElementById('sm2-sh-email').value,
    equips: []
  };
  if (!obj.name) { alert('Site name required'); return; }
  
  if (id) { 
    const i = _state.sites.findIndex(s=>s.id===id); 
    _state.sites[i]=obj; 
  } else {
    _state.sites.push(obj);
  }
  
  syncState(); 
  hideModal('site-modal-m2'); 
  renderSites();
}

function editSiteM2(id) {
  const s = _state.sites.find(x=>x.id===id);
  if (!s) return;
  document.getElementById('site-edit-id-m2').value = id;
  document.getElementById('sm2-name').value = s.name;
  document.getElementById('sm2-zone').value = s.zone;
  document.getElementById('sm2-dc').value = s.dc;
  document.getElementById('sm2-ac').value = s.ac;
  document.getElementById('sm2-state').value = s.state;
  document.getElementById('sm2-sh-name').value = s.shName;
  document.getElementById('sm2-sh-email').value = s.shEmail;
  showModal('site-modal-m2');
}

function deleteSiteM2(id) {
  if (!confirm('Delete this site?')) return;
  _state.sites = _state.sites.filter(s=>s.id!==id);
  syncState(); 
  renderSites();
}
