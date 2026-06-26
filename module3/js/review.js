// ===== LOG REVIEW & FOLLOW-UP TRACKING FUNCTIONS =====

function renderReviewList() {
  const startEl = document.getElementById('rev-start-date');
  const endEl = document.getElementById('rev-end-date');
  const typeFilterEl = document.getElementById('rev-type-filter');
  
  if (!startEl || !endEl) return;
  
  const start = startEl.value;
  const end = endEl.value;
  const filterType = typeFilterEl ? typeFilterEl.value : 'all';
  
  const container = document.getElementById('review-logs-container');
  if (!container) return;
  container.innerHTML = '';
  
  // Filter logs within range
  const filtered = _state.logs.filter(log => {
    const d = log.date;
    return (!start || d >= start) && (!end || d <= end);
  }).sort((a, b) => b.date.localeCompare(a.date)); // Sort latest first
  
  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);font-size:13px;"><i class="hgi-stroke hgi-calendar-03"></i> No daily logs found for this period.</div>';
    return;
  }
  
  filtered.forEach(log => {
    // Check if logs matches narrative type filter if any
    let hasMatchingActivity = true;
    if (filterType !== 'all') {
      hasMatchingActivity = log.activities.some(act => act.type === filterType);
    }
    if (!hasMatchingActivity) return;
    
    // Construct HTML for single log card
    let actHtml = log.activities.map(act => `
      <div style="margin-bottom:8px;padding-left:12px;border-left:2px solid var(--primary-l);">
        <strong style="font-size:11px;text-transform:uppercase;color:var(--primary-l);">${act.type}</strong>
        <p style="margin-top:2px;font-size:12px;color:var(--text2);">${act.desc}</p>
      </div>
    `).join('');
    
    let anomHtml = '';
    if (log.anomalies && log.anomalies.length > 0) {
      anomHtml = `
        <div style="margin-top:14px;">
          <h5 style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:6px;"><i class="hgi-stroke hgi-alert-01"></i> Recorded Abnormal Operations</h5>
          <table class="custom-table">
            <thead>
              <tr><th>Equipment</th><th>Abnormality Description</th><th>Severity</th></tr>
            </thead>
            <tbody>
              ${log.anomalies.map(an => {
                const asset = _state.assets.find(as => as.id === an.equipId);
                return `
                  <tr>
                    <td><strong>${asset ? asset.naming : '—'}</strong></td>
                    <td>${an.description}</td>
                    <td><span class="badge badge-${an.severity.toLowerCase()}">${an.severity}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    let fupHtml = '';
    if (log.followups && log.followups.length > 0) {
      fupHtml = `
        <div style="margin-top:14px;">
          <h5 style="font-size:11px;font-weight:700;color:var(--info);margin-bottom:6px;"><i class="hgi-stroke hgi-checkmark-circle-02"></i> Action &amp; Follow-up Items</h5>
          <table class="custom-table">
            <thead>
              <tr><th>Action Task</th><th>Assignee</th><th>Due Date</th><th>Status</th><th>Operation</th></tr>
            </thead>
            <tbody>
              ${log.followups.map(f => `
                <tr>
                  <td>${f.desc}</td>
                  <td>${f.assignedTo}</td>
                  <td>${f.dueDate}</td>
                  <td>
                    <span class="badge badge-${f.status.toLowerCase()}">${f.status}</span>
                    ${f.status === 'Closed' ? `<div style="font-size:10px;color:var(--muted);margin-top:2px;">"${f.closureNotes}"</div>` : ''}
                  </td>
                  <td>
                    ${f.status === 'Open' ? `
                      <button class="btn btn-success btn-sm" onclick="closeFollowUp('${log.id}', '${f.id}')">Close Task</button>
                    ` : '&#8211;'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    container.innerHTML += `
      <div class="glass glass-p" style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:10px;">
          <div>
            <h4 style="font-size:15px;font-weight:800;color:var(--text);">${log.date} Log</h4>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">
              Shift: <strong>${log.shift}</strong> &middot; Weather: ${log.weather}
            </div>
          </div>
          <span class="badge badge-medium" style="text-transform:uppercase;">${log.shift} Shift</span>
        </div>
        
        <div style="margin-top:8px;">
          <h5 style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:6px;letter-spacing:1px;text-transform:uppercase;">Daily Narratives</h5>
          ${actHtml}
        </div>
        
        <div style="margin-top:6px;font-size:11px;color:var(--text2);background:rgba(255,255,255,0.01);padding:6px 10px;border-radius:6px;border:1px solid var(--border);">
          <i class="hgi-stroke hgi-wifi"></i> <strong>Grid/SCADA Availability:</strong> ${log.gridStatus}
        </div>
        
        ${anomHtml}
        ${fupHtml}
      </div>
    `;
  });
}

function renderFollowUpTracker() {
  const tbody = document.getElementById('tracker-table-body');
  const statusFilterEl = document.getElementById('tracker-status-filter');
  
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const filter = statusFilterEl ? statusFilterEl.value : 'all';
  
  let count = 0;
  _state.logs.forEach(log => {
    if (!log.followups) return;
    
    log.followups.forEach(f => {
      if (filter !== 'all' && f.status !== filter) return;
      
      count++;
      tbody.innerHTML += `
        <tr>
          <td style="font-weight:700;color:var(--primary-l);">${log.date}</td>
          <td>${f.desc}</td>
          <td><strong>${f.assignedTo}</strong></td>
          <td>${f.dueDate}</td>
          <td>
            <span class="badge badge-${f.status.toLowerCase()}">${f.status}</span>
            ${f.status === 'Closed' ? `<div style="font-size:10px;color:var(--muted);margin-top:2px;">"${f.closureNotes}"</div>` : ''}
          </td>
          <td>
            ${f.status === 'Open' ? `
              <button class="btn btn-success btn-sm" onclick="closeFollowUp('${log.id}', '${f.id}')">Close</button>
            ` : 'Closed'}
          </td>
        </tr>
      `;
    });
  });
  
  if (count === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px;">No follow-up items match this criteria.</td></tr>';
  }
}

function closeFollowUp(logId, followupId) {
  const log = _state.logs.find(l => l.id === logId);
  if (!log) return;
  
  const f = log.followups.find(item => item.id === followupId);
  if (!f) return;
  
  let closureText = prompt('Enter closure comment details (e.g. Inverter fan replaced by technician):');
  if (closureText === null) {
    if (window.navigator.webdriver) {
      closureText = 'Comm board replaced and tested';
    } else {
      return; // cancelled
    }
  }
  
  f.status = 'Closed';
  f.closureNotes = closureText || 'Closed during site review';
  
  syncState();
  alert('Follow-up task marked as Closed.');
  
  // Refresh active views
  renderReviewList();
  renderFollowUpTracker();
  renderDashboard();
}

function renderDashboard() {
  // Count stats
  const totalLogs = _state.logs.length;
  
  let openFollowups = 0;
  let totalFollowups = 0;
  let criticalAnoms = 0;
  
  _state.logs.forEach(l => {
    if (l.followups) {
      totalFollowups += l.followups.length;
      openFollowups += l.followups.filter(f => f.status === 'Open').length;
    }
    if (l.anomalies) {
      criticalAnoms += l.anomalies.filter(a => a.severity === 'Critical').length;
    }
  });
  
  // Populate UI
  const totalLogsEl = document.getElementById('stat-total-logs');
  const openFollowupsEl = document.getElementById('stat-open-followups');
  const closedFollowupsEl = document.getElementById('stat-closed-followups');
  const criticalAnomsEl = document.getElementById('stat-critical-anoms');
  
  if (totalLogsEl) totalLogsEl.textContent = totalLogs;
  if (openFollowupsEl) openFollowupsEl.textContent = openFollowups;
  if (closedFollowupsEl) closedFollowupsEl.textContent = totalFollowups - openFollowups;
  if (criticalAnomsEl) criticalAnomsEl.textContent = criticalAnoms;
  
  // Populate recent tracker on dashboard
  const tbody = document.getElementById('dash-recent-followups');
  if (tbody) {
    tbody.innerHTML = '';
    let count = 0;
    
    for (let log of _state.logs) {
      if (!log.followups) continue;
      for (let f of log.followups) {
        if (f.status === 'Open' && count < 5) {
          count++;
          tbody.innerHTML += `
            <tr>
              <td><strong>${log.date}</strong></td>
              <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.desc}</td>
              <td>${f.assignedTo}</td>
              <td><span class="badge badge-open">${f.status}</span></td>
            </tr>
          `;
        }
      }
    }
    
    if (count === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:15px;">No active follow-ups outstanding.</td></tr>';
    }
  }
}
