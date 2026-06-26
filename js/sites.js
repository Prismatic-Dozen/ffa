// --- Sites & Equipment Management ---

function renderSitesPage() {
  const container = document.getElementById('sites-list-container');
  if (!container) return;

  container.innerHTML = '';

  if (_appState.sites.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 30px; color:var(--text-muted);">No sites configured yet. Sync from AWS or create one.</td>
      </tr>
    `;
    return;
  }

  _appState.sites.forEach(s => {
    container.innerHTML += `
      <tr>
        <td style="font-weight:700; color:var(--text-primary);">${s.name}</td>
        <td>${s.dcCapacity} MWp / ${s.acCapacity} MW</td>
        <td>${s.village}, ${s.state} (${s.zone})</td>
        <td>
          <div style="font-weight:600;">${s.siteHead}</div>
          <div style="font-size:11px; color:var(--text-muted);">${s.siteHeadEmail}</div>
        </td>
        <td>${s.equipments ? s.equipments.length : 0} items</td>
        <td style="font-family:monospace; font-size:11px;">${s.geoLatitude.toFixed(4)}, ${s.geoLongitude.toFixed(4)}</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-icon" onclick="showEditSiteModal('${s.id}')" title="Edit Site Details">
              <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: currentColor; fill:none;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-danger btn-icon" onclick="deleteSite('${s.id}')" title="Delete Site">
              <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: var(--danger); fill:none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

function showCreateSiteModal() {
  if (!checkAccess('create')) {
    alert("Access Denied: Current role does not have Site creation privileges.");
    return;
  }

  document.getElementById('site-modal-title').textContent = "Create New Site Profile";
  document.getElementById('site-edit-id').value = "";
  document.getElementById('site-name').value = "";
  document.getElementById('site-dc').value = "";
  document.getElementById('site-ac').value = "";
  document.getElementById('site-state').value = "";
  document.getElementById('site-village').value = "";
  document.getElementById('site-zone').selectedIndex = 0;
  
  // Contacts
  document.getElementById('site-head-name').value = "";
  document.getElementById('site-head-email').value = "";
  document.getElementById('site-head-mobile').value = "";
  document.getElementById('site-zonal-name').value = "";
  document.getElementById('site-zonal-email').value = "";
  document.getElementById('site-zonal-mobile').value = "";
  
  // Coordinates
  document.getElementById('site-lat').value = "27.532";
  document.getElementById('site-lng').value = "71.915";

  // Clean sub-lists
  document.getElementById('site-team-container').innerHTML = '';
  document.getElementById('site-equipments-container').innerHTML = '';

  // Seed default templates rows
  addSiteTeamRow();
  addSiteEquipmentRow('ICR-INV-1', 'ABB', '2.5 MW', 'Inverter', 27.5322, 71.9155);
  addSiteEquipmentRow('TR-1', 'Siemens', '120 MVA', 'Transformer', 27.5330, 71.9160);

  showModal('site-modal');
}

function showEditSiteModal(id) {
  if (!checkAccess('edit')) {
    alert("Access Denied: Current role does not have Site editing permissions.");
    return;
  }

  const s = _appState.sites.find(site => site.id === id);
  if (!s) return;

  document.getElementById('site-modal-title').textContent = "Edit Site Profile";
  document.getElementById('site-edit-id').value = s.id;
  document.getElementById('site-name').value = s.name;
  document.getElementById('site-dc').value = s.dcCapacity;
  document.getElementById('site-ac').value = s.acCapacity;
  document.getElementById('site-state').value = s.state;
  document.getElementById('site-village').value = s.village;
  
  const zoneSelect = document.getElementById('site-zone');
  for (let i = 0; i < zoneSelect.options.length; i++) {
    if (zoneSelect.options[i].value === s.zone) {
      zoneSelect.selectedIndex = i;
      break;
    }
  }

  document.getElementById('site-head-name').value = s.siteHead;
  document.getElementById('site-head-email').value = s.siteHeadEmail;
  document.getElementById('site-head-mobile').value = s.siteHeadMobile;
  document.getElementById('site-zonal-name').value = s.zonalHead;
  document.getElementById('site-zonal-email').value = s.zonalHeadEmail;
  document.getElementById('site-zonal-mobile').value = s.zonalHeadMobile;
  
  document.getElementById('site-lat').value = s.geoLatitude;
  document.getElementById('site-lng').value = s.geoLongitude;

  // Render team members
  const teamContainer = document.getElementById('site-team-container');
  teamContainer.innerHTML = '';
  if (s.team && s.team.length > 0) {
    s.team.forEach(t => addSiteTeamRow(t));
  } else {
    addSiteTeamRow();
  }

  // Render equipments
  const equipContainer = document.getElementById('site-equipments-container');
  equipContainer.innerHTML = '';
  if (s.equipments && s.equipments.length > 0) {
    s.equipments.forEach(e => addSiteEquipmentRow(e.name, e.make, e.rating, e.category, e.latitude, e.longitude));
  } else {
    addSiteEquipmentRow();
  }

  showModal('site-modal');
}

function addSiteTeamRow(member = null) {
  const container = document.getElementById('site-team-container');
  const rowId = 'team_row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

  const defaults = { name: '', email: '', mobile: '', role: 'Field Technician' };
  const val = Object.assign({}, defaults, member);

  const row = document.createElement('div');
  row.className = 'builder-item-row';
  row.id = rowId;
  row.style.display = 'grid';
  row.style.gridTemplateColumns = '1fr 1fr 1fr 1fr auto';
  row.style.gap = '8px';

  row.innerHTML = `
    <input type="text" class="form-input t-name" value="${val.name.replace(/"/g, '&quot;')}" placeholder="Name" style="padding: 6px 10px;">
    <input type="email" class="form-input t-email" value="${val.email}" placeholder="Email" style="padding: 6px 10px;">
    <input type="text" class="form-input t-mobile" value="${val.mobile}" placeholder="Mobile" style="padding: 6px 10px;">
    <select class="form-select-styled t-role" style="padding: 6px 10px;">
      <option value="Field Technician" ${val.role === 'Field Technician' ? 'selected' : ''}>Field Tech</option>
      <option value="Site In-Charge" ${val.role === 'Site In-Charge' ? 'selected' : ''}>Site In-Charge</option>
      <option value="Zonal Head" ${val.role === 'Zonal Head' ? 'selected' : ''}>Zonal Head</option>
    </select>
    <button class="btn btn-danger btn-icon" style="height:32px; width:32px;" onclick="removeSiteTeamRow('${rowId}')">
      <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: currentColor; fill:none; stroke-width: 2.5;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  container.appendChild(row);
}

function removeSiteTeamRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.remove();
}

function addSiteEquipmentRow(name='', make='', rating='', category='Inverter', lat=27.5322, lng=71.9155) {
  const container = document.getElementById('site-equipments-container');
  const rowId = 'eq_row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

  const row = document.createElement('div');
  row.className = 'builder-item-row';
  row.id = rowId;
  row.style.display = 'grid';
  row.style.gridTemplateColumns = '1.2fr 1fr 1fr 1fr 1.2fr auto';
  row.style.gap = '8px';

  row.innerHTML = `
    <input type="text" class="form-input eq-name" value="${name.replace(/"/g, '&quot;')}" placeholder="Name (e.g. Inv-1)" style="padding: 6px 10px;">
    <input type="text" class="form-input eq-make" value="${make.replace(/"/g, '&quot;')}" placeholder="Make" style="padding: 6px 10px;">
    <input type="text" class="form-input eq-rating" value="${rating.replace(/"/g, '&quot;')}" placeholder="Rating" style="padding: 6px 10px;">
    <select class="form-select-styled eq-cat" style="padding: 6px 10px;">
      <option value="Inverter" ${category === 'Inverter' ? 'selected' : ''}>Inverter</option>
      <option value="Transformer" ${category === 'Transformer' ? 'selected' : ''}>Transformer</option>
      <option value="Breaker" ${category === 'Breaker' ? 'selected' : ''}>Breaker</option>
      <option value="SCBs" ${category === 'SCBs' ? 'selected' : ''}>SCB</option>
      <option value="CCTV" ${category === 'CCTV' ? 'selected' : ''}>CCTV</option>
      <option value="Switchyard" ${category === 'Switchyard' ? 'selected' : ''}>Switchyard</option>
    </select>
    <div style="display:flex; gap:4px;">
      <input type="number" step="any" class="form-input eq-lat" value="${lat}" placeholder="Lat" style="padding: 6px 4px; font-size:11px;">
      <input type="number" step="any" class="form-input eq-lng" value="${lng}" placeholder="Lng" style="padding: 6px 4px; font-size:11px;">
    </div>
    <button class="btn btn-danger btn-icon" style="height:32px; width:32px;" onclick="removeSiteEquipmentRow('${rowId}')">
      <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: currentColor; fill:none; stroke-width: 2.5;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  container.appendChild(row);
}

function removeSiteEquipmentRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.remove();
}

function saveSiteProfile() {
  const id = document.getElementById('site-edit-id').value;
  const name = document.getElementById('site-name').value.trim();
  const dcCapacity = parseFloat(document.getElementById('site-dc').value);
  const acCapacity = parseFloat(document.getElementById('site-ac').value);
  const stateVal = document.getElementById('site-state').value.trim();
  const villageVal = document.getElementById('site-village').value.trim();
  const zoneVal = document.getElementById('site-zone').value;

  const siteHead = document.getElementById('site-head-name').value.trim();
  const siteHeadEmail = document.getElementById('site-head-email').value.trim();
  const siteHeadMobile = document.getElementById('site-head-mobile').value.trim();
  const zonalHead = document.getElementById('site-zonal-name').value.trim();
  const zonalHeadEmail = document.getElementById('site-zonal-email').value.trim();
  const zonalHeadMobile = document.getElementById('site-zonal-mobile').value.trim();
  
  const geoLatitude = parseFloat(document.getElementById('site-lat').value);
  const geoLongitude = parseFloat(document.getElementById('site-lng').value);

  if (!name || isNaN(dcCapacity) || isNaN(acCapacity) || !stateVal) {
    alert("Site Name, Capacities, and State coordinates are required.");
    return;
  }

  // Parse Site team
  const teamCards = document.getElementById('site-team-container').children;
  const team = [];
  for (let i = 0; i < teamCards.length; i++) {
    const card = teamCards[i];
    const tName = card.querySelector('.t-name').value.trim();
    const tEmail = card.querySelector('.t-email').value.trim();
    const tMobile = card.querySelector('.t-mobile').value.trim();
    const tRole = card.querySelector('.t-role').value;

    if (tName && tEmail) {
      team.push({ name: tName, email: tEmail, mobile: tMobile, role: tRole });
    }
  }

  // Parse Equipments (used for geofencing)
  const equipCards = document.getElementById('site-equipments-container').children;
  const equipments = [];
  for (let i = 0; i < equipCards.length; i++) {
    const card = equipCards[i];
    const eqName = card.querySelector('.eq-name').value.trim();
    const eqMake = card.querySelector('.eq-make').value.trim();
    const eqRating = card.querySelector('.eq-rating').value.trim();
    const eqCat = card.querySelector('.eq-cat').value;
    const eqLat = parseFloat(card.querySelector('.eq-lat').value);
    const eqLng = parseFloat(card.querySelector('.eq-lng').value);

    if (eqName && !isNaN(eqLat) && !isNaN(eqLng)) {
      equipments.push({ name: eqName, make: eqMake, rating: eqRating, category: eqCat, latitude: eqLat, longitude: eqLng });
    }
  }

  if (id) {
    const idx = _appState.sites.findIndex(s => s.id === id);
    if (idx !== -1) {
      const existingAdopted = _appState.sites[idx].adoptedChecklists || [];
      _appState.sites[idx] = { id, name, dcCapacity, acCapacity, state: stateVal, village: villageVal, zone: zoneVal, siteHead, siteHeadEmail, siteHeadMobile, zonalHead, zonalHeadEmail, zonalHeadMobile, geoLatitude, geoLongitude, team, equipments, adoptedChecklists: existingAdopted };
    }
  } else {
    const newId = 'site_' + Date.now();
    _appState.sites.push({ id: newId, name, dcCapacity, acCapacity, state: stateVal, village: villageVal, zone: zoneVal, siteHead, siteHeadEmail, siteHeadMobile, zonalHead, zonalHeadEmail, zonalHeadMobile, geoLatitude, geoLongitude, team, equipments, adoptedChecklists: [] });
  }

  syncState();
  hideModal('site-modal');
  renderSitesPage();
  updateStats();
}

function deleteSite(id) {
  if (!checkAccess('delete')) return;
  if (confirm("Permanently delete this Site profile and all its adopted checklists? This action is irreversible.")) {
    _appState.sites = _appState.sites.filter(s => s.id !== id);
    syncState();
    renderSitesPage();
    updateStats();
  }
}

// Triggers sync request to Central database AWS (4.3.g)
function triggerAWSDatabaseSync() {
  fetchCentralAWSDatabase((msg) => {
    alert(msg);
    renderSitesPage();
    updateStats();
    
    // Log comment
    const commentId = 'c_' + Date.now();
    _appState.comments.unshift({
      id: commentId,
      siteName: 'Punjab Biomass',
      checklistName: 'AWS Sync Connection',
      userName: _appState.activeUserRole,
      comment: 'Central AWS sync triggered. Punjabi Site added successfully.',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
    syncState();
    renderCommentsFeed();
  });
}
