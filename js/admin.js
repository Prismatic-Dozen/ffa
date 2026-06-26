// --- Admin Control Panel (User Access Control, Role Simulation, and Geofencing) ---

function renderAdminPage() {
  const container = document.getElementById('admin-permissions-tbody');
  const roleSimulatorSelect = document.getElementById('active-role-selector');
  const geofenceSwitch = document.getElementById('geofence-master-switch');

  if (!container || !roleSimulatorSelect || !geofenceSwitch) return;

  // Set initial geofence state
  geofenceSwitch.checked = _appState.geofenceEnabled;

  // Set active role dropdown selection
  roleSimulatorSelect.value = _appState.activeUserRole;

  // Render permissions matrix table
  container.innerHTML = '';
  _appState.permissions.forEach(p => {
    const isCurrentRole = p.role === _appState.activeUserRole;
    container.innerHTML += `
      <tr style="${isCurrentRole ? 'background: rgba(99,102,241,0.08); outline: 1px solid rgba(99,102,241,0.25);' : ''}">
        <td style="font-weight:700; color:var(--text-primary);">
          ${p.role}
          ${isCurrentRole ? '<span style="margin-left:6px; font-size:10px; background:var(--primary); color:#fff; border-radius:4px; padding:1px 6px;">ACTIVE</span>' : ''}
        </td>
        <td style="text-align:center;"><input type="checkbox" ${p.view ? 'checked' : ''} onchange="togglePermissionRule('${p.role}', 'view', this.checked)"></td>
        <td style="text-align:center;"><input type="checkbox" ${p.edit ? 'checked' : ''} onchange="togglePermissionRule('${p.role}', 'edit', this.checked)"></td>
        <td style="text-align:center;"><input type="checkbox" ${p.create ? 'checked' : ''} onchange="togglePermissionRule('${p.role}', 'create', this.checked)"></td>
        <td style="text-align:center;"><input type="checkbox" ${p.delete ? 'checked' : ''} onchange="togglePermissionRule('${p.role}', 'delete', this.checked)"></td>
        <td style="text-align:center;"><input type="checkbox" ${p.adopt ? 'checked' : ''} onchange="togglePermissionRule('${p.role}', 'adopt', this.checked)"></td>
        <td style="text-align:center;"><input type="checkbox" ${p.override ? 'checked' : ''} onchange="togglePermissionRule('${p.role}', 'override', this.checked)"></td>
      </tr>
    `;
  });

  // Update the active role badge in the admin panel header if it exists
  const activeRoleBadge = document.getElementById('active-role-display-badge');
  if (activeRoleBadge) {
    activeRoleBadge.textContent = _appState.activeUserRole;
  }
}

function togglePermissionRule(role, field, value) {
  const pObj = _appState.permissions.find(p => p.role === role);
  if (pObj) {
    pObj[field] = value;
    syncState();
  }
}

// Helper: safely get a nav <li> from a nav link's data-target attribute
function getNavLi(target) {
  const el = document.querySelector(`[data-target="${target}"]`);
  return el ? el.parentElement : null;
}

// Simulated active login role change (4.5.o)
function updateActiveSimulatedRole(role) {
  _appState.activeUserRole = role;

  // Only persist full-access roles to localStorage — restricted roles (Technician/Site Head/Zonal)
  // are session-only simulations so the admin tab is always visible on next page load.
  const fullAccessRoles = ['Chief - O&M', 'System Administrator'];
  if (fullAccessRoles.includes(role)) {
    localStorage.setItem('active_role', role);
  } else {
    // Clear stored role so next reload defaults back to System Administrator
    localStorage.removeItem('active_role');
  }

  // Apply visibility limitations based on active role (4.5.i)
  applyRoleSecurityViews();

  // Re-render admin page to update ACTIVE badge
  renderAdminPage();

  alert(`Logged-in user context switched to: ${role}.\nDashboard features updated accordingly.\n\n${!fullAccessRoles.includes(role) ? 'Note: This is a session-only simulation. The tab will restore to full access on page reload.' : ''}`);
}


function applyRoleSecurityViews() {
  const role = _appState.activeUserRole;
  
  // Navbar element handles — null-safe via helper
  const navDashboard   = getNavLi('overview-page');
  const navLibrary     = getNavLi('library-page');
  const navFrequencies = getNavLi('frequencies-page');
  const navEscalation  = getNavLi('escalation-page');
  const navSites       = getNavLi('sites-page');
  const navAdoption    = getNavLi('adoption-page');
  const navRunner      = getNavLi('runner-page');
  const navReports     = getNavLi('reports-page');
  const navAdmin       = getNavLi('admin-page');

  // Reset all displays to visible first
  const allNavs = [navDashboard, navLibrary, navFrequencies, navEscalation, navSites, navAdoption, navRunner, navReports, navAdmin];
  allNavs.forEach(nav => {
    if (nav) nav.style.display = '';
  });

  // Get the current active tab safely
  const activeNavEl = document.querySelector('.nav-item.active');
  const activeTab = activeNavEl ? activeNavEl.getAttribute('data-target') : 'overview-page';

  // Apply restrictions per role
  if (role === 'Field Technician') {
    // Technician ONLY performs plant rounds - hide configuration tabs
    if (navLibrary)     navLibrary.style.display     = 'none';
    if (navFrequencies) navFrequencies.style.display  = 'none';
    if (navEscalation)  navEscalation.style.display   = 'none';
    if (navSites)       navSites.style.display        = 'none';
    if (navAdoption)    navAdoption.style.display     = 'none';
    if (navAdmin)       navAdmin.style.display        = 'none';
    
    // Redirect if currently on a blocked tab
    const blockedTabs = ['library-page', 'frequencies-page', 'escalation-page', 'sites-page', 'adoption-page', 'admin-page'];
    if (blockedTabs.includes(activeTab)) {
      switchTab('runner-page');
    }
  } 
  else if (role === 'Site Head') {
    // Site head can see sites, adoption, runner, reports — not admin or library config
    if (navLibrary)     navLibrary.style.display     = 'none';
    if (navFrequencies) navFrequencies.style.display  = 'none';
    if (navEscalation)  navEscalation.style.display   = 'none';
    if (navAdmin)       navAdmin.style.display        = 'none';

    const blockedTabs = ['library-page', 'frequencies-page', 'escalation-page', 'admin-page'];
    if (blockedTabs.includes(activeTab)) {
      switchTab('overview-page');
    }
  }
  else if (role === 'Zonal Head') {
    // Zonal head has broad access but not admin panel
    if (navAdmin) navAdmin.style.display = 'none';
    if (activeTab === 'admin-page') {
      switchTab('overview-page');
    }
  }
  // Chief - O&M and System Administrator see everything — no restrictions

  // Update visible scope text in reports page (4.5.i)
  const reportViewScopeText = document.getElementById('report-scope-scope');
  if (reportViewScopeText) {
    if (role === 'Field Technician' || role === 'Site Head') {
      reportViewScopeText.textContent = 'Visible Scope: My Assigned Site only';
    } else if (role === 'Zonal Head') {
      reportViewScopeText.textContent = 'Visible Scope: Assigned Zone sites only';
    } else {
      reportViewScopeText.textContent = 'Visible Scope: Portfolio-level (All Zones & Sites)';
    }
  }

  // Highlight the Access Control nav item if user is System Administrator
  if (navAdmin) {
    const adminLink = navAdmin.querySelector('.nav-item');
    if (adminLink) {
      if (role === 'System Administrator') {
        adminLink.style.borderLeft = '2px solid var(--primary)';
      } else {
        adminLink.style.borderLeft = '';
      }
    }
  }
}

// Check permission action limits
function checkAccess(action) {
  const role = _appState.activeUserRole;
  const pObj = _appState.permissions.find(p => p.role === role);
  if (!pObj) return false;
  
  if (action === 'create') return pObj.create;
  if (action === 'edit')   return pObj.edit;
  if (action === 'delete') return pObj.delete;
  if (action === 'adopt')  return pObj.adopt;
  if (action === 'override') return pObj.override;
  
  return false;
}

// Global geofencing toggling (4.6)
function toggleGeofenceSetting(checked) {
  _appState.geofenceEnabled = checked;
  localStorage.setItem('geofence_toggle', JSON.stringify(checked));
  
  // Refresh mobile simulator view
  renderMobileForm();
}
