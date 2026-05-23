from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from api.models import db, Order, OrderItem
from api.socket_instance import get_socketio
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

def get_tenant_id(request):
    return request.headers.get('X-Tenant-ID', type=int)

@orders_bp.route('', methods=['GET'])
def get_orders():
    tenant_id = get_tenant_id(request)
    query = Order.query
    if tenant_id:
        query = query.filter_by(tenant_id=tenant_id)
    return jsonify([o.serialize() for o in query.all()]), 200

@orders_bp.route('', methods=['POST'])
def create_order():
    data = request.json
    tenant_id = get_tenant_id(request)

    if not data.get('client_id') or not data.get('delivery_date'):
        return jsonify({'error': 'client_id y delivery_date son obligatorios'}), 400

    order = Order(
        tenant_id=tenant_id,
        client_id=data['client_id'],
        delivery_date=data['delivery_date'],
        status=data.get('status', 'pending'),
        notes=data.get('notes'),
        created_at=str(datetime.now().strftime('%Y-%m-%d'))
    )
    db.session.add(order)
    db.session.commit()

    try:
        sio = get_socketio()
        if sio:
            sio.emit('new_order', order.serialize(), to='/')
    except Exception as e:
        print(f"WebSocket emit error: {e}")

    return jsonify(order.serialize()), 201

@orders_bp.route('/<int:id>', methods=['GET'])
@cross_origin()
def get_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    return jsonify(order.serialize()), 200

@orders_bp.route('/<int:id>', methods=['PUT'])
@cross_origin()
def update_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    data = request.json
    if 'delivery_date' in data: order.delivery_date = data['delivery_date']
    if 'status' in data: order.status = data['status']
    if 'notes' in data: order.notes = data['notes']

    db.session.commit()

    try:
        sio = get_socketio()
        if sio:
            sio.emit('order_update', order.serialize(), to='/')
    except Exception as e:
        print(f"WebSocket emit error: {e}")

    return jsonify(order.serialize()), 200

@orders_bp.route('/<int:id>', methods=['DELETE'])
def delete_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    order.status = 'cancelled'
    db.session.commit()
    return jsonify({'message': 'Pedido cancelado'}), 200

@orders_bp.route('/<int:id>/items', methods=['POST'])
def add_item_to_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    data = request.json
    if not data.get('recipe_id') or not data.get('quantity'):
        return jsonify({'error': 'recipe_id y quantity son obligatorios'}), 400

    item = OrderItem(
        order_id=id,
        recipe_id=data['recipe_id'],
        quantity=int(data['quantity'])
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.serialize()), 201

@orders_bp.route('/<int:id>/items/<int:item_id>', methods=['DELETE'])
def remove_item_from_order(id, item_id):
    item = OrderItem.query.filter_by(id=item_id, order_id=id).first()
    if not item:
        return jsonify({'error': 'Item no encontrado'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item eliminado'}), 200

@orders_bp.route('/<int:id>/items/<int:item_id>', methods=['PUT'])
def update_item_in_order(id, item_id):
    item = OrderItem.query.filter_by(id=item_id, order_id=id).first()
    if not item:
        return jsonify({'error': 'Item no encontrado'}), 404
    data = request.json
    if 'quantity' in data:
        item.quantity = int(data['quantity'])
    db.session.commit()
    return jsonify(item.serialize()), 200

@orders_bp.route('/<int:id>/production', methods=['PUT'])
def mark_order_in_production(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    from api.models import Recipe, Ingredient
    from api.socket_utils import emit_stock_alert

    errors = []
    low_stock_alerts = []

    for item in order.items:
        recipe = Recipe.query.get(item.recipe_id)
        if not recipe:
            errors.append(f"Receta {item.recipe_id} no encontrada")
            continue

        for ri in recipe.ingredients:
            ingredient = Ingredient.query.get(ri.ingredient_id)
            total_needed = ri.quantity_needed * item.quantity

            if ingredient.current_stock < total_needed:
                errors.append(f"Stock insuficiente para {ingredient.name}")
                continue

            ingredient.current_stock -= total_needed

            # Usar min_stock personalizado en lugar de hardcoded 5
            if ingredient.current_stock < ingredient.min_stock:
                low_stock_alerts.append(ingredient.serialize())

    if errors:
        order.status = 'stock_error'
        db.session.commit()
        return jsonify({'errors': errors, 'status': 'stock_error'}), 400

    order.status = 'in_production'
    db.session.commit()

    for ing in low_stock_alerts:
        emit_stock_alert(ing)

    return jsonify({
        'message': 'Pedido en producción',
        'status': 'in_production',
        'low_stock_alerts': len(low_stock_alerts)
    }), 200