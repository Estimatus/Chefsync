# =============================================================================
# ARCHIVO: orders.py
# DESCRIPCIÓN: Rutas API para gestión de pedidos.
# Cada pedido tiene items (recetas con cantidad) y un estado.
# Incluye flujo de producción que descuenta stock de ingredientes.
# =============================================================================

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from api.models import db, Order, OrderItem
from api.socket_instance import get_socketio
from datetime import datetime

# Blueprint para rutas de pedidos
orders_bp = Blueprint('orders', __name__)

# =============================================================================
# HELPER: get_tenant_id
# =============================================================================
# Extrae el tenant_id del header X-Tenant-ID.
# Params: request - objeto request de Flask
# Returns: int - tenant_id o None
# =============================================================================
def get_tenant_id(request):
    return request.headers.get('X-Tenant-ID', type=int)

# =============================================================================
# GET /api/orders
# =============================================================================
# Lista todos los pedidos del tenant actual.
# Returns: JSON array de pedidos serializados
# =============================================================================
@orders_bp.route('', methods=['GET'])
def get_orders():
    tenant_id = get_tenant_id(request)
    query = Order.query
    if tenant_id:
        query = query.filter(Order.tenant_id == tenant_id)
    else:
        query = query.filter(Order.tenant_id == None)
    return jsonify([o.serialize() for o in query.all()]), 200

# =============================================================================
# POST /api/orders
# =============================================================================
# Crea un nuevo pedido.
# Body: client_id (int, requerido), delivery_date (str, requerido),
#       status (str, opcional, default 'pending'), notes (str, opcional)
# Returns: JSON pedido creado. Emite evento WebSocket 'new_order'.
# =============================================================================
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

    # Emitir evento WebSocket para notificar nuevo pedido
    try:
        sio = get_socketio()
        if sio:
            sio.emit('new_order', order.serialize(), to='/')
    except Exception as e:
        print(f"WebSocket emit error: {e}")

    return jsonify(order.serialize()), 201

# =============================================================================
# GET /api/orders/<id>
# =============================================================================
# Obtiene un pedido específico con sus items.
# Params: id (int) - ID del pedido
# Returns: JSON pedido o error 404
# =============================================================================
@orders_bp.route('/<int:id>', methods=['GET'])
@cross_origin()
def get_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    return jsonify(order.serialize()), 200

# =============================================================================
# PUT /api/orders/<id>
# =============================================================================
# Actualiza fecha, estado o notas de un pedido.
# Params: id (int) - ID del pedido
# Body: delivery_date, status, notes (todos opcionales)
# Returns: JSON pedido actualizado. Emite WebSocket 'order_update'.
# =============================================================================
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

    # Notificar actualización via WebSocket
    try:
        sio = get_socketio()
        if sio:
            sio.emit('order_update', order.serialize(), to='/')
    except Exception as e:
        print(f"WebSocket emit error: {e}")

    return jsonify(order.serialize()), 200

# =============================================================================
# DELETE /api/orders/<id>
# =============================================================================
# Cancela un pedido (cambia estado a 'cancelled').
# Params: id (int) - ID del pedido
# Returns: JSON mensaje de confirmación
# =============================================================================
@orders_bp.route('/<int:id>', methods=['DELETE'])
def delete_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    order.status = 'cancelled'
    db.session.commit()
    return jsonify({'message': 'Pedido cancelado'}), 200

# =============================================================================
# POST /api/orders/<id>/items
# =============================================================================
# Agrega un item (receta con cantidad) al pedido.
# Params: id (int) - ID del pedido
# Body: recipe_id (int, requerido), quantity (int, requerido)
# Returns: JSON OrderItem creado
# =============================================================================
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

# =============================================================================
# DELETE /api/orders/<id>/items/<item_id>
# =============================================================================
# Elimina un item específico del pedido.
# Params: id (int) - order ID, item_id (int) - item ID
# Returns: JSON mensaje de confirmación
# =============================================================================
@orders_bp.route('/<int:id>/items/<int:item_id>', methods=['DELETE'])
def remove_item_from_order(id, item_id):
    item = OrderItem.query.filter_by(id=item_id, order_id=id).first()
    if not item:
        return jsonify({'error': 'Item no encontrado'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item eliminado'}), 200

# =============================================================================
# PUT /api/orders/<id>/items/<item_id>
# =============================================================================
# Actualiza la cantidad de un item en el pedido.
# Params: id (int) - order ID, item_id (int) - item ID
# Body: quantity (int)
# Returns: JSON OrderItem actualizado
# =============================================================================
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

# =============================================================================
# PUT /api/orders/<id>/production
# =============================================================================
# Inicia la producción del pedido: descuenta stock de ingredientes.
# Verifica stock suficiente antes de descontar.
# Params: id (int) - ID del pedido
# Returns: JSON con estado final, errores de stock y alertas de stock bajo
# =============================================================================
@orders_bp.route('/<int:id>/production', methods=['PUT'])
def mark_order_in_production(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    from api.models import Recipe, Ingredient
    from api.socket_utils import emit_stock_alert

    errors = []
    low_stock_alerts = []

    # Recorrer cada item del pedido
    for item in order.items:
        recipe = Recipe.query.get(item.recipe_id)
        if not recipe:
            errors.append(f"Receta {item.recipe_id} no encontrada")
            continue

        # Descontar ingredientes de cada item
        for ri in recipe.ingredients:
            ingredient = Ingredient.query.get(ri.ingredient_id)
            total_needed = ri.quantity_needed * item.quantity

            # Verificar stock suficiente
            if ingredient.current_stock < total_needed:
                errors.append(f"Stock insuficiente para {ingredient.name}")
                continue

            # Descontar stock
            ingredient.current_stock -= total_needed

            # Verificar si quedó por debajo del mínimo
            if ingredient.current_stock < ingredient.min_stock:
                low_stock_alerts.append(ingredient.serialize())

    # Si hay errores de stock, marcar pedido con error
    if errors:
        order.status = 'stock_error'
        db.session.commit()
        return jsonify({'errors': errors, 'status': 'stock_error'}), 400

    # Marcar como en producción y notificar alertas de stock bajo
    order.status = 'in_production'
    db.session.commit()

    for ing in low_stock_alerts:
        emit_stock_alert(ing)

    return jsonify({
        'message': 'Pedido en producción',
        'status': 'in_production',
        'low_stock_alerts': len(low_stock_alerts)
    }), 200