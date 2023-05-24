const CHATWORK_TOKEN = '***';
const CHATWORK_ROOM_ID = '***'; // my
// const CHATWORK_ROOM_ID = '***'; // tsd
const ROOT_FOLDER_ID = '***';
const ARCHIVE_FOLDER_ID = '***';
const SUBJECT_SHEET_ID = '***';
const LOG_SHEET_ID = '***';
const BBS_SHEET_ID = '***';
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
// util & common function
// ------------------------------------------------------------

// status mark
function getEditStatus(stat, size) {
  if (stat === STAUS_OPEN) {
    return '<i class="bi-arrow-up-circle" style="font-size:' + size + 'rem;color:forestgreen;">' + stat + '</i>';
  }
  else {
    return '<i class="bi-check2-circle" style="font-size:' + size + 'rem;color:darkviolet;">' + stat + '</i>';
  }
}

// escape html
function htmlspecialchars(unsafeText){
  if(typeof unsafeText !== 'string'){
    return unsafeText;
  }
  return unsafeText.replace(
    /[&'`"<>]/g, 
    function(match) {
      return {
        '&': '&amp;',
        "'": '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      }[match]
    }
  );
}

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
