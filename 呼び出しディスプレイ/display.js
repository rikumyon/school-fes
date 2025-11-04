// ★★★ Google Apps ScriptのウェブアプリURLをここに貼り付け ★★★
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyD0ckIJeqXrziordpk4iCYv5yctp33JXa_tQIzsC0JxD898RKDgnrpYiqQyaZFVhI/exec';

// HTML要素をあらかじめ取得しておく
const receptionNumbersDiv = document.getElementById('reception-numbers');
const callingNumbersDiv = document.getElementById('calling-numbers');
const waitingCountSpan = document.getElementById('waiting-count');
const readyCountSpan = document.getElementById('ready-count');
const timeDisplayDiv = document.getElementById('current-time');

// データを取得して画面を更新するメインの関数
async function updateDisplay() {
    try {
        const response = await fetch(GAS_URL);
        if (!response.ok) throw new Error('ネットワーク応答エラー');
        
        const data = await response.json();

        if (data.status === 'success') {
            // 画面を一度空にする
            receptionNumbersDiv.innerHTML = '';
            callingNumbersDiv.innerHTML = '';

            // ヘッダーの組数を更新
            waitingCountSpan.textContent = data.reception.length;
            readyCountSpan.textContent = data.calling.length;

            // 「呼び出し中」の番号を描画
            data.calling.forEach(artistName => {
                const plate = createArtistPlate(artistName);
                callingNumbersDiv.appendChild(plate);
            });

            // 「受付中」の番号を描画
            data.reception.forEach(artistName => {
                const plate = createArtistPlate(artistName);
                receptionNumbersDiv.appendChild(plate);
            });
        } else {
            console.error('データ取得失敗:', data.message);
        }
    } catch (error) {
        console.error('通信エラー:', error);
    }
}

// アーティスト名の番号札を作成する関数
function createArtistPlate(name) {
    const div = document.createElement('div');
    div.className = 'artist-plate'; 
    div.textContent = name;
    return div;
}

// 時計を更新する関数
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeDisplayDiv.textContent = `${hours}:${minutes}`;
}

// === 初期実行と定期実行 ===

// ページ読み込み時に初回実行
updateDisplay();
updateTime();

// 5秒ごとに番号を更新
setInterval(updateDisplay, 5000);
// 1秒ごとに時計を更新
setInterval(updateTime, 1000);