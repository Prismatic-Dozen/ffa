// --- Master Checklist Site-Adoption Operations ---

function renderAdoptionPage() {
  const siteSelect = document.getElementById('adopt-site-selector');
  const adoptedList = document.getElementById('site-adopted-list');
  const availableList = document.getElementById('available-masters-list');
  
  if (!siteSelect || !adoptedList || !availableList) return;

  // Populate site selector dropdown if empty
  if (siteSelect.options.length <= 1) {
    siteSelect.innerHTML = '<option value="">-- Select Active Site --</option>';
    _appState.sites.forEach(s => {
      siteSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
  }

  const siteId = siteSelect.value;
  if (!siteId) {
    adoptedList.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Please select a site to view adopted checklists.</td></tr>';
    availableList.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">Select a site to view available master templates.</p>';
    return;
  }

  const site = _appState.sites.find(s => s.id === siteId);
  if (!site) return;

  // 1. Render currently adopted checklists
  adoptedList.innerHTML = '';
  if (!site.adoptedChecklists || site.adoptedChecklists.length === 0) {
    adoptedList.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">No checklists adopted for this site yet.</td></tr>';
  } else {
    site.adoptedChecklists.forEach((ac, idx) => {
      adoptedList.innerHTML += `
        <tr>
          <td style="font-weight:600;">${ac.name}</td>
          <td><span style="font-size:11px; background:var(--border-color); padding:2px 6px; border-radius:10px;">${ac.equipmentName}</span></td>
          <td>${ac.checkpoints ? ac.checkpoints.length : 0} points</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary" style="font-size:11px; padding: 4px 8px;" onclick="showAdoptOverridesModal('${site.id}', '${ac.id}')">
                Override Rules
              </button>
              <button class="btn btn-danger btn-icon" style="height:26px; width:26px; padding:0;" onclick="removeAdoptedChecklist('${site.id}', '${ac.id}')" title="Remove Adopted List">
                <svg viewBox="0 0 24 24" style="width:12px; height:12px; stroke: currentColor; fill:none; stroke-width: 2.5;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  }

  // 2. Render available master checklists to adopt
  availableList.innerHTML = '';
  
  // Find checklists NOT yet adopted at this site or allow multiple mappings for different equipment
  _appState.masterChecklists.forEach(m => {
    const freq = _appState.frequencies.find(f => f.id === m.freqId) || { name: 'Daily' };
    
    availableList.innerHTML += `
      <div class="glass-card" style="padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="font-size:14px; margin-bottom:4px;">${m.name}</h4>
          <p style="font-size:11px; color:var(--text-muted);">${m.equipmentCategory} checklist (${m.rating}) | Frequency: ${freq.name}</p>
        </div>
        <button class="btn btn-primary" style="font-size:11px; padding: 6px 10px;" onclick="setupAdoptionConfig('${site.id}', '${m.id}')">
          Adopt Template
        </button>
      </div>
    `;
  });
}

// Redirect trigger from master library cards
function showAdoptionModalForTemplate(masterId) {
  switchTab('adoption-page');
  const siteSelect = document.getElementById('adopt-site-selector');
  if (siteSelect) {
    // Pick first site if none selected
    if (!siteSelect.value && _appState.sites.length > 0) {
      siteSelect.value = _appState.sites[0].id;
    }
    renderAdoptionPage();
    if (siteSelect.value) {
      setupAdoptionConfig(siteSelect.value, masterId);
    }
  }
}

// Opens modal to select equipment and preview adoption details (4.4)
function setupAdoptionConfig(siteId, masterId) {
  const site = _appState.sites.find(s => s.id === siteId);
  const master = _appState.masterChecklists.find(m => m.id === masterId);
  
  if (!site || !master) return;

  document.getElementById('adoption-modal-title').textContent = `Adopt: ${master.name}`;
  document.getElementById('adopt-site-id').value = siteId;
  document.getElementById('adopt-master-id').value = masterId;

  // Filter equipment by category
  const eqSelect = document.getElementById('adopt-equipment-select');
  eqSelect.innerHTML = '';
  
  const siteEquipments = site.equipments.filter(e => e.category.toLowerCase() === master.equipmentCategory.toLowerCase());
  
  if (siteEquipments.length === 0) {
    // If no matching category equipment, populate all equipment
    site.equipments.forEach(e => {
      eqSelect.innerHTML += `<option value="${e.name}">${e.name} (${e.category})</option>`;
    });
  } else {
    siteEquipments.forEach(e => {
      eqSelect.innerHTML += `<option value="${e.name}">${e.name}</option>`;
    });
  }

  // Preview naming adoption (4.4.c)
  updateAdoptionNamingPreview();

  showModal('adoption-config-modal');
}

function updateAdoptionNamingPreview() {
  const siteId = document.getElementById('adopt-site-id').value;
  const masterId = document.getElementById('adopt-master-id').value;
  const eqName = document.getElementById('adopt-equipment-select').value;
  const previewSpan = document.getElementById('adopt-naming-preview');

  const site = _appState.sites.find(s => s.id === siteId);
  const master = _appState.masterChecklists.find(m => m.id === masterId);

  if (!site || !master) return;

  let adoptedName = master.name;
  if (master.adoptName && master.namingRule) {
    const eqObj = site.equipments.find(e => e.name === eqName) || { make: '', rating: '', name: eqName };
    // Try to extract block and index from equipment name (e.g. ICR1-INV-1)
    const blockMatch = eqName.match(/^([^-]+)/);
    const indexMatch = eqName.match(/-([^-]+)$/);
    const block = blockMatch ? blockMatch[1] : 'Block1';
    const index = indexMatch ? indexMatch[1] : '1';

    adoptedName = master.namingRule
      .replace(/\{\{block\}\}/g, block)
      .replace(/\{\{equipment\}\}/g, master.equipmentCategory || 'INV')
      .replace(/\{\{index\}\}/g, index)
      .replace(/\{\{site\}\}/g, site.name.split(' ')[0]);
  }

  previewSpan.textContent = `${adoptedName} (${master.frequencies && _appState.frequencies.find(f => f.id === master.freqId) ? _appState.frequencies.find(f => f.id === master.freqId).name : 'Occurrence'})`;
}

function saveAdoptionMapping() {
  const siteId = document.getElementById('adopt-site-id').value;
  const masterId = document.getElementById('adopt-master-id').value;
  const equipmentName = document.getElementById('adopt-equipment-select').value;

  const site = _appState.sites.find(s => s.id === siteId);
  const master = _appState.masterChecklists.find(m => m.id === masterId);

  if (!site || !master || !equipmentName) return;

  // Compute final adopted name
  let adoptedName = master.name;
  if (master.adoptName && master.namingRule) {
    const blockMatch = equipmentName.match(/^([^-]+)/);
    const indexMatch = equipmentName.match(/-([^-]+)$/);
    const block = blockMatch ? blockMatch[1] : 'Block1';
    const index = indexMatch ? indexMatch[1] : '1';

    adoptedName = master.namingRule
      .replace(/\{\{block\}\}/g, block)
      .replace(/\{\{equipment\}\}/g, master.equipmentCategory || 'INV')
      .replace(/\{\{index\}\}/g, index)
      .replace(/\{\{site\}\}/g, site.name.split(' ')[0]);
  }

  // Clone checkpoints
  const clonedCheckpoints = JSON.parse(JSON.stringify(master.checkpoints));

  const newAdopted = {
    id: 'adopt_' + Date.now(),
    masterId: master.id,
    name: adoptedName,
    equipmentName,
    freqName: _appState.frequencies.find(f => f.id === master.freqId).name,
    checkpoints: clonedCheckpoints
  };

  site.adoptedChecklists.push(newAdopted);
  syncState();
  hideModal('adoption-config-modal');
  renderAdoptionPage();

  // Log comment
  const commentId = 'c_' + Date.now();
  _appState.comments.unshift({
    id: commentId,
    siteName: site.name,
    checklistName: adoptedName,
    userName: _appState.activeUserRole,
    comment: `Adopted checklist for ${equipmentName} successfully. Default thresholds configured.`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  });
  syncState();
  renderCommentsFeed();
}

function removeAdoptedChecklist(siteId, adoptedId) {
  const site = _appState.sites.find(s => s.id === siteId);
  if (!site) return;

  if (confirm("Remove this adopted checklist template from the site? All compliance progress and logs for this device will be disconnected.")) {
    site.adoptedChecklists = site.adoptedChecklists.filter(ac => ac.id !== adoptedId);
    syncState();
    renderAdoptionPage();
  }
}


// --- Site Specific Checklist Overrides and Suggested Checkpoints (4.4.d & 4.4.f) ---

function showAdoptOverridesModal(siteId, adoptedId) {
  const site = _appState.sites.find(s => s.id === siteId);
  if (!site) return;
  const ac = site.adoptedChecklists.find(item => item.id === adoptedId);
  if (!ac) return;

  document.getElementById('override-modal-title').textContent = `Customize Site Checklist: ${ac.name}`;
  document.getElementById('override-site-id').value = siteId;
  document.getElementById('override-adopted-id').value = adoptedId;

  const overridesList = document.getElementById('overrides-checkpoints-list');
  overridesList.innerHTML = '';

  ac.checkpoints.forEach((cp, idx) => {
    // Category dropdown override selector
    const catSelect = `
      <select class="form-select-styled ov-cat" style="padding: 4px 8px; font-size:11px;">
        <option value="Critical" ${cp.category === 'Critical' ? 'selected' : ''}>Critical</option>
        <option value="High" ${cp.category === 'High' ? 'selected' : ''}>High</option>
        <option value="Medium" ${cp.category === 'Medium' ? 'selected' : ''}>Medium</option>
        <option value="Low" ${cp.category === 'Low' ? 'selected' : ''}>Low</option>
      </select>
    `;

    // Numerical thresholds overrides if applicable
    let numericFields = '';
    if (cp.type === 'numeric') {
      numericFields = `
        <div style="display:flex; gap:6px; margin-top:8px;">
          <input type="number" step="any" class="form-input ov-min" value="${cp.rangeMin}" placeholder="Min" style="padding: 4px 8px; font-size:11px; width:70px;">
          <input type="number" step="any" class="form-input ov-max" value="${cp.rangeMax}" placeholder="Max" style="padding: 4px 8px; font-size:11px; width:70px;">
          <input type="number" step="any" class="form-input ov-thresh" value="${cp.threshold}" placeholder="Thresh" style="padding: 4px 8px; font-size:11px; width:80px; border-color:var(--warning);">
        </div>
      `;
    }

    // Flag back to master logic button if it is a site-added checkpoint (4.4.f)
    const isSiteAdded = cp.id.startsWith('site_add_');
    const flagBtn = isSiteAdded ? `
      <button class="btn btn-secondary" style="font-size:10px; padding:2px 6px; color:var(--secondary); border-color:var(--secondary-glow);" onclick="flagCheckpointToCentralMaster('${siteId}', '${adoptedId}', '${cp.id}', this)" title="Flag this check point to central master library">
        &uparrow; Flag to Central Master
      </button>
    ` : '';

    overridesList.innerHTML += `
      <div class="glass-card" style="padding:12px; margin-bottom:10px; border-style:${isSiteAdded ? 'dashed' : 'solid'};" data-cp-id="${cp.id}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
          <div>
            <div style="font-weight:600; font-size:12px;">${cp.text}</div>
            <div style="font-size:11px; color:var(--text-muted);">${cp.location} | Type: ${cp.type} ${isSiteAdded ? '<strong>(Site-Added)</strong>' : ''}</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
            ${catSelect}
            ${flagBtn}
          </div>
        </div>
        ${numericFields}
      </div>
    `;
  });

  showModal('overrides-modal');
}

function addSiteSpecificCheckpoint() {
  const text = prompt("Enter checkpoint description:");
  const location = prompt("Enter location (e.g. ICR Cabin, Tank Ground):");
  if (!text || !location) return;

  const siteId = document.getElementById('override-site-id').value;
  const adoptedId = document.getElementById('override-adopted-id').value;

  const site = _appState.sites.find(s => s.id === siteId);
  const ac = site.adoptedChecklists.find(item => item.id === adoptedId);

  const newCpId = 'site_add_' + Date.now();
  ac.checkpoints.push({
    id: newCpId,
    location,
    text,
    type: 'radio',
    category: 'Medium',
    photoMandatory: false,
    resolveTime: '24 Hours',
    alertRole: 'Site Head'
  });

  syncState();
  showAdoptOverridesModal(siteId, adoptedId); // Refresh modal
}

function flagCheckpointToCentralMaster(siteId, adoptedId, cpId, btn) {
  const site = _appState.sites.find(s => s.id === siteId);
  const ac = site.adoptedChecklists.find(item => item.id === adoptedId);
  const cp = ac.checkpoints.find(item => item.id === cpId);
  const master = _appState.masterChecklists.find(m => m.id === ac.masterId);

  if (!site || !ac || !cp || !master) return;

  // Insert this checkpoint into the Master library template
  const newMasterCp = {
    id: 'master_feed_' + Date.now(),
    location: cp.location,
    text: cp.text,
    type: cp.type,
    category: cp.category,
    photoMandatory: cp.photoMandatory,
    resolveTime: cp.resolveTime,
    alertRole: cp.alertRole
  };

  if (cp.type === 'numeric') {
    newMasterCp.rangeMin = cp.rangeMin;
    newMasterCp.rangeMax = cp.rangeMax;
    newMasterCp.threshold = cp.threshold;
    newMasterCp.unit = cp.unit;
  }

  master.checkpoints.push(newMasterCp);
  
  // Flag visual success on btn
  btn.innerHTML = 'Flagged Successfully <i class="hgi-stroke hgi-tick-01"></i>';
  btn.disabled = true;
  btn.style.color = 'var(--success)';
  btn.style.borderColor = 'rgba(16, 185, 129, 0.3)';

  syncState();
  renderMasterChecklistLibrary(); // Update library card stats
}

function saveOverrides() {
  const siteId = document.getElementById('override-site-id').value;
  const adoptedId = document.getElementById('override-adopted-id').value;

  const site = _appState.sites.find(s => s.id === siteId);
  const ac = site.adoptedChecklists.find(item => item.id === adoptedId);

  if (!site || !ac) return;

  const listContainer = document.getElementById('overrides-checkpoints-list');
  const items = listContainer.children;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const cpId = item.getAttribute('data-cp-id');
    const cp = ac.checkpoints.find(item => item.id === cpId);

    if (cp) {
      cp.category = item.querySelector('.ov-cat').value;
      if (cp.type === 'numeric') {
        cp.rangeMin = parseFloat(item.querySelector('.ov-min').value);
        cp.rangeMax = parseFloat(item.querySelector('.ov-max').value);
        cp.threshold = parseFloat(item.querySelector('.ov-thresh').value);
      }
    }
  }

  syncState();
  hideModal('overrides-modal');
  renderAdoptionPage();
}
