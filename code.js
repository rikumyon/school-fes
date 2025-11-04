// ====== アーティストリスト（1番から30番までを定義） ======
const ARTIST_LIST = [
  // 1-10
  "Saucy Dog", "10-FEET", "あいみょん", "ヤバイTシャツ屋さん", "クリープハイプ",
  "04 Limited Sazabys", "RADWIMPS", "HEY-SMITH", "ハルカミライ", "マキシマム ザ ホルモン",
  // 11-20
  "WANIMA", "SUPER BEAVER", "SHISHAMO", "Kroi", "WurtS",
  "マカロニえんぴつ", "sumika", "go!go!vanillas", "Vaundy", "Mrs.GREEN APPLE",
  // 21-30
  "Penthouse","UNISON SQUARE GARDEN", "サンボマスター", "Official髭男dism", "ONE OK ROCK", 
  "緑黄色社会", "indigo la End", "King Gnu", "PEOPLE 1", "米津玄師"
];


// ====== メインの関数群 ======

function doPost(e) {
  try {
    const targetSheet = getTargetSheetForToday();
    if (!targetSheet) throw new Error("本日の日付に対応するシートが見つかりませんでした。");

    const orderData = JSON.parse(e.postData.contents);
    const nextReceiptNumber = getNextReceiptNumber(targetSheet);
    const artistName = ARTIST_LIST[nextReceiptNumber - 1] || `No. ${nextReceiptNumber}`;
    
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
      artistName,
    ];
    targetSheet.appendRow(newRow);

    const newlyAddedRow = targetSheet.getLastRow();
    addCheckboxToCell(targetSheet, newlyAddedRow, 10);
    addCheckboxToCell(targetSheet, newlyAddedRow, 11);

    return createJsonResponse({ status: "success", artistName: artistName });

  } catch (error) {
    Logger.log(error.toString());
    return createJsonResponse({ status: "error", message: "サーバー側でエラーが発生しました: " + error.message });
  }
}

function doGet(e) {
  try {
    const targetSheet = getTargetSheetForToday();
    if (!targetSheet) throw new Error("本日の日付に対応するシートが見つかりませんでした。");

    const receptionList = [];
    const callingList = [];
    const values = targetSheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const artistName = row[8];
      const isReady = row[9];
      const isHanded = row[10];

      if (!artistName) continue;

      if (isReady === true && isHanded === false) {
        callingList.push(artistName);
      } else if (isReady === false && isHanded === false) {
        receptionList.push(artistName);
      }
    }

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


// ====== 補助的な関数群 ======

function getTargetSheetForToday() {
  const festivalDay1 = new Date(2025, 10, 1);
  const festivalDay2 = new Date(2025, 10, 2);

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today.getTime() === festivalDay1.getTime()) {
    return spreadsheet.getSheetByName("1日目");
  } else if (today.getTime() === festivalDay2.getTime()) {
    return spreadsheet.getSheetByName("2日目");
  } else {
    return spreadsheet.getSheetByName("1日目");
  }
}

function getNextReceiptNumber(sheet) {
  let nextReceiptNumber = 1;
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    // スプレッドシートのI列（9番目の列）の全データを取得
    const artistColumnValues = sheet.getRange(2, 9, lastRow - 1, 1).getValues();
    // 配列を逆順にして、空白ではない最後のアーティスト名を探す
    const lastValidArtistName = artistColumnValues.reverse().find(cell => cell[0] !== "");

    if (lastValidArtistName) {
      const lastIndex = ARTIST_LIST.indexOf(lastValidArtistName[0]);
      if (lastIndex > -1) {
        const lastNumber = lastIndex + 1;
        nextReceiptNumber = (lastNumber >= 30) ? 1 : lastNumber + 1;
      }
    }
  }
  return nextReceiptNumber;
}

function addCheckboxToCell(sheet, row, column) {
  const cell = sheet.getRange(row, column);
  const rule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  cell.setDataValidation(rule);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
