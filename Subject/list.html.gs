// ------------------------------------------------------------
// list
// ------------------------------------------------------------

// get
function list_getSubjects(filter) {
  let html = '';
  const url = ScriptApp.getService().getUrl();
  const sheet = getSubjectSheet();
  const subjects = sheet.getDataRange().getValues();

  for (let i = subjects.length - 1; 0 < i; i--) {
    const subject = subjects[i];
    const state = subject[3];
    if (state === 'Closed' && filter === 'open') { continue; }
    if (state === 'Open' && filter === 'closed') { continue; }

    html += '<tr>';
    html += '<td>';
    html += subject[0];
    html += '</td>';

    html += '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">';
    html += '<div style="overflow:hidden;text-overflow:ellipsis;">';
    html += '<a href="' + url + '/edit?sid=' + subject[0] + '">';
    html += htmlspecialchars(subject[2]);
    html += '</a>';
    html += '</div>';
    html += '<div>';
    html += '<small class="text-muted">' + Utilities.formatDate(subject[1], 'JST', 'yyyy-MM-dd HH:mm') + '</small>';
    html += getEditStatus(state, 0.8);
    html += '</div>';
    html += '</td>';

    html += '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">';
    html += htmlspecialchars(subject[4]);
    html += '</td>';

    html += '<td>';
    html += '<a href="https://drive.google.com/drive/u/2/folders/' + subject[6] + '" target="_blank">';
    html += subject[5];
    html += '</a>';
    html += '</td>';
    html += '</tr>';
  }

  return html;
}
