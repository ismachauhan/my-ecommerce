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

var csrftoken = getCookie('csrftoken');

// Initialize cart from cookie
let cart = {};
let cartCookie = getCookie('cart');

if (cartCookie) {
	try {
		cart = JSON.parse(cartCookie);
	} catch (e) {
		console.error('Error parsing cart cookie:', e);
		cart = {};
	}
} else {
	console.log('Cart Created!');
	document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/";
}

// Cart Button Actions
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

// For logged-in users
function updateUserOrder(productId, action) {
	let url = '/update_item/';

	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
		body: JSON.stringify({ productId: productId, action: action }),
	})
		.then((response) => response.json())
		.then((data) => {
			location.reload();
		});
}

// For guest users
function addCookieItem(productId, action) {
	console.log('User is not authenticated');

	if (action == 'add') {
		if (cart[productId] == undefined) {
			cart[productId] = { quantity: 1 };
		} else {
			cart[productId]['quantity'] += 1;
		}
	}

	if (action == 'remove') {
		cart[productId]['quantity'] -= 1;

		if (cart[productId]['quantity'] <= 0) {
			console.log('Item should be deleted');
			delete cart[productId];
		}
	}

	console.log('Cart:', cart);
	document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/";

	location.reload();
}
