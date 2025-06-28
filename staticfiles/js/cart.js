// Get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// Event listener for all update-cart buttons
let updateBtns = document.getElementsByClassName('update-cart');

for (let i = 0; i < updateBtns.length; i++) {
    updateBtns[i].addEventListener('click', function () {
        let productId = this.dataset.product;
        let action = this.dataset.action;
        console.log('productId:', productId, 'action:', action);

        if (user === 'AnonymousUser') {
            addCookieItem(productId, action);
        } else {
            updateUserOrder(productId, action);
        }
    });
}

// For authenticated users
function updateUserOrder(productId, action) {
    fetch('/update_item/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ 'productId': productId, 'action': action })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Data:', data);
            location.reload();
        });
}

// For guest users
function addCookieItem(productId, action) {
    console.log('User is not authenticated');

    if (action === 'add') {
        if (cart[productId] === undefined) {
            cart[productId] = { 'quantity': 1 };
        } else {
            cart[productId]['quantity'] += 1;
        }
    }

    if (action === 'remove') {
        cart[productId]['quantity'] -= 1;

        if (cart[productId]['quantity'] <= 0) {
            console.log('Item should be deleted');
            delete cart[productId];
        }
    }

    document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/";
    console.log('Cart:', cart);
    location.reload();
}
