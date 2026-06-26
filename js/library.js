// --- Library Page Operations (Master Templates & Checkpoints Designer) ---

function renderMasterChecklistLibrary() {
  const container = document.getElementById('checklists-container');
  if (!container) return;

  const searchQuery = document.getElementById('checklist-search').value.toLowerCase();
  const filterFreq = document.getElementById('checklist-filter-freq').value;

  container.innerHTML = '';

  const filtered = _appState.masterChecklists.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery) || c.desc.toLowerCase().includes(searchQuery);
    const matchesFreq = filterFreq === 'all' || c.freqId === filterFreq;
    return matchesSearch && matchesFreq;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <p style="color: var(--text-secondary);">No master templates available matching search criteria.</p>
        <button class="btn btn-primary" style="margin-top: 15px;" onclick="showCreateMasterModal()">Create Master Template</button>
      </div>
    `;
    return;
  }

  filtered.forEach(c => {
    const frequency = _appState.frequencies.find(f => f.id === c.freqId) || { name: 'One Time', code: 'one_time' };
    const frequencyClass = frequency.code.replace(/_/g, '-');
    const namingRuleText = c.adoptName ? `Adopt: ${c.namingRule}` : 'Standard Name';
    
    container.innerHTML += `
      <div class="glass-card checklist-card">
        <div class="checklist-card-header">
          <div>
            <h3 class="checklist-name-title" style="font-size:16px;">${c.name}</h3>
            <span class="frequency-badge ${frequencyClass}">${frequency.name}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="btn btn-secondary btn-icon" onclick="showEditMasterModal('${c.id}')" title="Edit Template & Checkpoints">
              <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: currentColor; fill:none;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-danger btn-icon" onclick="deleteMasterChecklist('${c.id}')" title="Delete Template">
              <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: var(--danger); fill:none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
        <p class="checklist-description" style="font-size:12px;">${c.desc}</p>
        <div class="checklist-meta-details" style="font-size:11px; margin-bottom:12px; padding-top:8px;">
          <div class="meta-row">
            <span>Equipment Category:</span>
            <span class="meta-value">${c.equipmentCategory || 'General'} (${c.rating || 'N/A'})</span>
          </div>
          <div class="meta-row">
            <span>Naming Policy:</span>
            <span class="meta-value adopted" style="font-size:10px;">${namingRuleText}</span>
          </div>
          <div class="meta-row">
            <span>Checkpoints Count:</span>
            <span class="meta-value" style="font-weight:600; color:var(--primary);">${c.checkpoints ? c.checkpoints.length : 0} items</span>
          </div>
        </div>
        <div class="checklist-card-actions">
          <button class="btn btn-secondary" style="flex:1; font-size:11px; padding: 6px;" onclick="showAdoptionModalForTemplate('${c.id}')">
            Adopt for Site
          </button>
        </div>
      </div>
    `;
  });
}

function showCreateMasterModal() {
  if (!checkAccess('create')) {
    alert("Access Denied: Current role does not have template creation permissions.");
    return;
  }

  document.getElementById('checklist-modal-title').textContent = "Create Master Checklist & Checkpoints";
  document.getElementById('checklist-edit-id').value = "";
  document.getElementById('checklist-name').value = "";
  document.getElementById('checklist-desc').value = "";
  document.getElementById('checklist-equip-category').value = "Inverter";
  document.getElementById('checklist-rating-val').value = "Standard";
  document.getElementById('checklist-freq').selectedIndex = 0;
  
  const adoptCheckbox = document.getElementById('checklist-adopt');
  adoptCheckbox.checked = false;
  document.getElementById('checklist-naming-rule').value = "";
  document.getElementById('naming-tokens-section').style.display = "none";

  const cpContainer = document.getElementById('modal-checkpoints-container');
  cpContainer.innerHTML = '';
  
  // Seed a couple of empty checkpoints rows
  addCheckpointConfigRow();
  addCheckpointConfigRow();

  showModal('checklist-modal');
}

function showEditMasterModal(id) {
  if (!checkAccess('edit')) {
    alert("Access Denied: Current role does not have template modification permissions.");
    return;
  }

  const c = _appState.masterChecklists.find(item => item.id === id);
  if (!c) return;

  document.getElementById('checklist-modal-title').textContent = "Edit Master Checklist & Checkpoints";
  document.getElementById('checklist-edit-id').value = c.id;
  document.getElementById('checklist-name').value = c.name;
  document.getElementById('checklist-desc').value = c.desc;
  document.getElementById('checklist-equip-category').value = c.equipmentCategory || 'Inverter';
  document.getElementById('checklist-rating-val').value = c.rating || 'Standard';
  
  // Set frequency dropdown
  const freqSelect = document.getElementById('checklist-freq');
  for (let i = 0; i < freqSelect.options.length; i++) {
    if (freqSelect.options[i].value === c.freqId) {
      freqSelect.selectedIndex = i;
      break;
    }
  }

  // Set site adoption config
  const adoptCheckbox = document.getElementById('checklist-adopt');
  adoptCheckbox.checked = c.adoptName;
  document.getElementById('checklist-naming-rule').value = c.namingRule || "";
  
  toggleAdoptionNamingConfig();
  updateModalNamingPreview();

  // Populate checkpoints rows
  const cpContainer = document.getElementById('modal-checkpoints-container');
  cpContainer.innerHTML = '';
  
  if (c.checkpoints && c.checkpoints.length > 0) {
    c.checkpoints.forEach(cp => addCheckpointConfigRow(cp));
  } else {
    addCheckpointConfigRow();
  }

  showModal('checklist-modal');
}

function addCheckpointConfigRow(cpData = null) {
  const container = document.getElementById('modal-checkpoints-container');
  const rowId = 'cp_row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

  const defaults = {
    location: '',
    text: '',
    type: 'radio', // radio, numeric
    category: 'Medium', // Critical, High, Medium, Low
    photoMandatory: false,
    rangeMin: '',
    rangeMax: '',
    threshold: '',
    resolveTime: '24 Hours',
    alertRole: 'Site Head'
  };

  const val = Object.assign({}, defaults, cpData);

  const row = document.createElement('div');
  row.className = 'glass-card';
  row.style.padding = '16px';
  row.style.marginBottom = '12px';
  row.style.borderStyle = 'dashed';
  row.id = rowId;

  // Numeric details are conditionally rendered
  const numericDisplay = val.type === 'numeric' ? 'grid' : 'none';

  row.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <span style="font-size:11px; font-weight:700; color:var(--primary);">CHECKPOINT CONFIG</span>
      <button class="btn btn-danger btn-icon" style="padding:0; width:28px; height:28px;" onclick="removeCheckpointConfigRow('${rowId}')" title="Remove Checkpoint">
        <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: currentColor; fill:none; stroke-width: 2.5;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    
    <div class="form-row">
      <div class="form-group" style="margin-bottom:8px;">
        <label class="form-label" style="font-size:10px;">Location / Area</label>
        <input type="text" class="form-input cp-loc" value="${val.location.replace(/"/g, '&quot;')}" placeholder="e.g. ICR Cabin, Earth Pit">
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label class="form-label" style="font-size:10px;">Checkpoint Description</label>
        <input type="text" class="form-input cp-text" value="${val.text.replace(/"/g, '&quot;')}" placeholder="e.g. Check for leakage, enter voltage">
      </div>
    </div>

    <div class="form-row" style="grid-template-columns: 1fr 1fr 1fr; margin-bottom:8px;">
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label" style="font-size:10px;">Response Type</label>
        <select class="form-select-styled cp-type" onchange="toggleCheckpointTypeUI('${rowId}', this.value)" style="padding: 6px 10px;">
          <option value="radio" ${val.type === 'radio' ? 'selected' : ''}>OK / Not OK (Radio)</option>
          <option value="numeric" ${val.type === 'numeric' ? 'selected' : ''}>Numerical Parameter</option>
        </select>
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label" style="font-size:10px;">Severity Category</label>
        <select class="form-select-styled cp-cat" style="padding: 6px 10px;">
          <option value="Critical" ${val.category === 'Critical' ? 'selected' : ''}>Critical Severity</option>
          <option value="High" ${val.category === 'High' ? 'selected' : ''}>High Severity</option>
          <option value="Medium" ${val.category === 'Medium' ? 'selected' : ''}>Medium Severity</option>
          <option value="Low" ${val.category === 'Low' ? 'selected' : ''}>Low Severity</option>
        </select>
      </div>
      <div class="form-group" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:center;">
        <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; cursor:pointer; margin-top:14px;">
          <input type="checkbox" class="cp-photo" ${val.photoMandatory ? 'checked' : ''}> Mandatory Photo
        </label>
      </div>
    </div>

    <!-- Numeric parameters threshold configuration (4.2.f) -->
    <div class="form-row cp-numeric-details" style="display:${numericDisplay}; grid-template-columns: 1fr 1fr 1fr; margin-top:8px; border-top:1px solid var(--border-color); padding-top:8px;">
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label" style="font-size:10px; color:var(--text-muted);">Valid Range Min</label>
        <input type="number" step="any" class="form-input cp-min" value="${val.rangeMin}" placeholder="e.g. 15">
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label" style="font-size:10px; color:var(--text-muted);">Valid Range Max</label>
        <input type="number" step="any" class="form-input cp-max" value="${val.rangeMax}" placeholder="e.g. 50">
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label" style="font-size:10px; color:var(--warning);">Alert Threshold Limit</label>
        <input type="number" step="any" class="form-input cp-thresh" value="${val.threshold}" placeholder="e.g. 45">
      </div>
    </div>

    <!-- Action Escalation configurations (4.2.g & 4.2.h) -->
    <div class="form-row" style="grid-template-columns: 1fr 1fr; margin-top:8px; border-top: 1px solid var(--border-color); padding-top:8px; margin-bottom:0;">
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label" style="font-size:10px; color:var(--text-muted);">Target Resolution Time (Exception)</label>
        <input type="text" class="form-input cp-time" value="${val.resolveTime}" placeholder="e.g. 4 Hours, 2 Days">
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label" style="font-size:10px; color:var(--text-muted);">Escalate Exception Action to</label>
        <input type="text" class="form-input cp-arole" value="${val.alertRole}" placeholder="e.g. Testing Head, O&M Head">
      </div>
    </div>
  `;
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function removeCheckpointConfigRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.remove();
}

function toggleCheckpointTypeUI(rowId, val) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const numDetails = row.querySelector('.cp-numeric-details');
  if (val === 'numeric') {
    numDetails.style.display = 'grid';
  } else {
    numDetails.style.display = 'none';
  }
}

function saveMasterChecklist() {
  const id = document.getElementById('checklist-edit-id').value;
  const name = document.getElementById('checklist-name').value.trim();
  const desc = document.getElementById('checklist-desc').value.trim();
  const equipmentCategory = document.getElementById('checklist-equip-category').value;
  const rating = document.getElementById('checklist-rating-val').value.trim();
  const freqId = document.getElementById('checklist-freq').value;
  const adoptName = document.getElementById('checklist-adopt').checked;
  const namingRule = document.getElementById('checklist-naming-rule').value.trim();

  if (!name) {
    alert("Checklist Name is required.");
    return;
  }

  // Parse checkpoints configurations
  const cpCards = document.getElementById('modal-checkpoints-container').children;
  const checkpoints = [];

  for (let i = 0; i < cpCards.length; i++) {
    const card = cpCards[i];
    const location = card.querySelector('.cp-loc').value.trim();
    const text = card.querySelector('.cp-text').value.trim();
    const type = card.querySelector('.cp-type').value;
    const category = card.querySelector('.cp-cat').value;
    const photoMandatory = card.querySelector('.cp-photo').checked;
    const resolveTime = card.querySelector('.cp-time').value.trim();
    const alertRole = card.querySelector('.cp-arole').value.trim();

    if (!location || !text) {
      alert("All checkpoints must have a Location and description configured.");
      return;
    }

    const cpObj = {
      id: 'cp_' + i + '_' + Date.now(),
      location,
      text,
      type,
      category,
      photoMandatory,
      resolveTime: resolveTime || '24 Hours',
      alertRole: alertRole || 'Site Head'
    };

    if (type === 'numeric') {
      const minVal = parseFloat(card.querySelector('.cp-min').value);
      const maxVal = parseFloat(card.querySelector('.cp-max').value);
      const threshVal = parseFloat(card.querySelector('.cp-thresh').value);

      if (isNaN(minVal) || isNaN(maxVal) || isNaN(threshVal)) {
        alert("Numerical parameters checkpoints must have range limits and threshold values configured.");
        return;
      }

      cpObj.rangeMin = minVal;
      cpObj.rangeMax = maxVal;
      cpObj.threshold = threshVal;
      cpObj.unit = 'units'; // Default fallback units
    }

    checkpoints.push(cpObj);
  }

  if (checkpoints.length === 0) {
    alert("Please add at least one checkpoint.");
    return;
  }

  if (id) {
    // Edit existing template
    const idx = _appState.masterChecklists.findIndex(m => m.id === id);
    if (idx !== -1) {
      _appState.masterChecklists[idx] = { id, name, desc, equipmentCategory, rating, freqId, adoptName, namingRule, checkpoints };
    }
  } else {
    // Create new template
    const newId = 'ch_master_' + Date.now();
    _appState.masterChecklists.push({ id: newId, name, desc, equipmentCategory, rating, freqId, adoptName, namingRule, checkpoints });
  }

  syncState();
  hideModal('checklist-modal');
  renderMasterChecklistLibrary();
  updateStats();
}

function deleteMasterChecklist(id) {
  if (!checkAccess('delete')) {
    alert("Access Denied: Current role does not have template deletion privileges.");
    return;
  }

  if (confirm("Delete this master checklist template from the library? All active sites mapped to this will lose baseline references.")) {
    _appState.masterChecklists = _appState.masterChecklists.filter(m => m.id !== id);
    syncState();
    renderMasterChecklistLibrary();
    updateStats();
  }
}


// --- Frequency Manager UI Controls ---

function renderFrequenciesPage() {
  const container = document.getElementById('frequencies-list-container');
  if (!container) return;

  container.innerHTML = '';

  _appState.frequencies.forEach(f => {
    const isDefault = ['freq_1','freq_2','freq_3','freq_4','freq_5','freq_6','freq_7'].includes(f.id);
    const deleteBtn = isDefault ? '' : `
      <button class="btn btn-danger btn-icon" onclick="deleteFrequency('${f.id}')" title="Delete Frequency">
        <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: var(--danger); fill:none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;

    container.innerHTML += `
      <div class="frequency-item">
        <div class="frequency-left">
          <div class="frequency-dot"></div>
          <div>
            <div class="frequency-name" style="font-size:14px;">${f.name} <code style="font-size:10px; background:var(--border-color); padding:1px 5px; border-radius:3px; margin-left:8px;">${f.code}</code></div>
            <div class="frequency-desc" style="font-size:11px;">${f.desc}</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-icon" onclick="showEditFreqModal('${f.id}')" title="Edit Interval">
            <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: currentColor; fill:none;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          ${deleteBtn}
        </div>
      </div>
    `;
  });
}

function showCreateFreqModal() {
  if (!checkAccess('create')) return;
  document.getElementById('freq-modal-title').textContent = "Configure New Frequency";
  document.getElementById('freq-edit-id').value = "";
  document.getElementById('freq-name').value = "";
  document.getElementById('freq-desc').value = "";
  document.getElementById('freq-code').value = "";
  showModal('freq-modal');
}

function showEditFreqModal(id) {
  if (!checkAccess('edit')) return;
  const f = _appState.frequencies.find(item => item.id === id);
  if (!f) return;

  document.getElementById('freq-modal-title').textContent = "Configure Frequency Interval";
  document.getElementById('freq-edit-id').value = f.id;
  document.getElementById('freq-name').value = f.name;
  document.getElementById('freq-desc').value = f.desc;
  document.getElementById('freq-code').value = f.code;
  showModal('freq-modal');
}

function saveFrequency() {
  const id = document.getElementById('freq-edit-id').value;
  const name = document.getElementById('freq-name').value.trim();
  const desc = document.getElementById('freq-desc').value.trim();
  const code = document.getElementById('freq-code').value.trim().toLowerCase().replace(/ /g, '_');

  if (!name || !code) {
    alert("Name and Interval Code are required.");
    return;
  }

  if (id) {
    const idx = _appState.frequencies.findIndex(f => f.id === id);
    if (idx !== -1) {
      _appState.frequencies[idx] = { id, name, desc, code };
    }
  } else {
    const newId = 'freq_' + Date.now();
    _appState.frequencies.push({ id: newId, name, desc, code });
  }

  syncState();
  hideModal('freq-modal');
  renderFrequenciesPage();
  populateDropdowns();
  updateStats();
}

function deleteFrequency(id) {
  if (!checkAccess('delete')) return;
  if (confirm("Delete this customized frequency option?")) {
    _appState.frequencies = _appState.frequencies.filter(f => f.id !== id);
    syncState();
    renderFrequenciesPage();
    populateDropdowns();
    updateStats();
  }
}

// --- Escalation Levels Matrix Rendering & CRUD ---

function renderEscalationsPage() {
  const container = document.getElementById('escalation-steps-container');
  if (!container) return;

  container.innerHTML = '';

  _appState.escalations.forEach((esc, index) => {
    const channels = [];
    if (esc.email) channels.push('Email');
    if (esc.sms) channels.push('SMS');
    if (esc.app) channels.push('System Push');

    container.innerHTML += `
      <div class="escalation-step">
        <div class="escalation-step-badge">${index + 1}</div>
        <div class="escalation-step-node">
          <div class="escalation-node-info">
            <h4>${esc.name} &rarr; Assigned: <span style="color:var(--primary); font-weight:600;">${esc.role}</span></h4>
            <p>Triggers after <span>${esc.threshold} ${esc.unit}</span> delay | Channels: ${channels.join(', ')}</p>
          </div>
          <div class="escalation-node-actions">
            <button class="btn btn-secondary btn-icon" onclick="showEditEscalationModal('${esc.id}')" title="Edit Escalation Step">
              <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: currentColor; fill:none;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-danger btn-icon" onclick="deleteEscalation('${esc.id}')" title="Delete Step">
              <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: var(--danger); fill:none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  if (_appState.escalations.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="text-align: center; padding: 40px; border-color: rgba(239, 68, 68, 0.25);">
        <p style="color: var(--text-secondary);">No escalation rules configured. Compliance alerts will not trigger.</p>
        <button class="btn btn-primary" style="margin-top: 15px;" onclick="showCreateEscalationModal()">Create Escalation Step</button>
      </div>
    `;
  }
}

function showCreateEscalationModal() {
  if (!checkAccess('create')) return;
  document.getElementById('escalation-modal-title').textContent = "Add Escalation Level";
  document.getElementById('escalation-edit-id').value = "";
  document.getElementById('escalation-level-name').value = `Level ${_appState.escalations.length + 1} Escalation`;
  document.getElementById('escalation-role').value = "";
  document.getElementById('escalation-threshold').value = "";
  document.getElementById('escalation-unit').selectedIndex = 0;
  document.getElementById('escalation-ch-email').checked = true;
  document.getElementById('escalation-ch-sms').checked = false;
  document.getElementById('escalation-ch-app').checked = true;
  showModal('escalation-modal');
}

function showEditEscalationModal(id) {
  if (!checkAccess('edit')) return;
  const esc = _appState.escalations.find(item => item.id === id);
  if (!esc) return;

  document.getElementById('escalation-modal-title').textContent = "Configure Escalation Level";
  document.getElementById('escalation-edit-id').value = esc.id;
  document.getElementById('escalation-level-name').value = esc.name;
  document.getElementById('escalation-role').value = esc.role;
  document.getElementById('escalation-threshold').value = esc.threshold;
  
  const unitSelect = document.getElementById('escalation-unit');
  for (let i = 0; i < unitSelect.options.length; i++) {
    if (unitSelect.options[i].value === esc.unit) {
      unitSelect.selectedIndex = i;
      break;
    }
  }

  document.getElementById('escalation-ch-email').checked = esc.email;
  document.getElementById('escalation-ch-sms').checked = esc.sms;
  document.getElementById('escalation-ch-app').checked = esc.app;

  showModal('escalation-modal');
}

function saveEscalationLevel() {
  const id = document.getElementById('escalation-edit-id').value;
  const name = document.getElementById('escalation-level-name').value.trim();
  const role = document.getElementById('escalation-role').value.trim();
  const threshold = parseFloat(document.getElementById('escalation-threshold').value);
  const unit = document.getElementById('escalation-unit').value;
  const email = document.getElementById('escalation-ch-email').checked;
  const sms = document.getElementById('escalation-ch-sms').checked;
  const app = document.getElementById('escalation-ch-app').checked;

  if (!name || !role || isNaN(threshold)) {
    alert("Level Title, Role, and Threshold delay must be configured.");
    return;
  }

  if (id) {
    const index = _appState.escalations.findIndex(e => e.id === id);
    if (index !== -1) {
      _appState.escalations[index] = { id, name, role, threshold, unit, email, sms, app };
    }
  } else {
    const newId = 'esc_' + Date.now();
    _appState.escalations.push({ id: newId, name, role, threshold, unit, email, sms, app });
  }

  syncState();
  hideModal('escalation-modal');
  renderEscalationsPage();
  updateOverviewStats();
}

function deleteEscalation(id) {
  if (!checkAccess('delete')) return;
  if (confirm("Remove this level from the escalation matrix workflow?")) {
    _appState.escalations = _appState.escalations.filter(e => e.id !== id);
    syncState();
    renderEscalationsPage();
    updateOverviewStats();
  }
}
