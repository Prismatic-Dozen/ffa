// ===== MAIN ROUTER AND INITIALIZATION =====

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const el = document.getElementById(pageId);
  if (el) el.classList.add('active');
  
  const nav = document.querySelector('[data-page="' + pageId + '"]');
  if (nav) nav.classList.add('active');
  
  const titles = { 
    'overview-page':'Defect Dashboard',
    'asset-page':'Asset Hierarchy',
    'faults-page':'Fault Library',
    'sites-page':'Sites Management',
    'adoption-page':'Adoption & Mapping',
    'record-page':'Record Defect',
    'reports-page':'Analytics & Reports',
    'admin-page':'Access Control' 
  };
  
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = titles[pageId] || 'Dashboard';
  }
  
  if (pageId === 'overview-page') renderOverview();
  if (pageId === 'faults-page') renderFaultLibrary();
  if (pageId === 'sites-page') renderSites();
  if (pageId === 'asset-page') renderAssetTree();
  if (pageId === 'record-page') populateRecordForm();
  if (pageId === 'reports-page') renderReports();
  if (pageId === 'admin-page') renderAdmin();
  if (pageId === 'adoption-page') renderAdoption();
}

function showModal(id) { 
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open'); 
}

function hideModal(id) { 
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open'); 
}

// ===== TAB & NAVIGATION CLICKS =====
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('tab-btn')) {
    const tabId = e.target.getAttribute('data-tab');
    e.target.parentElement.querySelectorAll('.tab-btn').forEach(t=>t.classList.remove('active'));
    e.target.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(p => {
      if (p.id === tabId) { 
        p.classList.add('active'); 
        if (tabId==='rec-list') renderDefectList(); 
      } else {
        p.classList.remove('active');
      }
    });
  }
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

// ===== OVERVIEW STATS RENDERER =====
function renderOverview() {
  const total = _state.defects.length;
  const open = _state.defects.filter(d => d.status === 'Open').length;
  const closed = _state.defects.filter(d => d.status === 'Closed').length;
  const critical = _state.defects.filter(d => d.cat === 'Critical' && d.status !== 'Closed').length;
  
  const totalEl = document.getElementById('stat-total');
  const openEl = document.getElementById('stat-open');
  const closedEl = document.getElementById('stat-closed');
  const criticalEl = document.getElementById('stat-critical');
  const badgeEl = document.getElementById('open-badge');
  
  if (totalEl) totalEl.textContent = total;
  if (openEl) openEl.textContent = open;
  if (closedEl) closedEl.textContent = closed;
  if (criticalEl) criticalEl.textContent = critical;
  if (badgeEl) badgeEl.textContent = open;

  const tbody = document.getElementById('recent-defects-body');
  if (tbody) {
    tbody.innerHTML = '';
    _state.defects.slice(0,5).forEach(d => {
      const site = _state.sites.find(s => s.id === d.siteId);
      const asset = _state.assets.find(a => a.id === d.equipId);
      tbody.innerHTML += '<tr><td>' + (asset ? asset.naming : '-') + '<br><span style="font-size:10px;color:var(--muted)">' + (site ? site.name : '-') + '</span></td><td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + d.obs.substring(0,50) + '...</td><td><span class="badge badge-' + d.cat.toLowerCase() + '">' + d.cat + '</span></td><td><span class="badge badge-' + d.status.toLowerCase().replace(' ','-') + '">' + d.status + '</span></td></tr>';
    });
  }

  // Chart
  const cats = ['Critical','High','Medium','Low'];
  const colors = ['#ef4444','#f59e0b','#6366f1','#64748b'];
  const chartEl = document.getElementById('overview-chart');
  if (chartEl) {
    chartEl.innerHTML = '';
    cats.forEach((cat, i) => {
      const cnt = _state.defects.filter(d => d.cat === cat && d.status !== 'Closed').length;
      const pct = Math.min(cnt * 30 + 20, 140);
      chartEl.innerHTML += '<div class="chart-bar-wrap"><div class="chart-bar" style="height:' + (cnt > 0 ? pct : 8) + 'px;background:' + colors[i] + ';"></div><div class="chart-label">' + cat.substring(0,4) + '<br><strong>' + cnt + '</strong></div></div>';
    });
  }
}

// ===== INIT BOOTSTRAP =====
document.addEventListener('DOMContentLoaded', function() {
  initState();
  initTheme();
  renderOverview();
  renderSites();
  populateRecordForm();
});
