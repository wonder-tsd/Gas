// ------------------------------------------------------------
// new sublect
// ------------------------------------------------------------

// regist subject
function add_registSubject(subject) {
  // param
  const title = isNullOrWhitespace(subject['title']) ? '無題' : subject['title'];
  const detail = subject['detail'];

  // folder
  const sheet = getSubjectSheet();
  const row = sheet.getLastRow() + 1;
  const now = new Date();
  const fnm = Utilities.formatDate(now, 'JST', 'yyyyMMdd') + "_" + (row - 1);
  const folder = getRootFolder().createFolder(fnm);

  // set value  
  sheet.getRange(row, 1).setValue(row - 1);
  sheet.getRange(row, 2).setValue(Utilities.formatDate(now, 'JST', 'yyyy-MM-dd HH:mm'));
  sheet.getRange(row, 3).setValue(title);
  sheet.getRange(row, 4).setValue(STAUS_OPEN);
  sheet.getRange(row, 5).setValue(detail);
  sheet.getRange(row, 6).setValue(fnm);
  sheet.getRange(row, 7).setValue(folder.getId());
  sheet.getRange(row, 8).setValue(getActiveUserName());

  return true;
}
