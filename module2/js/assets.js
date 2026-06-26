// ===== ASSET HIERARCHY FUNCTIONS =====

function renderAssetTree() {
  const el = document.getElementById('asset-tree');
  if (!el) return;
  el.innerHTML = renderTreeLevel(null);
  
  // populate parent dropdown in modal
  const sel = document.getElementById('asset-parent');
  if (sel) {
    sel.innerHTML = '<option value="">Root Level</option>';
    _state.assets.forEach(a => { 
      sel.innerHTML += '<option value="' + a.id + '">' + a.name + ' (' + a.type + ')</option>'; 
    });
  }
}

function renderTreeLevel(parentId) {
  const children = _state.assets.filter(a => a.parent === parentId);
  if (!children.length) return '';
  let html = parentId ? '<div class="tree-branch">' : '';
  children.forEach(a => {
    const ico = {Inverter:'<i class="hgi-stroke hgi-flash"></i>',Transformer:'<i class="hgi-stroke hgi-plug"></i>',SCB:'<i class="hgi-stroke hgi-plug"></i>',Breaker:'<i class="hgi-stroke hgi-cancel-01"></i>',Plant:'<i class="hgi-stroke hgi-factory"></i>',Switchyard:'<i class="hgi-stroke hgi-flash"></i>',MCR:'<i class="hgi-stroke hgi-settings-01"></i>','Wind Turbine':'<i class="hgi-stroke hgi-wind-01"></i>'}[a.type] || '<i class="hgi-stroke hgi-file-01"></i>';
    html += '<div class="tree-node"><div class="tree-item" onclick="showAssetDetail(\'' + a.id + '\')">';
    html += '<span class="tree-ico">' + ico + '</span>';
    html += '<span class="tree-lbl">' + a.naming + ' — ' + a.name + '</span>';
    html += '<span class="tree-type">' + a.type + '</span>';
    html += '</div>' + renderTreeLevel(a.id) + '</div>';
  });
  html += parentId ? '</div>' : '';
  return html;
}

function showAssetDetail(id) {
  const a = _state.assets.find(x => x.id === id);
  if (!a) return;
  
  const detailSub = document.getElementById('asset-detail-sub');
  if (detailSub) detailSub.textContent = a.name;
  
  const detailPanel = document.getElementById('asset-detail-panel');
  if (detailPanel) {
    detailPanel.innerHTML = '<table style="width:100%;font-size:12px;border-collapse:collapse;">' +
      '<tr><td style="padding:6px;color:var(--muted);font-weight:700;width:40%;">SAP ID</td><td>' + (a.sap||'—') + '</td></tr>' +
      '<tr><td style="padding:6px;color:var(--muted);font-weight:700;">Type</td><td>' + a.type + '</td></tr>' +
      '<tr><td style="padding:6px;color:var(--muted);font-weight:700;">Make</td><td>' + (a.make||'—') + '</td></tr>' +
      '<tr><td style="padding:6px;color:var(--muted);font-weight:700;">Rating</td><td>' + (a.rating||'—') + '</td></tr>' +
      '<tr><td style="padding:6px;color:var(--muted);font-weight:700;">Location</td><td>' + (a.location||'—') + '</td></tr>' +
      '<tr><td style="padding:6px;color:var(--muted);font-weight:700;">Naming</td><td><strong>' + (a.naming||'—') + '</strong></td></tr>' +
      '</table>' +
      '<div style="margin-top:16px;display:flex;gap:8px;">' +
      '<button class="btn btn-secondary btn-sm" onclick="editAsset(\'' + a.id + '\')"><i class="hgi-stroke hgi-pencil-line"></i> Edit</button>' +
      '<button class="btn btn-danger btn-sm" onclick="deleteAsset(\'' + a.id + '\')"><i class="hgi-stroke hgi-delete-02"></i> Delete</button>' +
      '</div>';
  }
}

function saveAsset() {
  const obj = {
    id: 'a_' + Date.now(),
    name: document.getElementById('asset-name').value,
    type: document.getElementById('asset-type').value,
    parent: document.getElementById('asset-parent').value || null,
    sap: document.getElementById('asset-sap').value,
    make: document.getElementById('asset-make').value,
    rating: document.getElementById('asset-rating').value,
    location: document.getElementById('asset-location').value,
    naming: document.getElementById('asset-naming').value
  };
  if (!obj.name) { alert('Asset name required'); return; }
  _state.assets.push(obj);
  syncState(); 
  hideModal('asset-modal'); 
  renderAssetTree();
}

function deleteAsset(id) {
  if (!confirm('Delete this asset and its children?')) return;
  const toDelete = [id];
  const findChildren = (pid) => { 
    _state.assets.filter(a=>a.parent===pid).forEach(a=>{
      toDelete.push(a.id);
      findChildren(a.id);
    }); 
  };
  findChildren(id);
  _state.assets = _state.assets.filter(a => !toDelete.includes(a.id));
  syncState(); 
  renderAssetTree();
  
  const detailPanel = document.getElementById('asset-detail-panel');
  if (detailPanel) {
    detailPanel.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:40px 0;"><i class="hgi-stroke hgi-note-01"></i> Asset deleted</div>';
  }
}

function editAsset(id) {
  // simplified - just show modal  
  showModal('asset-modal');
}
