// ------------------------------------------------------------
// message
// ------------------------------------------------------------

// send msg
function message_sendMsg(message) {
  // param
  const title = message['title']
  const msg = message["msg"];
  const body = '案件管理(SOG)からメッセージ送信' + NEW_LINE
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
