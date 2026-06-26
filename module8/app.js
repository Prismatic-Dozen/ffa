// ===== MAIN ROUTER AND INITIALIZATION =====

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const el = document.getElementById(pageId);
  if (el) el.classList.add('active');
  
  const nav = document.querySelector('[data-page="' + pageId + '"]');
  if (nav) nav.classList.add('active');
  
  const titles = { 
    'overview-page': 'Incident Reporting Dashboard',
    'incidents-page': 'Tripping & Outage Log'
  };
  
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = titles[pageId] || 'Dashboard';
  }
  
  if (pageId === 'overview-page') {
    renderDashboard();
  } else if (pageId === 'incidents-page') {
    renderIncidentsTable();
  }
}

// ===== NAVIGATION CLICKS =====
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('nav-item') || e.target.closest('.nav-item')) {
    const nav = e.target.classList.contains('nav-item') ? e.target : e.target.closest('.nav-item');
    const page = nav.getAttribute('data-page');
    if (page) switchPage(page);
  }
});

// ===== THEME MANAGEMENT =====
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
  const activeTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', activeTheme);
  updateThemeIcon(activeTheme);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  if (theme === 'light') {
    btn.innerHTML = `<svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  } else {
    btn.innerHTML = `<svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  }
}

// ===== MOBILE EMULATOR CONTROLLER =====
let activeUser = null;
let simulatedSiteName = '';
let integrationLogs = [];

const SITE_TEAMS_MAPPING = {
  'amit.patel@cleanenergy.com': { name: 'Amit Patel', site: 'Rajasthan Solar Plant', role: 'Field Technician' },
  'suresh.g@cleanenergy.com': { name: 'Suresh G.', site: 'Gujarat Wind Farm', role: 'Field Technician' },
  'sanjay.mehta@cleanenergy.com': { name: 'Sanjay Mehta', site: 'Gujarat Wind Farm', role: 'Site Head' }
};

function renderEmulator() {
  const container = document.getElementById('mobile-flow-container');
  if (!container) return;
  
  if (!activeUser) {
    // Render Login Screen
    container.innerHTML = `
      <div style="text-align:center; padding-top:40px; flex-grow:1; display:flex; flex-direction:column; justify-content:center;">
        <i class="hgi-stroke hgi-safety-goggles" style="font-size:38px; color:var(--primary); margin-bottom:14px;"></i>
        <h4 style="font-size:14px; font-weight:700; margin-bottom:4px;">Field Incident Reporter</h4>
        <p style="font-size:11px; color:var(--text2); margin-bottom:20px; padding:0 20px;">Select operator to simulate incident reports</p>
        
        <div style="display:flex; flex-direction:column; gap:10px; padding:0 12px;">
          ${Object.keys(SITE_TEAMS_MAPPING).map(email => {
            const u = SITE_TEAMS_MAPPING[email];
            return `
              <button class="btn btn-secondary" style="justify-content:space-between; font-size:11px;" onclick="handleEmulatorLogin('${email}')">
                <span>${u.name} <span style="font-size:9px;color:var(--muted)">(${u.site})</span></span>
                <i class="hgi-stroke hgi-arrow-right-02" style="font-size:12px;"></i>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else {
    // Render Incident Reporting Form (Mobile Form)
    const user = SITE_TEAMS_MAPPING[activeUser];
    const nowStr = new Date().toISOString().substring(0, 16);
    
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; flex-grow:1;">
        <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06); margin-bottom:12px;">
          <span style="font-size:11px; font-weight:700; color:var(--primary-l);"><i class="hgi-stroke hgi-user"></i> ${user.name}</span>
          <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:9px;" onclick="handleEmulatorLogout()">Logout</button>
        </div>

        <form id="mobile-report-form" onsubmit="handleMobileSubmitIncident(event)" style="display:flex; flex-direction:column; gap:8px; flex-grow:1; justify-content:space-between;">
          <div style="overflow-y:auto; max-height:430px; padding-right:2px;" class="phone-screen-scroll">
            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label" style="font-size:10px;">Site Name (Auto)</label>
              <input type="text" class="form-inp" id="m-site-name" value="${user.site}" style="font-size:11px; padding:6px 10px;" readonly>
            </div>

            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label" style="font-size:10px;">Equipment Tripped *</label>
              <select class="form-sel" id="m-equip-type" onchange="populateEquipNames()" style="font-size:11px; padding:6px 10px;" required>
                <option value="Inverter">Inverter</option>
                <option value="Block">Block</option>
                <option value="Power Transformer">Power Transformer</option>
                <option value="Grid Failure">Grid Failure</option>
                <option value="Grid Outage">Grid Outage</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label" style="font-size:10px;">Specific Equipment *</label>
              <select class="form-sel" id="m-equip-name" style="font-size:11px; padding:6px 10px;" required>
                <!-- Dynamically Populated -->
              </select>
            </div>

            <div class="form-row" style="gap:8px; margin-bottom:8px;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:10px;">MW Impacted *</label>
                <input type="number" class="form-inp" id="m-mw" step="0.1" min="0.1" value="2.5" style="font-size:11px; padding:6px 10px;" required>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:10px;">Expected Downtime *</label>
                <input type="text" class="form-inp" id="m-downtime" placeholder="e.g. 02:00" style="font-size:11px; padding:6px 10px;" oninput="calculateRestorationTime()" required>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label" style="font-size:10px;">Incident Start Time *</label>
              <input type="datetime-local" class="form-inp" id="m-start-time" value="${nowStr}" style="font-size:11px; padding:6px 10px;" onchange="calculateRestorationTime()" required>
            </div>

            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label" style="font-size:10px;">Expected Restoration</label>
              <input type="text" class="form-inp" id="m-restoration" style="font-size:11px; padding:6px 10px;" readonly>
            </div>

            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label" style="font-size:10px;">Additional Remarks</label>
              <textarea class="form-textarea" id="m-remarks" style="font-size:11px; min-height:45px;" placeholder="Remarks..."></textarea>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-sm" style="justify-content:center; width:100%; margin-top:6px;">
            <i class="hgi-stroke hgi-satellite-02"></i> Broadcast Incident &amp; Push
          </button>
        </form>
      </div>
    `;
    
    populateEquipNames();
    calculateRestorationTime();
  }
}

function handleEmulatorLogin(email) {
  activeUser = email;
  simulatedSiteName = SITE_TEAMS_MAPPING[email].site;
  renderEmulator();
}

function handleEmulatorLogout() {
  activeUser = null;
  renderEmulator();
}

function populateEquipNames() {
  const type = document.getElementById('m-equip-type').value;
  const nameSel = document.getElementById('m-equip-name');
  if (!nameSel) return;
  
  nameSel.innerHTML = '';
  
  let options = [];
  if (simulatedSiteName === 'Rajasthan Solar Plant') {
    if (type === 'Inverter') options = ['ICR1-INV-1', 'ICR1-INV-2'];
    else if (type === 'Block') options = ['Block 1', 'Block 2'];
    else if (type === 'Power Transformer') options = ['TR-1'];
    else options = ['Switchyard-Breaker-1'];
  } else {
    if (type === 'Inverter' || type === 'Block') options = ['WTG-A1', 'WTG-B2'];
    else if (type === 'Power Transformer') options = ['Main-Transformer-TX- गुजरात'];
    else options = ['Line-Breaker- Gujarat'];
  }
  
  options.forEach(opt => {
    nameSel.innerHTML += `<option value="${opt}">${opt}</option>`;
  });
}

function calculateRestorationTime() {
  const startTimeVal = document.getElementById('m-start-time').value;
  const downtimeVal = document.getElementById('m-downtime').value.trim();
  const restInput = document.getElementById('m-restoration');
  if (!restInput || !startTimeVal) return;
  
  // Format check for downtime HH:MM
  const timeRegex = /^([0-9]{1,2}):([0-5][0-9])$/;
  if (!timeRegex.test(downtimeVal)) {
    restInput.value = 'Waiting for valid HH:MM...';
    return;
  }
  
  const matches = downtimeVal.match(timeRegex);
  const hours = parseInt(matches[1]);
  const minutes = parseInt(matches[2]);
  
  const startDate = new Date(startTimeVal);
  const restorationDate = new Date(startDate.getTime() + (hours * 60 + minutes) * 60 * 1000);
  
  // Format to standard datetime local string
  const formatStr = restorationDate.getFullYear() + '-' +
    String(restorationDate.getMonth() + 1).padStart(2, '0') + '-' +
    String(restorationDate.getDate()).padStart(2, '0') + ' ' +
    String(restorationDate.getHours()).padStart(2, '0') + ':' +
    String(restorationDate.getMinutes()).padStart(2, '0');
    
  restInput.value = formatStr;
}

function handleMobileSubmitIncident(e) {
  e.preventDefault();
  
  const user = SITE_TEAMS_MAPPING[activeUser];
  const equipType = document.getElementById('m-equip-type').value;
  const equipName = document.getElementById('m-equip-name').value;
  const mwImpact = parseFloat(document.getElementById('m-mw').value);
  const downtime = document.getElementById('m-downtime').value;
  const startTime = document.getElementById('m-start-time').value;
  const restoration = document.getElementById('m-restoration').value;
  const remarks = document.getElementById('m-remarks').value.trim();
  
  if (restoration.startsWith('Waiting')) {
    alert('Please enter expected downtime in correct HH:MM format.');
    return;
  }
  
  const newIncident = {
    id: 'INC00' + (_state.incidents.length + 1),
    siteName: user.site,
    equipType: equipType,
    equipName: equipName,
    mwImpact: mwImpact,
    startTime: startTime.replace('T', ' '),
    downtime: downtime,
    restorationTime: restoration,
    remarks: remarks || 'No remarks provided.',
    status: 'Active',
    actualRestoration: '',
    pushedToCreams: true,
    loggedBy: user.name
  };
  
  _state.incidents.unshift(newIncident);
  syncState();
  
  // Add integration logs
  const timestamp = new Date().toLocaleTimeString();
  integrationLogs.unshift({
    title: 'F&S System Notification Broadcasted',
    desc: `[${timestamp}] Tripping event reported at ${user.site}. Equipment: ${equipName}. Impact: ${mwImpact} MW. Expected Restoration: ${restoration}. F&S systems alerted.`,
    isCreams: false
  });
  
  integrationLogs.unshift({
    title: 'CREAMS Cloud Push Successful',
    desc: `[${timestamp}] Site: ${user.site} | Tripping Details logged | MW Impact: ${mwImpact} | Status: Pushed. Payload matches API spec.`,
    isCreams: true
  });
  
  // Reset Mobile view
  selectedTaskForClosure = null;
  renderEmulator();
  
  // Refresh Desktop
  renderDashboard();
  renderIncidentsTable();
  renderIntegrationStream();
}

// ===== DESKTOP PANEL RENDERING =====

function renderDashboard() {
  const total = _state.incidents.length;
  const active = _state.incidents.filter(i => i.status === 'Active').length;
  
  // Sum MW Impacted for currently active incidents
  const totalMW = _state.incidents.filter(i => i.status === 'Active')
                                  .reduce((sum, i) => sum + i.mwImpact, 0);
  
  const totEl = document.getElementById('stat-total');
  const actEl = document.getElementById('stat-active');
  const mwEl = document.getElementById('stat-mw');
  const activeBadge = document.getElementById('active-incident-badge');
  
  if (totEl) totEl.textContent = total;
  if (actEl) actEl.textContent = active;
  if (mwEl) mwEl.textContent = totalMW.toFixed(1) + ' MW';
  if (activeBadge) activeBadge.textContent = active;
}

function renderIntegrationStream() {
  const container = document.getElementById('integration-log-stream');
  if (!container) return;
  
  if (integrationLogs.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--muted); font-size:12px;">No telemetry payloads broadcasted yet. Submit an incident from the phone simulator to test.</div>`;
    return;
  }
  
  container.innerHTML = integrationLogs.map(log => `
    <div class="notif-box" style="border-left: 3px solid ${log.isCreams ? 'var(--primary)' : 'var(--indigo)'};">
      <div class="notif-title" style="color: ${log.isCreams ? 'var(--primary-l)' : 'var(--indigo)'};">${log.title}</div>
      <div class="notif-desc">${log.desc}</div>
    </div>
  `).join('');
}

// ===== INCIDENTS LOG TABLE =====

function renderIncidentsTable() {
  const tbody = document.getElementById('incidents-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const query = document.getElementById('incidents-search').value.toLowerCase().trim();
  const statusFilter = document.getElementById('incidents-filter-status').value;
  
  const filtered = _state.incidents.filter(i => {
    const matchesSearch = i.siteName.toLowerCase().includes(query) || i.equipName.toLowerCase().includes(query) || i.equipType.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--muted);">No reported incidents found.</td></tr>`;
    return;
  }
  
  filtered.forEach(i => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${i.siteName}</strong></td>
        <td>${i.equipType}</td>
        <td><span style="font-family: monospace; font-size: 11px;">${i.equipName}</span></td>
        <td style="color:#fbbf24; font-weight:700;">${i.mwImpact} MW</td>
        <td>${i.startTime.replace('T', ' ')}</td>
        <td>${i.downtime} Hours</td>
        <td>${i.status === 'Resolved' ? (i.actualRestoration || i.restorationTime) : i.restorationTime}</td>
        <td><span class="badge ${i.status === 'Resolved' ? 'badge-resolved' : 'badge-active'}">${i.status}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openUpdateModal('${i.id}')" ${i.status === 'Resolved' ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            <i class="hgi-stroke hgi-edit-02"></i> Update
          </button>
        </td>
      </tr>
    `;
  });
}

// ===== MODAL MANAGER =====
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

function openUpdateModal(incidentId) {
  const incident = _state.incidents.find(i => i.id === incidentId);
  if (!incident) return;
  
  document.getElementById('edit-incident-id').value = incidentId;
  document.getElementById('edit-start-time').value = incident.startTime;
  document.getElementById('edit-downtime').value = incident.downtime;
  document.getElementById('edit-status').value = incident.status;
  document.getElementById('edit-remarks').value = incident.remarks;
  
  // Set actual time default
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('edit-actual-time').value = now.toISOString().slice(0, 16);
  
  toggleEditActualTime();
  showModal('update-restoration-modal');
}

function toggleEditActualTime() {
  const status = document.getElementById('edit-status').value;
  const group = document.getElementById('edit-actual-group');
  if (group) {
    group.style.display = status === 'Resolved' ? 'block' : 'none';
  }
}

function saveIncidentUpdate() {
  const id = document.getElementById('edit-incident-id').value;
  const downtime = document.getElementById('edit-downtime').value.trim();
  const status = document.getElementById('edit-status').value;
  const remarks = document.getElementById('edit-remarks').value.trim();
  const actualTime = document.getElementById('edit-actual-time').value;
  
  // Validate downtime HH:MM
  const timeRegex = /^([0-9]{1,2}):([0-5][0-9])$/;
  if (!timeRegex.test(downtime)) {
    alert('Please enter expected downtime in correct HH:MM format.');
    return;
  }
  
  if (!remarks) {
    alert('Please provide update remarks.');
    return;
  }
  
  const idx = _state.incidents.findIndex(i => i.id === id);
  if (idx !== -1) {
    const incident = _state.incidents[idx];
    
    // Recalculate Expected Restoration
    const matches = downtime.match(timeRegex);
    const hours = parseInt(matches[1]);
    const minutes = parseInt(matches[2]);
    const startDate = new Date(incident.startTime);
    const restorationDate = new Date(startDate.getTime() + (hours * 60 + minutes) * 60 * 1000);
    const formatStr = restorationDate.getFullYear() + '-' +
      String(restorationDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(restorationDate.getDate()).padStart(2, '0') + ' ' +
      String(restorationDate.getHours()).padStart(2, '0') + ':' +
      String(restorationDate.getMinutes()).padStart(2, '0');
      
    _state.incidents[idx].downtime = downtime;
    _state.incidents[idx].status = status;
    _state.incidents[idx].remarks = remarks;
    _state.incidents[idx].restorationTime = formatStr;
    
    if (status === 'Resolved') {
      _state.incidents[idx].actualRestoration = actualTime.replace('T', ' ');
    } else {
      _state.incidents[idx].actualRestoration = '';
    }
    
    syncState();
    hideModal('update-restoration-modal');
    
    // Pushed logs
    const timestamp = new Date().toLocaleTimeString();
    integrationLogs.unshift({
      title: 'CREAMS Broadcast Update Successful',
      desc: `[${timestamp}] Incident ID: ${id} | Site: ${incident.siteName} | Status Updated to ${status} | Expected Restoration: ${formatStr}. Telemetry Sync Success.`,
      isCreams: true
    });
    
    integrationLogs.unshift({
      title: 'F&S System Update Dispatched',
      desc: `[${timestamp}] Updated restoration telemetry sent to F&S for Site: ${incident.siteName}. Outage window recalculated.`,
      isCreams: false
    });
    
    // Refresh Dashboards
    renderDashboard();
    renderIncidentsTable();
    renderIntegrationStream();
  }
}

// ===== DOM LOAD TRIGGER =====
document.addEventListener('DOMContentLoaded', () => {
  initState();
  initTheme();
  
  // Set initial mock logs
  const timestamp = new Date().toLocaleTimeString();
  integrationLogs = [
    {
      title: 'CREAMS Cloud Push Successful',
      desc: `[${timestamp}] Site: Gujarat Wind Farm | Tripping details logged | MW Impact: 50.0 | Status: Resolved.`,
      isCreams: true
    },
    {
      title: 'F&S System Notification Broadcasted',
      desc: `[${timestamp}] Grid outage event resolved at Gujarat Wind Farm. Restored at 2026-06-26 10:15. F&S system updated.`,
      isCreams: false
    }
  ];
  
  renderDashboard();
  renderEmulator();
  renderIncidentsTable();
  renderIntegrationStream();
});
