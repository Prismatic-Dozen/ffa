// ===== REPORTS & TREND FUNCTIONS =====

function renderReports() {
  // Monthly chart (mock)
  const months = ['Jan','Feb','Mar','Apr','May','Jun'];
  const vals = [5,8,3,11,7,_state.defects.length];
  const colors = ['rgba(239,68,68,.6)','rgba(239,68,68,.6)','rgba(239,68,68,.6)','rgba(239,68,68,.6)','rgba(239,68,68,.6)','var(--primary)'];
  const chartEl = document.getElementById('monthly-chart');
  if (chartEl) {
    chartEl.innerHTML = '';
    const max = Math.max(...vals);
    months.forEach((m,i) => {
      const h = Math.round((vals[i]/max)*160);
      chartEl.innerHTML += '<div class="chart-bar-wrap"><div class="chart-bar" style="height:' + h + 'px;background:' + colors[i] + ';"></div><div class="chart-label">' + m + '<br><strong>' + vals[i] + '</strong></div></div>';
    });
  }

  // Site breakdown
  const sbEl = document.getElementById('site-breakdown');
  if (sbEl) {
    sbEl.innerHTML = '';
    _state.sites.forEach(s => {
      const cnt = _state.defects.filter(d=>d.siteId===s.id).length;
      const open = _state.defects.filter(d=>d.siteId===s.id && d.status!=='Closed').length;
      const pct = _state.defects.length ? Math.round(cnt/_state.defects.length*100) : 0;
      sbEl.innerHTML += '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;"><span>' + s.name + '</span><span style="color:var(--primary)">' + cnt + ' total / ' + open + ' open</span></div><div style="height:6px;background:var(--surface);border-radius:4px;overflow:hidden;"><div style="height:100%;width:' + pct + '%;background:linear-gradient(to right,var(--primary),var(--accent));border-radius:4px;"></div></div></div>';
    });
  }

  // Aging table
  const atbody = document.getElementById('aging-table-body');
  if (atbody) {
    atbody.innerHTML = '';
    _state.defects.filter(d=>d.status!=='Closed').forEach(d => {
      const asset = _state.assets.find(a=>a.id===d.equipId);
      const raised = new Date(d.raisedOn);
      const days = Math.floor((new Date()-raised)/(1000*60*60*24));
      const slaOk = (d.cat==='Critical'&&days<=1)||(d.cat==='High'&&days<=3)||(d.cat==='Medium'&&days<=7)||(d.cat==='Low'&&days<=14);
      atbody.innerHTML += '<tr><td style="font-weight:700;color:var(--primary-l);">' + d.id + '</td><td>' + (asset?asset.naming:'—') + '</td><td><span class="badge badge-' + d.cat.toLowerCase() + '">' + d.cat + '</span></td><td>' + d.raisedOn + '</td><td style="font-weight:700;color:' + (days>3?'#f87171':'#86efac') + ';">' + days + ' days</td><td><span class="badge ' + (slaOk?'badge-closed':'badge-open') + '">' + (slaOk?'Within SLA':'SLA Breached') + '</span></td><td>' + d.assignedTo + '</td></tr>';
    });
  }
}
