const CHATWORK_TOKEN = '1efea009b556d3a775e820de1f8f2181';
const CHATWORK_ROOM_ID = '###'; // my
// const CHATWORK_ROOM_ID = '###'; // t
const ROOT_FOLDER_ID = '###';
const ARCHIVE_FOLDER_ID = '###';
const SUBJECT_SHEET_ID = '###';
const LOG_SHEET_ID = '###';
const BBS_SHEET_ID = '###';
const NEW_LINE = '\n';
const STAUS_OPEN = 'Open';
const STAUS_CLOSED = 'Closed';

// http get
function doGet(e) {
  // param 
  let page = e.pathInfo ? e.pathInfo : 'index';
  const sid = e.parameter.sid ? e.parameter.sid : '0';
  const filter = e.parameter.filter ? e.parameter.filter : 'open';

  // chk
  const user = getActiveUser();
  if (user === null) {
    page = 'error';
  }

  // tpl
  const template = (() => {
    try {
      return HtmlService.createTemplateFromFile(page);
    } catch (e) {
      return HtmlService.createTemplateFromFile('error');
    }
  })();
  template.url = ScriptApp.getService().getUrl();
  template.sid = sid;
  template.filter = filter;
  template.user = user;

  return template.evaluate();
}

// ------------------------------------------------------------
// list
// ------------------------------------------------------------

function getSubjects(filter) {
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
    html += subject[2];
    html += '</a>';
    html += '</div>';
    html += '<div>';
    html += '<small class="text-muted">' + Utilities.formatDate(subject[1], 'JST', 'yyyy-MM-dd HH:mm') + '</small>';
    html += getEditStatus(state, 0.8);
    html += '</div>';
    html += '</td>';

    html += '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">';
    html += subject[4];
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

// ------------------------------------------------------------
// new sublect
// ------------------------------------------------------------

// regist subject
function registSubject(subject) {
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

// ------------------------------------------------------------
// edit
// ------------------------------------------------------------

// get by id
function getSubject(sid) {
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

function getEditButton(stat) {
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
function updateSubject(subject) {
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
function closeSubject(subject) {
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

// ------------------------------------------------------------
// message
// ------------------------------------------------------------

// send msg
function sendMsg(message) {
  // param
  const title = message['title']
  const msg = message["msg"];
  const body = '案件管理(XXX)からメッセージ送信' + NEW_LINE
    + '●送信者' + NEW_LINE + getActiveUserName() + NEW_LINE + NEW_LINE
    + '●件名' + NEW_LINE + title + NEW_LINE + NEW_LINE
    + '●内容' + NEW_LINE + msg;

  // send msg
  const client = ChatWorkClient.factory({ token: CHATWORK_TOKEN });
  client.sendMessage({
    room_id: CHATWORK_ROOM_ID,
    self_unread: '1',
    body: body
  });

  return true;
}

// ------------------------------------------------------------
// common ui
// ------------------------------------------------------------

function getEditStatus(stat, size) {
  if (stat === STAUS_OPEN) {
    return '<i class="bi-arrow-up-circle" style="font-size:' + size + 'rem;color:forestgreen;">' + stat + '</i>';
  }
  else {
    return '<i class="bi-check2-circle" style="font-size:' + size + 'rem;color:darkviolet;">' + stat + '</i>';
  }
}

// ------------------------------------------------------------
// util & common function
// ------------------------------------------------------------

// get sheet
function getSubjectSheet() {
  const subjectSpread = SpreadsheetApp.openById(SUBJECT_SHEET_ID);
  return subjectSpread.getSheetByName('SOG');
}

// get sheet
function getBbsThreadSheet() {
  const subjectSpread = SpreadsheetApp.openById(BBS_SHEET_ID);
  return subjectSpread.getSheetByName('スレッド');
}

// get sheet
function getBbsCommentSheet() {
  const subjectSpread = SpreadsheetApp.openById(BBS_SHEET_ID);
  return subjectSpread.getSheetByName('コメント');
}

// get user
function getActiveUser() {
  try {
    const em = Session.getActiveUser().getEmail();
    const root = getRootFolder();
    const eds = root.getEditors();
    const ow = root.getOwner();

    for (let i in eds) {
      const ee = eds[i].getEmail();
      if (em === ee) {
        return eds[i];
      }
    }

    if (em === ow.getEmail()) {
      return ow;
    }

    // non
    return null;
  } catch (e) {
    logError(e, 'getActiveUser');
    return null;
  }
}

// get user name
function getActiveUserName() {
  const u = getActiveUser();
  return u.getName() + '<' + u.getEmail() + '>'
}

// get root
function getRootFolder() {
  return DriveApp.getFolderById(ROOT_FOLDER_ID);
}

// log info
function logInfo(s) {
  const subjectSpread = SpreadsheetApp.openById(LOG_SHEET_ID);
  const sheet = subjectSpread.getSheetByName('SOG');
  const row = sheet.getLastRow() + 1;

  // set value  
  sheet.getRange(row, 1).setValue(Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd HH:mm:ss'));
  sheet.getRange(row, 2).setValue('info');
  sheet.getRange(row, 3).setValue(s);
}

// log err
function logError(ex, s) {
  const subjectSpread = SpreadsheetApp.openById(LOG_SHEET_ID);
  const sheet = subjectSpread.getSheetByName('SOG');
  const row = sheet.getLastRow() + 1;

  // set value  
  sheet.getRange(row, 1).setValue(Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd HH:mm:ss'));
  sheet.getRange(row, 2).setValue('error');
  sheet.getRange(row, 3).setValue(ex.name + ': ' + ex.message + NEW_LINE + s);
}

// is null or whitespace
function isNullOrWhitespace(text) {
  return text === null || text.match(/^ *$/) !== null;
};

// -----------------------------------
// hoge fuga
function hoge() {

  //const html = getSubjects('open');
  //Logger.log(html);

  //const sheet = getSubjectSheet();
  //const sfid = sheet.getRange(2, 7).getValue();
  //const sf = DriveApp.getFolderById(sfid);
  //const df = DriveApp.getFolderById(ARCHIVE_FOLDER_ID);
  //sf.moveTo(df);

  //const subject = getSubject(1);
  //Logger.log(subject);

  //logInfo('aaa');

  //try {
  //throw new Error('Whoops!')
  //} catch (e) {
  //logError(e, 'aaa');
  //console.error(e.name + ': ' + e.message)
  //}

  //const rootFolder = getRootFolder();
  //const editors = rootFolder.getEditors();
  //const ow = rootFolder.getOwner();
  //const em = Session.getActiveUser().getEmail()
  //Logger.log(em);
  //Logger.log(ow.getEmail() + "<" + ow.getName() + ">");
  //Logger.log(editors[0].getEmail() + "<" + editors[0].getName() + ">");
  //Logger.log(editors[1].getEmail() + "<" + editors[1].getName() + ">");

  //const client = ChatWorkClient.factory({ token: CHATWORK_TOKEN });
  //client.sendMessage({
  //room_id: CHATWORK_ROOM_ID,
  //self_unread: '1',
  //body: "test"
  //});
}
