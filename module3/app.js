// ===== MAIN ROUTER AND INITIALIZATION =====

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const el = document.getElementById(pageId);
  if (el) el.classList.add('active');
  
  const nav = document.querySelector('[data-page="' + pageId + '"]');
  if (nav) nav.classList.add('active');
  
  const titles = { 
    'overview-page': 'Log Book Dashboard',
    'entry-page': 'Daily Log Book Entry',
    'review-page': 'Review Logs & Narratives',
    'tracker-page': 'Action Items & Follow-up Tracker',
    'admin-page': 'Log Access Control' 
  };
  
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = titles[pageId] || 'Digital Log Book';
  }
  
  if (pageId === 'overview-page') renderDashboard();
  if (pageId === 'entry-page') initLogEntryForm();
  if (pageId === 'review-page') renderReviewList();
  if (pageId === 'tracker-page') renderFollowUpTracker();
  if (pageId === 'admin-page') renderAdmin();
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
    e.target.parentElement.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(p => {
      if (p.id === tabId) { 
        p.classList.add('active'); 
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

// ===== INIT BOOTSTRAP =====
document.addEventListener('DOMContentLoaded', function() {
  initState();
  initTheme();
  renderDashboard();
  renderReviewList();
  renderFollowUpTracker();
  initLogEntryForm();
  
  // Initialize review date filters
  const startEl = document.getElementById('rev-start-date');
  const endEl = document.getElementById('rev-end-date');
  if (startEl && endEl) {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    startEl.value = oneWeekAgo.toISOString().slice(0, 10);
    endEl.value = today.toISOString().slice(0, 10);
  }
});
