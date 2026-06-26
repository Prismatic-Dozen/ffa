// ===== ADOPTION FUNCTIONS =====

function renderAdoption() {
  const sel = document.getElementById('adopt-site-sel');
  if (!sel) return;
  sel.innerHTML = '';
  _state.sites.forEach(s => { 
    sel.innerHTML += '<option value="' + s.id + '">' + s.name + '</option>'; 
  });
  renderAdoptionEquipment();
}

function renderAdoptionEquipment() {
  const siteSel = document.getElementById('adopt-site-sel');
  if (!siteSel) return;
  const siteId = siteSel.value;
  const esel = document.getElementById('adopt-equip-sel');
  if (!esel) return;
  esel.innerHTML = '<option value="">-- Select Equipment --</option>';
  
  _state.assets.filter(a=>a.parent!==null).forEach(a => { 
    esel.innerHTML += '<option value="' + a.id + '">' + a.naming + ' — ' + a.name + '</option>'; 
  });
}

function renderAdoptionFaults() {
  const esel = document.getElementById('adopt-equip-sel');
  if (!esel) return;
  const equipId = esel.value;
  if (!equipId) return;
  
  const asset = _state.assets.find(a=>a.id===equipId);
  const faults = _state.faults.filter(f => f.equip === 'all' || (asset && f.equip === asset.type));
  const el = document.getElementById('adoption-fault-map');
  if (!el) return;
  
  if (!faults.length) { 
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No faults configured for this equipment type.</p>'; 
    return; 
  }
  
  el.innerHTML = '<h4 style="font-size:13px;font-weight:700;margin-bottom:12px;">Applicable Fault Types &amp; User Mapping</h4>' +
    '<table class="custom-table" style="width:100%;"><thead><tr><th>Fault</th><th>Category</th><th>Assigned User</th><th>Adopted</th></tr></thead><tbody>' +
    faults.map(f => '<tr><td style="font-size:12px;">' + f.desc + '</td><td><span class="badge badge-' + f.cat.toLowerCase() + '">' + f.cat + '</span></td><td><select class="filter-sel" style="font-size:11px;padding:4px 8px;"><option>Rajesh Sharma (Site Head)</option><option>Vikram R. (Technician)</option><option>Sanjay Mehta (Technician)</option></select></td><td style="text-align:center;"><input type="checkbox" checked></td></tr>').join('') +
    '</tbody></table>';
}
