// ===== MAIN ROUTER AND INITIALIZATION =====

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const el = document.getElementById(pageId);
  if (el) el.classList.add('active');
  
  const nav = document.querySelector('[data-page="' + pageId + '"]');
  if (nav) nav.classList.add('active');
  
  const titles = { 
    'overview-page': 'Work Allocation Dashboard',
    'tasks-page': 'All Work Allocations'
  };
  
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = titles[pageId] || 'Dashboard';
  }
  
  if (pageId === 'overview-page') {
    renderDashboard();
  } else if (pageId === 'tasks-page') {
    renderTasksTable();
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
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
  const activeTheme = localStorage.getItem('theme') || 'light';
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
let activeTechnician = null;
let selectedTaskForClosure = null;
let capturedPhotoURL = '';

function renderEmulator() {
  const container = document.getElementById('mobile-flow-container');
  if (!container) return;
  
  if (!activeTechnician) {
    // Render Login / Technician Selector Screen
    container.innerHTML = `
      <div style="text-align:center; padding-top:20px; flex-grow:1; display:flex; flex-direction:column; justify-content:center;">
        <i class="hgi-stroke hgi-user-lock" style="font-size:38px; color:var(--primary); margin-bottom:14px;"></i>
        <h4 style="font-size:14px; font-weight:700; margin-bottom:4px;">Technician Field Portal</h4>
        <p style="font-size:11px; color:var(--text2); margin-bottom:20px; padding:0 20px;">Select simulated technician credentials to view assigned schedules</p>
        
        <div style="display:flex; flex-direction:column; gap:10px; padding:0 12px;">
          ${_state.team.map(t => `
            <button class="btn btn-secondary" style="justify-content:space-between; font-size:11px;" onclick="handleEmulatorLogin('${t.email}')">
              <span>${t.name} <span style="font-size:9px;color:var(--muted)">(${t.role})</span></span>
              <i class="hgi-stroke hgi-arrow-right-02" style="font-size:12px;"></i>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    const tech = _state.team.find(t => t.email === activeTechnician);
    const techTasks = _state.tasks.filter(t => t.assignedTo === activeTechnician);
    const openTasks = techTasks.filter(t => t.status !== 'Closed');
    
    if (selectedTaskForClosure) {
      // Render Task Execution Form (Screen 3)
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; flex-grow:1;">
          <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.06); margin-bottom:14px;">
            <button class="btn btn-secondary btn-sm" onclick="selectedTaskForClosure = null; renderEmulator()"><i class="hgi-stroke hgi-arrow-left-01"></i> Back</button>
            <span style="font-size:11px; font-weight:800; color:var(--primary-l);">Task Closure</span>
          </div>

          <h4 style="font-size:12px; font-weight:700; margin-bottom:6px; line-height:1.4;">${selectedTaskForClosure.title}</h4>
          <div style="font-size:10px; color:var(--text2); margin-bottom:12px; display:flex; flex-direction:column; gap:3px;">
            <span><strong>Source:</strong> ${selectedTaskForClosure.source}</span>
            <span><strong>Asset:</strong> ${_state.assets.find(a=>a.id===selectedTaskForClosure.assetId)?.naming || 'N/A'}</span>
            <span><strong>Effort:</strong> ${selectedTaskForClosure.estHours} Hours</span>
          </div>

          <form onsubmit="handleCloseTask(event)" style="display:flex; flex-direction:column; gap:10px; flex-grow:1; justify-content:space-between;">
            <div>
              <div class="form-group" style="margin-bottom:10px;">
                <label class="form-label" style="font-size:10px;">Action Status *</label>
                <select class="form-sel" id="mobile-task-status" style="font-size:11px; padding:6px 10px;" required>
                  <option value="In Progress" ${selectedTaskForClosure.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Closed" ${selectedTaskForClosure.status === 'Closed' ? 'selected' : ''}>Completed &amp; Close</option>
                </select>
              </div>

              <div class="form-group" style="margin-bottom:10px;">
                <label class="form-label" style="font-size:10px;">Execution Remarks / Comments *</label>
                <textarea class="form-textarea" id="mobile-task-remarks" style="font-size:11px; min-height:60px;" placeholder="Describe what was repaired or checked..." required>${selectedTaskForClosure.remarks || ''}</textarea>
              </div>

              <div class="form-group" style="margin-bottom:10px;">
                <label class="form-label" style="font-size:10px;">Mandatory Closure Photo</label>
                <div style="display:flex; gap:8px; align-items:center;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="simulateCameraCapture()" style="flex:1;">
                    <i class="hgi-stroke hgi-camera-01"></i> Click Camera
                  </button>
                  <div id="camera-preview" style="width:40px; height:40px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); overflow:hidden; display:flex; align-items:center; justify-content:center;">
                    ${capturedPhotoURL ? `<img src="${capturedPhotoURL}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="hgi-stroke hgi-image-01" style="font-size:14px;color:var(--muted)"></i>`}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-sm" style="justify-content:center; width:100%; margin-top:10px;">
              <i class="hgi-stroke hgi-checkmark-circle-01"></i> Submit Task Status
            </button>
          </form>
        </div>
      `;
    } else {
      // Render Task List Screen (Screen 2)
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; flex-grow:1;">
          <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.06); margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <i class="hgi-stroke hgi-user" style="font-size:14px; color:var(--primary);"></i>
              <span style="font-size:12px; font-weight:700;">${tech.name}</span>
            </div>
            <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:9px;" onclick="handleEmulatorLogout()">Logout</button>
          </div>

          <div style="font-size:10px; color:var(--text2); margin-bottom:12px; display:flex; justify-content:space-between;">
            <span><strong>Total Workload:</strong> ${techTasks.reduce((sum,t)=>sum+(t.status !== 'Closed'?t.estHours:0),0)} Hours</span>
            <span><strong>Pending:</strong> ${openTasks.length} Tasks</span>
          </div>

          <div style="font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; margin-bottom:6px; letter-spacing:0.5px;">My Assignments</div>
          <div style="display:flex; flex-direction:column; gap:8px; overflow-y:auto; flex-grow:1; max-height:430px;" class="phone-screen-scroll">
            ${techTasks.length === 0 ? `
              <div style="text-align:center; padding:30px 10px; color:var(--muted); font-size:11px;">No tasks assigned to you.</div>
            ` : techTasks.map(t => {
              const asset = _state.assets.find(a => a.id === t.assetId);
              return `
                <div class="phone-card" style="cursor:pointer; position:relative; border-left: 3px solid ${t.status === 'Closed' ? 'var(--success)' : 'var(--primary)'};" onclick="handleSelectTaskForClosure('${t.id}')">
                  <div style="font-weight:700; font-size:11px; margin-bottom:4px; line-height:1.3; color:var(--text); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${t.title}</div>
                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:9px; color:var(--text2);">
                    <span>${asset ? asset.naming : 'No Asset'}</span>
                    <span class="badge ${t.status === 'Closed' ? 'badge-closed' : (t.status === 'In Progress' ? 'badge-inprogress' : 'badge-open')}">${t.status}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  }
}

function handleEmulatorLogin(email) {
  activeTechnician = email;
  selectedTaskForClosure = null;
  capturedPhotoURL = '';
  renderEmulator();
}

function handleEmulatorLogout() {
  activeTechnician = null;
  selectedTaskForClosure = null;
  capturedPhotoURL = '';
  renderEmulator();
}

function handleSelectTaskForClosure(taskId) {
  const task = _state.tasks.find(t => t.id === taskId);
  if (task) {
    selectedTaskForClosure = task;
    capturedPhotoURL = task.photo || '';
    renderEmulator();
  }
}

function simulateCameraCapture() {
  // Simulates snapping a direct picture of site equipment round check
  const randomPhotos = [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200'
  ];
  capturedPhotoURL = randomPhotos[Math.floor(Math.random() * randomPhotos.length)];
  const preview = document.getElementById('camera-preview');
  if (preview) {
    preview.innerHTML = `<img src="${capturedPhotoURL}" style="width:100%; height:100%; object-fit:cover;">`;
  }
}

function handleCloseTask(e) {
  e.preventDefault();
  if (!selectedTaskForClosure) return;
  
  const status = document.getElementById('mobile-task-status').value;
  const remarks = document.getElementById('mobile-task-remarks').value;
  
  // Find task in state
  const taskIdx = _state.tasks.findIndex(t => t.id === selectedTaskForClosure.id);
  if (taskIdx !== -1) {
    _state.tasks[taskIdx].status = status;
    _state.tasks[taskIdx].remarks = remarks;
    _state.tasks[taskIdx].photo = capturedPhotoURL;
    if (status === 'Closed') {
      _state.tasks[taskIdx].closedOn = new Date().toISOString().substring(0, 10);
    } else {
      _state.tasks[taskIdx].closedOn = '';
    }
    
    syncState();
    selectedTaskForClosure = null;
    capturedPhotoURL = '';
    
    // Refresh both desktop dashboards and emulator views
    renderDashboard();
    renderEmulator();
    renderTasksTable();
    updateAssigneeLoadPreview();
  }
}

// ===== DESKTOP PANEL RENDERING =====

function renderDashboard() {
  const total = _state.tasks.length;
  const pending = _state.tasks.filter(t => t.status !== 'Closed').length;
  const completed = _state.tasks.filter(t => t.status === 'Closed').length;
  
  // Overdue / Backlog tasks are Open tasks created > 3 days ago relative to 2026-06-26
  const today = new Date('2026-06-26');
  const overdue = _state.tasks.filter(t => {
    if (t.status === 'Closed') return false;
    const created = new Date(t.createdOn);
    const diffTime = Math.abs(today - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 3;
  }).length;
  
  const totEl = document.getElementById('stat-total');
  const pendEl = document.getElementById('stat-pending');
  const compEl = document.getElementById('stat-completed');
  const ovEl = document.getElementById('stat-overdue');
  const openBadge = document.getElementById('open-tasks-badge');
  const openBadgeSidebar = document.getElementById('open-tasks-badge');
  
  if (totEl) totEl.textContent = total;
  if (pendEl) pendEl.textContent = pending;
  if (compEl) compEl.textContent = completed;
  if (ovEl) ovEl.textContent = overdue;
  if (openBadge) openBadge.textContent = pending;
  if (openBadgeSidebar) openBadgeSidebar.textContent = pending;
  
  renderTeamLoadBars();
}

function renderTeamLoadBars() {
  const container = document.getElementById('team-load-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  _state.team.forEach(t => {
    // Sum estimated hours of open/in progress tasks assigned to this technician
    const activeTasks = _state.tasks.filter(task => task.assignedTo === t.email && task.status !== 'Closed');
    const loadHours = activeTasks.reduce((sum, task) => sum + task.estHours, 0);
    const capacityRatio = (loadHours / t.baseHours) * 100;
    
    let loadClass = 'normal';
    if (capacityRatio > 100) loadClass = 'danger';
    else if (capacityRatio >= 80) loadClass = 'warning';
    
    container.innerHTML += `
      <div style="font-size:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
          <span><strong>${t.name}</strong> <span style="font-size:10px; color:var(--muted);">(${t.role})</span></span>
          <span style="font-size:11px; font-weight:700;">${loadHours} hrs / ${t.baseHours} hrs</span>
        </div>
        <div class="load-bar-bg">
          <div class="load-bar-fill ${loadClass}" style="width: ${Math.min(capacityRatio, 100)}%;"></div>
        </div>
      </div>
    `;
  });
}

function updateAssigneeLoadPreview() {
  const email = document.getElementById('task-assignee').value;
  const preview = document.getElementById('assignee-load-preview');
  if (!preview) return;
  
  const tech = _state.team.find(t => t.email === email);
  if (!tech) {
    preview.innerHTML = '';
    return;
  }
  
  const loadHours = _state.tasks.filter(task => task.assignedTo === email && task.status !== 'Closed')
                               .reduce((sum, t) => sum + t.estHours, 0);
  
  preview.innerHTML = `Technician current loading: <strong style="color:${loadHours > 8 ? '#f87171' : (loadHours >= 6.4 ? '#fbbf24' : '#2dd4bf')}">${loadHours} Hours</strong> (Capacity: 8 Hours/Day)`;
}

function handleAssignTask(e) {
  e.preventDefault();
  
  const title = document.getElementById('task-title').value.trim();
  const assetId = document.getElementById('task-asset').value;
  const priority = document.getElementById('task-priority').value;
  const estHours = parseInt(document.getElementById('task-est-hours').value);
  const dueDate = document.getElementById('task-due-date').value;
  const assignedTo = document.getElementById('task-assignee').value;
  
  const newTask = {
    id: 'WA00' + (_state.tasks.length + 1),
    title: title,
    source: 'Direct Allocation',
    assetId: assetId,
    assignedTo: assignedTo,
    priority: priority,
    estHours: estHours,
    dueDate: dueDate,
    status: 'Open',
    createdOn: new Date().toISOString().substring(0, 10),
    closedOn: '',
    remarks: '',
    photo: ''
  };
  
  _state.tasks.push(newTask);
  syncState();
  
  // Clear Form
  document.getElementById('task-title').value = '';
  document.getElementById('task-est-hours').value = 4;
  
  // Refresh Dashboard
  renderDashboard();
  renderEmulator();
  renderTasksTable();
  updateAssigneeLoadPreview();
}

function populateDropdowns() {
  const assetSel = document.getElementById('task-asset');
  const assigneeSel = document.getElementById('task-assignee');
  const userFilterSel = document.getElementById('tasks-filter-user');
  
  if (assetSel) {
    assetSel.innerHTML = '';
    _state.assets.forEach(a => {
      assetSel.innerHTML += `<option value="${a.id}">${a.naming} (${a.type})</option>`;
    });
  }
  
  if (assigneeSel) {
    assigneeSel.innerHTML = '';
    _state.team.forEach(t => {
      assigneeSel.innerHTML += `<option value="${t.email}">${t.name} (${t.role})</option>`;
    });
  }

  if (userFilterSel) {
    userFilterSel.innerHTML = '<option value="all">All Assignees</option>';
    _state.team.forEach(t => {
      userFilterSel.innerHTML += `<option value="${t.email}">${t.name}</option>`;
    });
  }
}

// ===== TASK LIST TABLE RENDERING =====

function renderTasksTable() {
  const tbody = document.getElementById('tasks-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const query = document.getElementById('tasks-search').value.toLowerCase().trim();
  const statusFilter = document.getElementById('tasks-filter-status').value;
  const userFilter = document.getElementById('tasks-filter-user').value;
  
  const filtered = _state.tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(query) || t.source.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesUser = userFilter === 'all' || t.assignedTo === userFilter;
    return matchesSearch && matchesStatus && matchesUser;
  });
  
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--muted);">No matching work allocations found.</td></tr>`;
    return;
  }
  
  filtered.forEach(t => {
    const asset = _state.assets.find(a => a.id === t.assetId);
    const tech = _state.team.find(team => team.email === t.assignedTo);
    
    tbody.innerHTML += `
      <tr>
        <td>
          <div style="font-weight:700; color:var(--text);">${t.title}</div>
          <span style="font-size:10px; color:var(--muted); display:block; margin-top:2px;">ID: ${t.id} ${t.remarks ? `| Remarks: "${t.remarks}"` : ''}</span>
        </td>
        <td>${asset ? asset.naming : 'N/A'}<br><span style="font-size:10px; color:var(--muted);">${asset ? asset.type : ''}</span></td>
        <td><span style="font-size:10px; font-weight:700; color:var(--muted);">${t.source}</span></td>
        <td><span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span></td>
        <td>${tech ? tech.name : 'Unassigned'}<br><span style="font-size:10px; color:var(--muted);">${t.assignedTo}</span></td>
        <td><strong>${t.estHours} Hrs</strong></td>
        <td>${t.dueDate}</td>
        <td><span class="badge ${t.status === 'Closed' ? 'badge-closed' : (t.status === 'In Progress' ? 'badge-inprogress' : 'badge-open')}">${t.status}</span></td>
      </tr>
    `;
  });
}

// ===== DOM LOAD TRIGGER =====
document.addEventListener('DOMContentLoaded', () => {
  initState();
  initTheme();
  populateDropdowns();
  renderDashboard();
  renderEmulator();
  renderTasksTable();
  updateAssigneeLoadPreview();
  
  // Set default due date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueInput = document.getElementById('task-due-date');
  if (dueInput) dueInput.value = tomorrow.toISOString().substring(0,10);
});
