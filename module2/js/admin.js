// ===== ACCESS CONTROL ADMIN FUNCTIONS =====

function renderAdmin() {
  const tbody = document.getElementById('admin-roles-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  _state.permissions.forEach(p => {
    const fields = ['view','create','close','editLib','manageAssets','admin'];
    tbody.innerHTML += '<tr><td style="font-weight:700;">' + p.role + '</td>' +
      fields.map(f => '<td style="text-align:center;"><input type="checkbox" ' + (p[f]?'checked':'') + '></td>').join('') + '</tr>';
  });
}
