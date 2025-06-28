import json
from .models import *

def cookieCart(request):
    try:
        cart = json.loads(request.COOKIES.get('cart', '{}'))
    except json.JSONDecodeError:
        cart = {}

    items = []
    order = {'get_cart_total': 0, 'get_cart_items': 0, 'shipping': False}
    cartItems = 0

    for i in cart:
        try:
            quantity = cart[i]['quantity']
            product = Product.objects.get(id=i)
            total = product.price * quantity

            cartItems += quantity
            order['get_cart_items'] += quantity
            order['get_cart_total'] += total

            item = {
                'id': product.id,
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'price': product.price,
                    'imageURL': product.imageURL,
                },
                'quantity': quantity,
                'digital': product.digital,
                'get_total': total,
            }
            items.append(item)

            if not product.digital:
                order['shipping'] = True

        except Product.DoesNotExist:
            continue

    return {'cartItems': cartItems, 'order': order, 'items': items}


def cartData(request):
    if request.user.is_authenticated:
        customer = request.user.customer
        order, created = Order.objects.get_or_create(customer=customer, complete=False)
        items = order.orderitem_set.all()
        cartItems = order.get_cart_items
    else:
        data = cookieCart(request)
        cartItems = data['cartItems']
        order = data['order']
        items = data['items']

    return {'cartItems': cartItems, 'order': order, 'items': items}
