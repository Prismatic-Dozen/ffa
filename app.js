// --- Main Core Initializer & Page Router ---

function initApplicationSuite() {
  // 1. Seed database state from localStorage
  initializeDatabase();

  // 2. Setup Navbar Active Item Tabs Switching
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      switchTab(target);
    });
  });

  // 3. Theme switch bindings
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  const activeTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', activeTheme);
  updateThemeIcon(activeTheme);

  // 4. Initial views rendering
  updateOverviewStats();
  renderMasterChecklistLibrary();
  renderFrequenciesPage();
  renderEscalationsPage();
  renderSitesPage();
  renderAdoptionPage();
  renderAdminPage();
  
  // Initialize mobile runner selectors
  populateRunnerSelectors();

  // Apply default visibility constraints based on role
  applyRoleSecurityViews();
}

// Router Switch tab layout
function switchTab(pageId) {
  document.querySelectorAll('.page-container').forEach(page => {
    page.classList.remove('active');
  });
  document.querySelectorAll('.nav-item').forEach(nav => {
    nav.classList.remove('active');
    if (nav.getAttribute('data-target') === pageId) {
      nav.classList.add('active');
    }
  });

  const pageElement = document.getElementById(pageId);
  if (pageElement) pageElement.classList.add('active');

  // Page specific render triggers
  if (pageId === 'overview-page') {
    updateOverviewStats();
  } else if (pageId === 'library-page') {
    renderMasterChecklistLibrary();
  } else if (pageId === 'sites-page') {
    renderSitesPage();
  } else if (pageId === 'adoption-page') {
    renderAdoptionPage();
  } else if (pageId === 'runner-page') {
    populateRunnerSelectors();
    renderMobileForm();
  } else if (pageId === 'reports-page') {
    renderReportsTable();
    // Pre-plot trend for first ticket if exists and we are not already viewing a specific trend
    if (!window._isViewingTrend && _appState.tickets.length > 0) {
      viewCheckpointTrend(_appState.tickets[0].checkpointId, _appState.tickets[0].checkpointText);
    }
  } else if (pageId === 'admin-page') {
    renderAdminPage();
  }

  // Update Page Title in Topbar
  let title = "Dashboard Overview";
  if (pageId === 'library-page') title = "Central Template Library";
  else if (pageId === 'frequencies-page') title = "Checklist Frequencies";
  else if (pageId === 'escalation-page') title = "Hierarchical Escalations Flow";
  else if (pageId === 'sites-page') title = "Operations Sites Profile";
  else if (pageId === 'adoption-page') title = "Checklist Adoption override";
  else if (pageId === 'runner-page') title = "Mobile rounds Simulation App";
  else if (pageId === 'reports-page') title = "Exception compliance Reports";
  else if (pageId === 'admin-page') title = "Roles Access Matrix";

  document.getElementById('header-page-title').textContent = title;
}

// Theme Icons Updater
function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (theme === 'light') {
    btn.innerHTML = `<svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  } else {
    btn.innerHTML = `<svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  }
}

// Update Top stats values & Overview grid
function updateOverviewStats() {
  const mastersCount = _appState.masterChecklists.length;
  const sitesCount = _appState.sites.length;
  const openTickets = _appState.tickets.filter(t => t.status === 'Open').length;

  document.getElementById('stat-count-checklists').textContent = mastersCount;
  document.getElementById('stat-count-frequencies').textContent = sitesCount;
  document.getElementById('stat-count-escalations').textContent = openTickets;

  const ovChk = document.getElementById('overview-chk-count');
  const ovSites = document.getElementById('overview-sites-count');
  const ovTickets = document.getElementById('overview-tickets-count');

  if (ovChk) ovChk.textContent = mastersCount;
  if (ovSites) ovSites.textContent = sitesCount;
  if (ovTickets) ovTickets.textContent = openTickets;

  renderTicketsTable();
  renderCommentsFeed();
}

// Render recent commenting feed log (4.5.j)
function renderCommentsFeed() {
  const container = document.getElementById('comments-feed-container');
  if (!container) return;

  container.innerHTML = '';
  
  if (_appState.comments.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">No comments/logs entered yet.</div>`;
    return;
  }

  _appState.comments.slice(0, 5).forEach(c => {
    container.innerHTML += `
      <div class="comment-item">
        <div style="font-weight:600; color:var(--primary);">${c.checklistName}</div>
        <p style="margin-top:4px; color:var(--text-primary); font-size:11px;">"${c.comment}"</p>
        <div class="comment-meta">
          <span>By: ${c.userName} (${c.siteName})</span>
          <span>${c.timestamp}</span>
        </div>
      </div>
    `;
  });
}

function postAuditingComment() {
  const input = document.getElementById('add-comment-input');
  const text = input.value.trim();
  if (!text) return;

  const newComment = {
    id: 'c_' + Date.now(),
    siteName: 'All Sites',
    checklistName: 'Compliance Note',
    userName: _appState.activeUserRole,
    comment: text,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  _appState.comments.unshift(newComment);
  syncState();
  
  input.value = '';
  renderCommentsFeed();
}

// Modals management
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// Global checklist template dropdown populator
function populateDropdowns() {
  const modalFreqSelect = document.getElementById('checklist-freq');
  const checklistFilter = document.getElementById('checklist-filter-freq');

  if (modalFreqSelect) {
    modalFreqSelect.innerHTML = '';
    _appState.frequencies.forEach(f => {
      modalFreqSelect.innerHTML += `<option value="${f.id}">${f.name}</option>`;
    });
  }

  if (checklistFilter) {
    checklistFilter.innerHTML = '<option value="all">All Frequencies</option>';
    _appState.frequencies.forEach(f => {
      checklistFilter.innerHTML += `<option value="${f.id}">${f.name}</option>`;
    });
  }
}

// Bind load trigger
window.addEventListener('DOMContentLoaded', () => {
  initApplicationSuite();
  populateDropdowns();
});
