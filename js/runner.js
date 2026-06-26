// --- Mobile Field Executor & Compliance Trends Simulator ---

let currentSimChecklistId = '';
let currentSimSiteId = '';
let currentCameraPhoto = {}; // key: checkpointId, value: base64 mock or status

// Distance calculation for geofencing (4.6)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const phi1 = lat1 * Math.PI/180;
  const phi2 = lat2 * Math.PI/180;
  const deltaPhi = (lat2-lat1) * Math.PI/180;
  const deltaLambda = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
}

function initializeRunner() {
  populateRunnerSelectors();
}

function populateRunnerSelectors() {
  const siteSelect = document.getElementById('run-site-select');
  const checklistSelect = document.getElementById('run-checklist-select');
  
  if (!siteSelect || !checklistSelect) return;

  siteSelect.innerHTML = '<option value="">-- Choose Site --</option>';
  _appState.sites.forEach(s => {
    siteSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
  });

  siteSelect.addEventListener('change', () => {
    const siteId = siteSelect.value;
    checklistSelect.innerHTML = '<option value="">-- Choose Checklist --</option>';
    if (siteId) {
      const site = _appState.sites.find(s => s.id === siteId);
      if (site && site.adoptedChecklists) {
        site.adoptedChecklists.forEach(ac => {
          checklistSelect.innerHTML += `<option value="${ac.id}">${ac.name}</option>`;
        });
      }
    }
    renderMobileForm();
  });

  checklistSelect.addEventListener('change', () => {
    renderMobileForm();
  });
}

function toggleOfflineMode(checked) {
  _appState.offlineMode = checked;
  const statusIndicator = document.getElementById('phone-network-status');
  if (statusIndicator) {
    statusIndicator.textContent = checked ? 'Offline mode' : 'Online / Connected';
    statusIndicator.style.color = checked ? '#f59e0b' : '#34d399';
  }

  // Trigger sync from offline queue when switching back online (4.5.a)
  if (!checked && _appState.offlineQueue.length > 0) {
    const overlay = document.getElementById('aws-sync-loader');
    if (overlay) overlay.classList.add('active');
    
    setTimeout(() => {
      if (overlay) overlay.classList.remove('active');
      alert(`Synchronized ${_appState.offlineQueue.length} offline checklist submission(s) to Central AWS cloud database successfully!`);
      _appState.offlineQueue = [];
      renderTicketsTable();
      renderReportsTable();
    }, 1800);
  }
}

// Renders inside the mobile phone preview layout
function renderMobileForm() {
  const container = document.getElementById('mobile-form-container');
  const siteId = document.getElementById('run-site-select').value;
  const adoptedId = document.getElementById('run-checklist-select').value;

  if (!siteId || !adoptedId) {
    container.innerHTML = `
      <div style="text-align:center; padding: 50px 0; color:#718096; font-size:12px;">
        <svg viewBox="0 0 24 24" style="width:36px; height:36px; margin:0 auto 10px auto; stroke:currentColor; fill:none; opacity:0.3;"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        Select Site and Checklist to start field round simulation.
      </div>
    `;
    return;
  }

  const site = _appState.sites.find(s => s.id === siteId);
  const ac = site.adoptedChecklists.find(item => item.id === adoptedId);

  if (!site || !ac) return;

  // Mock Geofencing Distance computation (4.6)
  let distance = 0;
  let geofenceAlert = '';
  
  if (site.equipments && site.equipments.length > 0) {
    // Find matching equipment coordinates
    const equip = site.equipments.find(e => e.name === ac.equipmentName) || site.equipments[0];
    // Mock user GPS offset slightly away
    const userLat = site.geoLatitude + 0.0003;
    const userLng = site.geoLongitude + 0.0003;
    distance = Math.round(calculateDistance(userLat, userLng, equip.latitude, equip.longitude));
  }

  const isLocked = distance < 50;
  if (_appState.geofenceEnabled) {
    geofenceAlert = `
      <div class="phone-gps-box" style="margin-bottom:12px;">
        <span>GPS Distance: <strong>${distance} meters</strong></span>
        <span>${isLocked ? '<span class="gps-indicator locked"></span>In-Range (Valid)' : '<span class="gps-indicator unlocked"></span>Out-of-Bounds (Locked > 50m)'}</span>
      </div>
    `;
  }

  let checkpointsHtml = '';
  ac.checkpoints.forEach((cp, index) => {
    // A. Check if checkpoint had a past exception/ticket reported to highlight it (4.5.d)
    const activeTicket = _appState.tickets.find(t => t.siteId === siteId && t.checkpointId === cp.id && t.status === 'Open');
    
    let warningBanner = '';
    let preselectedRadio = ''; // For pre-selecting Not OK/No based on past ticket
    if (activeTicket) {
      warningBanner = `<span class="exception-highlight-badge">&Delta; Past Exception Open! Pre-selected Not OK</span>`;
      preselectedRadio = 'notok';
    }

    // B. Build Response controls based on response types
    let responseUi = '';
    if (cp.type === 'radio') {
      const isOkChecked = preselectedRadio === 'ok' ? 'active' : '';
      const isNotOkChecked = preselectedRadio === 'notok' ? 'active' : '';
      
      responseUi = `
        <div class="phone-radio-group">
          <button class="phone-radio-btn ok-btn ${isOkChecked}" onclick="selectPhoneRadio('${cp.id}', 'ok', this)">OK / Yes</button>
          <button class="phone-radio-btn not-ok-btn ${isNotOkChecked}" onclick="selectPhoneRadio('${cp.id}', 'notok', this)">Not OK / No</button>
        </div>
        <div id="remarks-box-${cp.id}" style="display:${preselectedRadio === 'notok' ? 'block' : 'none'}; margin-top:8px;">
          <input type="text" class="form-input cp-input-remark" id="remark-${cp.id}" placeholder="Specify details..." style="font-size:11px; padding: 6px;" value="${activeTicket ? activeTicket.remark : ''}">
          <label style="display:flex; align-items:center; gap:6px; font-size:11px; margin-top:6px; color:#a0aec0; cursor:pointer;">
            <input type="checkbox" id="close-ticket-${cp.id}"> Normal conditions restored? (Close ticket)
          </label>
        </div>
      `;
    } else if (cp.type === 'numeric') {
      responseUi = `
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="number" step="any" class="form-input cp-input-num" id="num-${cp.id}" placeholder="Type reading..." oninput="checkNumericThreshold('${cp.id}', ${cp.rangeMin}, ${cp.rangeMax}, ${cp.threshold})" style="font-size:12px; padding: 6px;">
          <span style="font-size:11px; color:#cbd5e0;">${cp.unit || 'units'}</span>
        </div>
        <div id="num-warn-${cp.id}" style="font-size:10px; color:#f59e0b; margin-top:4px; display:none;"></div>
      `;
    }

    // C. Photo trigger
    let photoUi = '';
    const hasPhoto = currentCameraPhoto[cp.id];
    const photoBtnText = cp.photoMandatory ? '<i class="hgi-stroke hgi-camera-01"></i> Capture Mandatory Photo' : '<i class="hgi-stroke hgi-camera-01"></i> Capture Optional Photo';

    if (hasPhoto) {
      photoUi = `
        <div class="phone-photo-preview" style="background-image: url('${hasCameraImagePlaceholder(cp.id)}'); margin-top:8px;">
          <div class="phone-photo-clear" onclick="clearPhonePhoto('${cp.id}')">&times;</div>
        </div>
      `;
    } else {
      photoUi = `
        <div style="margin-top:8px;">
          <div class="phone-photo-box" onclick="capturePhonePhoto('${cp.id}')">${photoBtnText}</div>
        </div>
      `;
    }

    checkpointsHtml += `
      <div class="phone-card" data-cp-id="${cp.id}" data-cp-type="${cp.type}">
        <div class="phone-card-title">
          <span>${cp.text}</span>
          <span style="font-size:10px; color:#a0aec0;">${cp.location}</span>
        </div>
        ${warningBanner}
        ${responseUi}
        ${photoUi}
      </div>
    `;
  });

  container.innerHTML = `
    <div style="margin-bottom:14px;">
      <h3 class="phone-title" style="font-size:15px; margin-bottom:2px;">${ac.name}</h3>
      <span class="phone-subtitle">${site.name} rounds</span>
    </div>

    ${geofenceAlert}

    <div style="display:flex; flex-direction:column;">
      ${checkpointsHtml}
    </div>

    <button class="btn btn-primary" onclick="submitMobileChecklist('${siteId}', '${adoptedId}', ${isLocked})" style="width:100%; margin-top:14px; padding: 10px; font-size:13px;">
      Submit Checklist
    </button>
  `;
}

function selectPhoneRadio(cpId, option, btn) {
  const parent = btn.parentElement;
  parent.querySelectorAll('.phone-radio-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const remarksBox = document.getElementById(`remarks-box-${cpId}`);
  if (option === 'notok') {
    remarksBox.style.display = 'block';
  } else {
    remarksBox.style.display = 'none';
  }
}

function checkNumericThreshold(cpId, min, max, threshold) {
  const input = document.getElementById(`num-${cpId}`);
  const warning = document.getElementById(`num-warn-${cpId}`);
  if (!input || !warning) return;

  const val = parseFloat(input.value);
  if (isNaN(val)) {
    warning.style.display = 'none';
    return;
  }

  if (val < min || val > max) {
    warning.textContent = `Warning: Input outside normal parameters (${min} - ${max})`;
    warning.style.color = '#f59e0b';
    warning.style.display = 'block';
  } else if (val >= threshold) {
    warning.textContent = `Alert: Above critical alert threshold limit (${threshold})!`;
    warning.style.color = '#ef4444';
    warning.style.display = 'block';
  } else {
    warning.style.display = 'none';
  }
}

function capturePhonePhoto(cpId) {
  currentCameraPhoto[cpId] = true;
  renderMobileForm();
}

function clearPhonePhoto(cpId) {
  delete currentCameraPhoto[cpId];
  renderMobileForm();
}

function hasCameraImagePlaceholder(cpId) {
  // Simple fake images (using premium gradients placeholder SVG data)
  return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect width="100%" height="100%" fill="%234A5568"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12">Captured Photo pit_ref_' + cpId.substring(3, 7) + '</text></svg>';
}

function submitMobileChecklist(siteId, adoptedId, inRange) {
  // 1. Geofencing check (4.6)
  if (_appState.geofenceEnabled && !inRange) {
    alert("Geofence Check Failed! You must be near the equipment coordinates to submit this checklist.");
    return;
  }

  const site = _appState.sites.find(s => s.id === siteId);
  const ac = site.adoptedChecklists.find(item => item.id === adoptedId);

  // 2. Validate responses & mandatory photos (4.5.h)
  const cards = document.querySelectorAll('#mobile-form-container .phone-card');
  let hasFailedValidation = false;
  const submissionsData = [];

  cards.forEach(card => {
    if (hasFailedValidation) return;

    const cpId = card.getAttribute('data-cp-id');
    const cp = ac.checkpoints.find(item => item.id === cpId);
    const type = card.getAttribute('data-cp-type');
    const hasPhoto = currentCameraPhoto[cpId];

    // Enforce photo if mandatory (4.5.h)
    if (cp.photoMandatory && !hasPhoto) {
      alert(`Validation Error: Photo is mandatory for checkpoint "${cp.text}".`);
      hasFailedValidation = true;
      return;
    }

    let cpResult = { cpId, type };

    if (type === 'radio') {
      const activeBtn = card.querySelector('.phone-radio-btn.active');
      if (!activeBtn) {
        alert(`Validation Error: Please select OK or Not OK status for checkpoint "${cp.text}".`);
        hasFailedValidation = true;
        return;
      }

      const isOk = activeBtn.classList.contains('ok-btn');
      cpResult.status = isOk ? 'OK' : 'Not OK';
      
      if (!isOk) {
        const remark = card.querySelector('.cp-input-remark').value.trim();
        if (!remark) {
          alert(`Validation Error: Please enter remarks for Not OK status on checkpoint "${cp.text}".`);
          hasFailedValidation = true;
          return;
        }
        cpResult.remark = remark;
      }

      // Check if closing past ticket
      const closeCheckbox = card.querySelector(`#close-ticket-${cpId}`);
      if (closeCheckbox && closeCheckbox.checked) {
        cpResult.closePastTicket = true;
      }
    } else if (type === 'numeric') {
      const val = parseFloat(card.querySelector('.cp-input-num').value);
      if (isNaN(val)) {
        alert(`Validation Error: Please enter a numeric parameter value for "${cp.text}".`);
        hasFailedValidation = true;
        return;
      }
      cpResult.reading = val;
    }

    submissionsData.push(cpResult);
  });

  if (hasFailedValidation) return;

  // 3. Queue offline if offline mode (4.5.a)
  if (_appState.offlineMode) {
    _appState.offlineQueue.push({ siteId, adoptedId, data: submissionsData, date: new Date().toISOString() });
    alert("Tablet is Offline. Checklist submission saved to local offline cache. Will synchronize when online.");
    
    // Clear forms
    currentCameraPhoto = {};
    renderMobileForm();
    return;
  }

  // 4. Process online checklist submission
  submissionsData.forEach(res => {
    const cp = ac.checkpoints.find(item => item.id === res.cpId);
    
    // Ticket handling for radio exception
    if (res.type === 'radio' && res.status === 'Not OK') {
      const newTicketId = 't_' + Date.now();
      _appState.tickets.unshift({
        id: newTicketId,
        siteId,
        checklistId: ac.masterId,
        checkpointId: res.cpId,
        checkpointText: cp.text,
        remark: res.remark,
        category: cp.category,
        assignedTo: site.siteHead,
        date: new Date().toISOString().substring(0, 10),
        status: 'Open',
        rating: cp.category,
        actionTaken: ''
      });
    }

    // Resolve past ticket if checkbox is set
    if (res.type === 'radio' && res.status === 'OK' && res.closePastTicket) {
      const pastTicket = _appState.tickets.find(t => t.siteId === siteId && t.checkpointId === res.cpId && t.status === 'Open');
      if (pastTicket) {
        pastTicket.status = 'Closed';
        pastTicket.actionTaken = `Verified normal state during field round. Closed by ${_appState.activeUserRole}.`;
      }
    }

    // Numeric threshold breach tickets
    if (res.type === 'numeric' && res.reading >= cp.threshold) {
      const newTicketId = 't_' + Date.now();
      _appState.tickets.unshift({
        id: newTicketId,
        siteId,
        checklistId: ac.masterId,
        checkpointId: res.cpId,
        checkpointText: cp.text,
        remark: `Breach! Reading of ${res.reading} ${cp.unit || ''} exceeded threshold level of ${cp.threshold}`,
        category: cp.category,
        assignedTo: site.siteHead,
        date: new Date().toISOString().substring(0, 10),
        status: 'Open',
        rating: cp.category,
        actionTaken: ''
      });
    }
  });

  // Log activity comments
  const newCommentId = 'c_' + Date.now();
  _appState.comments.unshift({
    id: newCommentId,
    siteName: site.name,
    checklistName: ac.name,
    userName: _appState.activeUserRole,
    comment: 'Checklist completed and synchronized online.',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  });

  syncState();
  currentCameraPhoto = {};
  alert("Checklist submitted successfully! Compliance logs and alarm tickets generated.");
  
  // Clear forms & update tables
  renderMobileForm();
  renderTicketsTable();
  renderReportsTable();
  renderCommentsFeed();
}


// --- Tab 6: Reports & compliance Dashboard Trends (4.5.i & 4.5.n) ---

function renderTicketsTable() {
  const container = document.getElementById('tickets-log-container');
  if (!container) return;

  container.innerHTML = '';

  if (_appState.tickets.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 20px; color:var(--text-muted);">No compliance exceptions reported.</td>
      </tr>
    `;
    return;
  }

  _appState.tickets.forEach(t => {
    const site = _appState.sites.find(s => s.id === t.siteId) || { name: 'Punjab' };
    const statusClass = t.status === 'Open' ? 'color: var(--danger); font-weight:700;' : 'color: var(--success); font-weight:700;';

    container.innerHTML += `
      <tr>
        <td><strong>${t.checkpointText}</strong><br><span style="font-size:11px; color:var(--text-muted);">${site.name}</span></td>
        <td><span style="font-size:11px; font-weight:600; padding:2px 6px; border-radius:4px; background:rgba(239, 68, 68, 0.1); color:var(--danger);">${t.category}</span></td>
        <td>${t.remark}</td>
        <td>${t.assignedTo}</td>
        <td style="${statusClass}">${t.status}</td>
        <td>
          <button class="btn btn-secondary" style="font-size:11px; padding: 4px 8px;" onclick="viewCheckpointTrend('${t.checkpointId}', '${t.checkpointText}')">
            View Trend Analysis
          </button>
        </td>
      </tr>
    `;
  });
}

function renderReportsTable() {
  const container = document.getElementById('reports-summary-container');
  const searchSite = document.getElementById('reports-search-site').value.toLowerCase();
  const filterCat = document.getElementById('reports-filter-cat').value;

  if (!container) return;

  container.innerHTML = '';

  const filteredTickets = _appState.tickets.filter(t => {
    const site = _appState.sites.find(s => s.id === t.siteId) || { name: '', zone: '', state: '' };
    const matchesSearch = site.name.toLowerCase().includes(searchSite) || site.zone.toLowerCase().includes(searchSite);
    const matchesCat = filterCat === 'all' || t.category === filterCat;
    return matchesSearch && matchesCat;
  });

  if (filteredTickets.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 20px; color:var(--text-muted);">No reports matching search filters.</td>
      </tr>
    `;
    return;
  }

  filteredTickets.forEach(t => {
    const site = _appState.sites.find(s => s.id === t.siteId) || { name: 'Rajasthan' };
    const textStatus = t.status === 'Open' ? '<span style="color:var(--danger)">OPEN exception</span>' : '<span style="color:var(--success)">RESOLVED</span>';

    container.innerHTML += `
      <tr>
        <td style="font-weight:600;">${site.name}</td>
        <td>${t.checkpointText}</td>
        <td><span style="font-size:11px; background:var(--border-color); padding: 2px 6px; border-radius:4px;">${t.category}</span></td>
        <td>${t.remark}</td>
        <td>${textStatus}</td>
        <td>${t.date}</td>
      </tr>
    `;
  });
}

// 15-day parameter trend rendering engine (4.5.n)
function viewCheckpointTrend(checkpointId, checkpointText) {
  window._isViewingTrend = true;
  // Jump to reports tab if not already active
  const reportsTab = document.getElementById('reports-page');
  if (reportsTab && !reportsTab.classList.contains('active')) {
    switchTab('reports-page');
  }
  window._isViewingTrend = false;

  // Render trend chart on Canvas
  const canvas = document.getElementById('trendCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0, canvas.width, canvas.height);

  document.getElementById('trend-title-heading').textContent = `15-Day Parameters Trend: ${checkpointText}`;

  // Generate fake dates and values
  const pointsCount = 15;
  const values = [];
  const dates = [];
  
  // Set threshold
  const threshVal = 45;
  let breachCount = 0;

  for (let i = 0; i < pointsCount; i++) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - (15 - i));
    dates.push(dateObj.toISOString().substring(8, 10) + ' Jun');

    // Simulate standard values with random spikes
    let base = 35 + Math.random() * 8;
    if (i === 5 || i === 12) {
      base = 47.5; // Simulate threshold breach
      breachCount++;
    }
    values.push(base);
  }

  document.getElementById('trend-breaches-count').textContent = breachCount;

  // Render variables bounds
  const padding = 40;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  const minVal = 30;
  const maxVal = 55;

  // A. Draw grid axes
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  
  // Horizontal lines
  const gridLevels = 5;
  for (let i = 0; i <= gridLevels; i++) {
    const yVal = minVal + (maxVal - minVal) * (i / gridLevels);
    const y = canvas.height - padding - (yVal - minVal) / (maxVal - minVal) * height;
    
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();

    ctx.fillStyle = '#a0aec0';
    ctx.font = '10px sans-serif';
    ctx.fillText(`${Math.round(yVal)}`, 10, y + 4);
  }

  // B. Draw threshold line in Warning color
  const threshY = canvas.height - padding - (threshVal - minVal) / (maxVal - minVal) * height;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding, threshY);
  ctx.lineTo(canvas.width - padding, threshY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ef4444';
  ctx.fillText(`Limit limit: ${threshVal}`, canvas.width - 120, threshY - 8);

  // C. Draw trend lines
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 3;
  ctx.beginPath();

  const stepX = width / (pointsCount - 1);
  const coords = [];

  for (let i = 0; i < pointsCount; i++) {
    const x = padding + i * stepX;
    const y = canvas.height - padding - (values[i] - minVal) / (maxVal - minVal) * height;
    coords.push({x, y});

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // D. Draw plot dots & highlights
  coords.forEach((c, index) => {
    ctx.fillStyle = values[index] >= threshVal ? '#ef4444' : '#14b8a6';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw date labels
    if (index % 3 === 0) {
      ctx.fillStyle = '#6b7280';
      ctx.fillText(dates[index], c.x - 14, canvas.height - 12);
    }
  });
}

function triggerPDFExportMock() {
  alert("Generating PDF compliance register report...\nPDF generated successfully: Rajasthan_Solar_Inspection_Log_2026.pdf (12.4 KB)");
}

function triggerExcelExportMock() {
  // Generate download of CSV data mock
  const csvContent = "data:text/csv;charset=utf-8,Date,Reading Pit,Resistance Value,Threshold,Status\n" +
                     "2026-06-10,Pit-1,1.2,2.0,Normal\n" +
                     "2026-06-17,Pit-1,2.4,2.0,Critical Breach\n" +
                     "2026-06-24,Pit-1,1.1,2.0,Normal\n";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Earth_Resistance_Readings_Rajasthan_2026.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
