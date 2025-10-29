// Webサイトからの注文データを受け取り、スプレッドシートに記録する関数
function doPost(e) {
  try {
    const targetSheet = getTargetSheetForToday(); // 今日の日付に対応するシートを取得
    if (!targetSheet) {
      throw new Error("本日の日付に対応するシートが見つかりませんでした。");
    }

    // 1. 新しい行に注文データを書き込む
    const orderData = JSON.parse(e.postData.contents);
    const nextReceiptNumber = getNextReceiptNumber(targetSheet);
    const timestamp = new Date();
    const newRow = [
      timestamp,
      orderData.blackicecoffee || 0,
      orderData.blackhotcoffee || 0,
      orderData.cafeaulaitice || 0,
      orderData.cafeaulaithot || 0,
      orderData.calpissoda || 0,
      orderData.frenchtoast || 0,
      orderData.totalPrice || 0,
      nextReceiptNumber,
    ];
    targetSheet.appendRow(newRow);

    // 2. 書き込んだ行の列（準備完了）にチェックボックスを追加
    const newlyAddedRow = targetSheet.getLastRow();
    addCheckboxToCell(targetSheet, newlyAddedRow, 10); // 10番目の列はJ列
    addCheckboxToCell(targetSheet, newlyAddedRow,11); // 11番目の列はK列

    return createJsonResponse({ status: "success", receiptNumber: nextReceiptNumber });

  } catch (error) {
    Logger.log(error.toString());
    return createJsonResponse({ status: "error", message: "サーバー側でエラーが発生しました: " + error.message });
  }
}

// ディスプレイ画面から呼び出され、現在の番号状況を返す関数
function doGet(e) {
  try {
    const targetSheet = getTargetSheetForToday();
    if (!targetSheet) {
      throw new Error("本日の日付に対応するシートが見つかりませんでした。");
    }

    const receptionList = []; // 受付中の番号リスト
    const callingList = [];   // 呼び出し中の番号リスト

    const dataRange = targetSheet.getDataRange();
    const values = dataRange.getValues();

    // 2行目から（ヘッダーをスキップ）ループ処理
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const receiptNumber = row[8]; // I列: 受付番号
      const isReady = row[9];       // J列: 準備完了チェック
      const isHanded = row[10];      // K列: 受け渡しチェック

      if (!receiptNumber) continue; // 受付番号がなければスキップ

      if (isReady === true && isHanded === false) {
        callingList.push(receiptNumber);
      } else if (isReady === false && isHanded === false) {
        receptionList.push(receiptNumber);
      }
      // 両方Trueの場合はリストに追加しない（=画面から消える）
    }
    
    // 番号を昇順でソート
    receptionList.sort((a, b) => a - b);
    callingList.sort((a, b) => a - b);

    return createJsonResponse({
      status: "success",
      reception: receptionList,
      calling: callingList,
    });

  } catch (error) {
    Logger.log(error.toString());
    return createJsonResponse({ status: "error", message: "データ取得エラー: " + error.message });
  }
}

// 今日の日付に基づいて操作対象のシートを返す
function getTargetSheetForToday() {
  const festivalDay1 = new Date(2025, 10, 1); // 例：2025年11月1日
  const festivalDay2 = new Date(2025, 10, 2); // 例：2025年11月2日

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today.getTime() === festivalDay1.getTime()) {
    return spreadsheet.getSheetByName("1日目");
  } else if (today.getTime() === festivalDay2.getTime()) {
    return spreadsheet.getSheetByName("2日目");
  } else {
    return spreadsheet.getSheetByName("1日目"); // テスト用
  }
}

// 次の受付番号を計算して返す
function getNextReceiptNumber(sheet) {
  let nextReceiptNumber = 1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const lastReceiptNumberRaw = sheet.getRange(lastRow, 9).getValue(); // I列
    const lastReceiptNumber = parseInt(lastReceiptNumberRaw) || 0;
    nextReceiptNumber = (lastReceiptNumber >= 30) ? 1 : lastReceiptNumber + 1;
  }
  return nextReceiptNumber;
}

// 指定したセルにチェックボックスを追加する
function addCheckboxToCell(sheet, row, column) {
  const cell = sheet.getRange(row, column);
  const rule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  cell.setDataValidation(rule);
}

// CORSエラーを防ぐためのJSON形式の返信を作成する
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
