document.addEventListener('DOMContentLoaded', () => {

    const quantityInputs = document.querySelectorAll('.item-quantity');
    const totalPriceElement = document.getElementById('total-price');
    const submitBtn = document.getElementById('submit-btn');
    
    // ★★★ GASのウェブアプリURLをここに貼り付けてください ★★★
    const GAS_URL = 'GASのURLを貼り付ける'; 

    function updateTotalPrice() {
        let total = 0;
        quantityInputs.forEach(input => {
            total += parseInt(input.value) * parseInt(input.dataset.price);
        });
        totalPriceElement.textContent = total;
    }

    quantityInputs.forEach(input => {
        input.addEventListener('input', updateTotalPrice);
    });

    submitBtn.addEventListener('click', () => {
        
        const orderDetails = {
            blackicecoffee: document.getElementById('black-coffee-ice-quantity').value,
            blackhotcoffee: document.getElementById('black-coffee-hot-quantity').value,
            cafeaulaitice: document.getElementById('cafe-au-lait-ice-quantity').value,
            cafeaulaithot: document.getElementById('cafe-au-lait-hot-quantity').value,
            calpissoda: document.getElementById('calpis-soda-quantity').value,
            frenchtoast: document.getElementById('french-toast-quantity').value,
            totalPrice: totalPriceElement.textContent
        };

        if (orderDetails.totalPrice <= 0) {
            alert('商品を1つ以上選択してください。');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';

        fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify(orderDetails),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.artistName) {
                alert('注文を受け付けました！\nお客様の受付名は【 ' + data.artistName + ' 】です。');
                
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
            submitBtn.disabled = false;
            submitBtn.textContent = '注文を確定する';
        });
    });

    updateTotalPrice();
});
