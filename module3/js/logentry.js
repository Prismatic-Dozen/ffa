// ===== NEW LOG ENTRY WORKFLOWS =====

let tempAnomalies = [];
let tempFollowups = [];

function initLogEntryForm() {
  const dateEl = document.getElementById('log-date');
  if (dateEl) {
    dateEl.value = new Date().toISOString().slice(0, 10);
  }
  
  const weatherEl = document.getElementById('log-weather');
  const gridEl = document.getElementById('log-grid');
  if (weatherEl) weatherEl.value = '';
  if (gridEl) gridEl.value = '';
  
  // Clear activity rows
  const actContainer = document.getElementById('activities-rows');
  if (actContainer) {
    actContainer.innerHTML = '';
    // Add first row
    addActivityRow();
  }
  
  // Reset temp lists
  tempAnomalies = [];
  tempFollowups = [];
  
  renderTempAnomalies();
  renderTempFollowups();
  populateLogEntryDropdowns();
}

function populateLogEntryDropdowns() {
  const equipSel = document.getElementById('anom-equip');
  if (equipSel) {
    equipSel.innerHTML = '<option value="">-- Select Equipment --</option>';
    _state.assets.filter(a => a.parent !== null).forEach(a => {
      equipSel.innerHTML += '<option value="' + a.id + '">' + a.naming + ' — ' + a.name + '</option>';
    });
  }
}

// Activity Rows
function addActivityRow() {
  const container = document.getElementById('activities-rows');
  if (!container) return;
  
  const idx = container.children.length;
  const row = document.createElement('div');
  row.className = 'dynamic-row';
  row.innerHTML = `
    <select class="form-sel" style="flex: 0 0 150px;" required>
      <option value="Generation">Generation</option>
      <option value="Maintenance">Maintenance</option>
      <option value="Grid Status">Grid Status</option>
      <option value="Weather">Weather</option>
      <option value="Safety">Safety</option>
      <option value="OEM/Contractor">OEM/Contractor</option>
    </select>
    <input type="text" class="form-inp" placeholder="Describe the plant activity narrative..." required>
    <button type="button" class="btn btn-danger btn-sm" onclick="removeActivityRow(this)"><i class="hgi-stroke hgi-cancel-01"></i></button>
  `;
  container.appendChild(row);
}

function removeActivityRow(btn) {
  const container = document.getElementById('activities-rows');
  if (!container || container.children.length <= 1) {
    alert('At least one activity entry is required.');
    return;
  }
  btn.closest('.dynamic-row').remove();
}

// Anomaly temporary list handlers
function addAnomalyToTemp() {
  const equipSel = document.getElementById('anom-equip');
  const descEl = document.getElementById('anom-desc');
  const sevSel = document.getElementById('anom-severity');
  
  if (!equipSel || !descEl || !sevSel) return;
  
  const equipId = equipSel.value;
  const desc = descEl.value.trim();
  const severity = sevSel.value;
  
  if (!equipId) { alert('Please select an equipment.'); return; }
  if (!desc) { alert('Please describe the abnormality.'); return; }
  
  tempAnomalies.push({
    equipId: equipId,
    description: desc,
    severity: severity
  });
  
  // Clear fields
  equipSel.value = '';
  descEl.value = '';
  sevSel.value = 'Medium';
  
  renderTempAnomalies();
}

function removeAnomalyFromTemp(idx) {
  tempAnomalies.splice(idx, 1);
  renderTempAnomalies();
}

function renderTempAnomalies() {
  const tbody = document.getElementById('temp-anom-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (tempAnomalies.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);">No anomalies recorded for this entry</td></tr>';
    return;
  }
  
  tempAnomalies.forEach((a, i) => {
    const asset = _state.assets.find(as => as.id === a.equipId);
    tbody.innerHTML += `
      <tr>
        <td><strong>${asset ? asset.naming : '—'}</strong></td>
        <td>${a.description}</td>
        <td><span class="badge badge-${a.severity.toLowerCase()}">${a.severity}</span></td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeAnomalyFromTemp(${i})"><i class="hgi-stroke hgi-cancel-01"></i></button></td>
      </tr>
    `;
  });
}

// Follow-up temporary list handlers
function addFollowupToTemp() {
  const descEl = document.getElementById('fup-desc');
  const assignEl = document.getElementById('fup-assignee');
  const dueEl = document.getElementById('fup-due');
  
  if (!descEl || !assignEl || !dueEl) return;
  
  const desc = descEl.value.trim();
  const assignedTo = assignEl.value.trim();
  const dueDate = dueEl.value;
  
  if (!desc) { alert('Please describe the follow-up task.'); return; }
  if (!assignedTo) { alert('Please enter an assignee name.'); return; }
  if (!dueDate) { alert('Please select a due date.'); return; }
  
  tempFollowups.push({
    desc: desc,
    assignedTo: assignedTo,
    dueDate: dueDate,
    status: 'Open',
    closureNotes: ''
  });
  
  // Clear fields
  descEl.value = '';
  assignEl.value = '';
  dueEl.value = '';
  
  renderTempFollowups();
}

function removeFollowupFromTemp(idx) {
  tempFollowups.splice(idx, 1);
  renderTempFollowups();
}

function renderTempFollowups() {
  const tbody = document.getElementById('temp-fup-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (tempFollowups.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);">No follow-ups requested for this entry</td></tr>';
    return;
  }
  
  tempFollowups.forEach((f, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${f.desc}</td>
        <td>${f.assignedTo}</td>
        <td>${f.dueDate}</td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeFollowupFromTemp(${i})"><i class="hgi-stroke hgi-cancel-01"></i></button></td>
      </tr>
    `;
  });
}

// Form Submission
function saveLogBookEntry(e) {
  if (e) e.preventDefault();
  
  const dateVal = document.getElementById('log-date').value;
  const shiftVal = document.getElementById('log-shift').value;
  const weatherVal = document.getElementById('log-weather').value;
  const gridVal = document.getElementById('log-grid').value;
  
  if (!dateVal) { alert('Log date is required.'); return; }
  
  // Compile activities
  const actRows = document.querySelectorAll('#activities-rows .dynamic-row');
  const activities = [];
  actRows.forEach(row => {
    const type = row.querySelector('select').value;
    const desc = row.querySelector('input').value.trim();
    if (desc) {
      activities.push({ type, desc });
    }
  });
  
  if (activities.length === 0) {
    alert('At least one plant activity narrative is required.');
    return;
  }
  
  // Assign IDs to followups
  const finalFollowups = tempFollowups.map((f, i) => {
    return {
      id: 'F_' + Date.now() + '_' + i,
      desc: f.desc,
      assignedTo: f.assignedTo,
      dueDate: f.dueDate,
      status: 'Open',
      closureNotes: ''
    };
  });
  
  const newLog = {
    id: 'L_' + Date.now(),
    date: dateVal,
    shift: shiftVal,
    weather: weatherVal || 'Not recorded',
    gridStatus: gridVal || 'Not recorded',
    activities: activities,
    anomalies: [...tempAnomalies],
    followups: finalFollowups
  };
  
  _state.logs.push(newLog);
  syncState();
  
  alert('Daily Log Book entry saved successfully!');
  
  // Update views
  initLogEntryForm();
  renderDashboard();
  renderReviewList();
  
  // Redirect to Dashboard
  switchPage('overview-page');
}
