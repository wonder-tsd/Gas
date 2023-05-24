// ------------------------------------------------------------
// edit
// ------------------------------------------------------------

// get by id
function edit_getSubject(sid) {
  const row = Number(sid) + 1;
  const sheet = getSubjectSheet();
  const ssid = sheet.getRange(row, 1).getValue();
  if (sid != ssid) {
    throw new RangeError('sid not found ' + sid);
  }

  const subject = {
    sid: ssid,
    dt: Utilities.formatDate(sheet.getRange(row, 2).getValue(), 'JST', 'yyyy-MM-dd HH:mm'),
    title: sheet.getRange(row, 3).getValue(),
    state: sheet.getRange(row, 4).getValue(),
    detail: sheet.getRange(row, 5).getValue(),
    author: sheet.getRange(row, 8).getValue()
  };

  return subject;
}

function edit_getEditButton(stat) {
  if (stat === STAUS_OPEN) {
    return '<button type="button" class="btn btn-primary m-1" onclick="updateSubject()">登録</button>'
      + '<button type="button" class="btn btn-secondary m-1" onclick="success()">キャンセル</button>'
      + '<button type="button" class="btn btn-outline-dark m-1" onclick="closeSubject()">'
      + '<i class="bi-check2-circle" style="font-size:1rem;color:darkviolet;">案件をクローズしてアーカイブする</i></button>';
  }
  else {
    return '<button type="button" class="btn btn-secondary m-1" onclick="moveToClosed()">戻る</button>';
  }
}

// update
function edit_updateSubject(subject) {
  // param
  const sid = subject['sid'];
  const title = isNullOrWhitespace(subject['title']) ? '無題' : subject['title'];
  const detail = subject['detail'];

  const row = Number(sid) + 1;
  const sheet = getSubjectSheet();

  // set value  
  sheet.getRange(row, 3).setValue(title);
  sheet.getRange(row, 5).setValue(detail);

  return true;
}

// close
function edit_closeSubject(subject) {
  // param
  const sid = subject['sid'];

  const row = Number(sid) + 1;
  const sheet = getSubjectSheet();

  // move
  const sfid = sheet.getRange(row, 7).getValue();
  const sf = DriveApp.getFolderById(sfid);
  const df = DriveApp.getFolderById(ARCHIVE_FOLDER_ID);
  sf.moveTo(df);

  // set value  
  sheet.getRange(row, 4).setValue(STAUS_CLOSED);

  return true;
}
