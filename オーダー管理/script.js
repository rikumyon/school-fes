// HTMLの読み込みが完了したら実行する
document.addEventListener('DOMContentLoaded', () => {

    // 1. 必要なHTML要素を取得する
    const quantityInputs = document.querySelectorAll('.item-quantity');
    const totalPriceElement = document.getElementById('total-price');
    const submitBtn = document.getElementById('submit-btn');
    const GAS_URL = 'gasのURLを貼る';

    // 2. 合計金額を計算して表示する関数
    function updateTotalPrice() {
        let total = 0;
        quantityInputs.forEach(input => {
            const quantity = parseInt(input.value);
            const price = parseInt(input.dataset.price);
            total += quantity * price;
        });
        totalPriceElement.textContent = total;
    }

    // 3. 全ての個数入力欄にイベントリスナーを設定
    quantityInputs.forEach(input => {
        input.addEventListener('input', updateTotalPrice);
    });

    // 4. 注文ボタンが押されたときの処理を更新
    submitBtn.addEventListener('click', () => {
        
        // 注文データを作成
        const orderDetails = {
            blackicecoffee: document.getElementById('black-coffee-ice-quantity').value,
            blackhotcoffee: document.getElementById('black-coffee-hot-quantity').value,
            cafeaulaitice: document.getElementById('cafe-au-lait-ice-quantity').value,
            cafeaulaithot: document.getElementById('cafe-au-lait-hot-quantity').value,
            calpissoda: document.getElementById('calpis-soda-quantity').value,
            frenchtoast: document.getElementById('french-toast-quantity').value,
            totalPrice: totalPriceElement.textContent
        };
        const filteredOrder = {};
        for (const key in orderDetails) {
            if (parseInt(orderDetails[key]) > 0) {
                filteredOrder[key] = parseInt(orderDetails[key]);
            }
        }
        if (Object.keys(filteredOrder).length === 0 || filteredOrder.totalPrice === 0) {
            alert('商品を1つ以上選択してください。');
            return;
        }

        // ボタンの表示を変更して、連打を防止
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';

        // fetch APIを使ってGASにデータを送信
        fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify(filteredOrder),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
        })
        .then(response => response.json())
        .then(data => {
            // ★サーバーからの返信を待ってから処理する
            if (data.status === 'success' && data.receiptNumber) {
                // ★★★ 受付番号を含めたメッセージを表示 ★★★
                alert('注文を受け付けました！\n受付番号は【 ' + data.receiptNumber + ' 】です。');
                
                // フォームをリセット
                quantityInputs.forEach(input => input.value = 0);
                updateTotalPrice();
            } else {
                alert('注文に失敗しました。もう一度お試しください。');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('エラーが発生しました。通信環境を確認してください。');
        })
        .finally(() => {
            // ボタンを元に戻す
            submitBtn.disabled = false;
            submitBtn.textContent = '注文を確定する';
        });
    });

    // 初期表示時にも一度計算を実行しておく 
    updateTotalPrice();
});
