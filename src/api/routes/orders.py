"""
Ruta base de orders.
Endpoints:
- GET /api/orders - Listar todos
- POST /api/orders - Crear uno
"""
from flask import Blueprint, request, jsonify
from api.models import db, Order, OrderItem

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['GET'])
def get_orders():
    """ listar todos los pedidos """
    orders = Order.query.all()
    return jsonify([o.serialize() for o in orders]), 200

@orders_bp.route('', methods=['POST'])
def create_order():
    """ crear un nuevo pedido """
    data = request.json
    
    if not data.get('client_id') or not data.get('delivery_date'):
        return jsonify({'error': 'client_id y delivery_date son obligatorios'}), 400
    
    order = Order(
        client_id=data['client_id'],
        delivery_date=data['delivery_date'],
        status=data.get('status', 'pending'),
        notes=data.get('notes'),
        created_at=data.get('created_at', '2026-05-07')
    )
    
    db.session.add(order)
    db.session.commit()
    
    return jsonify(order.serialize()), 201

@orders_bp.route('/<int:id>', methods=['GET'])
def get_order(id):
    """ obtener un pedido por id """
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    return jsonify(order.serialize()), 200

@orders_bp.route('/<int:id>', methods=['PUT'])
def update_order(id):
    """ actualizar un pedido """
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    
    data = request.json
    if 'delivery_date' in data: order.delivery_date = data['delivery_date']
    if 'status' in data: order.status = data['status']
    if 'notes' in data: order.notes = data['notes']
    
    db.session.commit()
    return jsonify(order.serialize()), 200

@orders_bp.route('/<int:id>', methods=['DELETE'])
def delete_order(id):
    """ eliminar un pedido """
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    
    order.status = 'cancelled'
    db.session.commit()
    return jsonify({'message': 'Pedido cancelado'}), 200

@orders_bp.route('/<int:id>/items', methods=['POST'])
def add_item_to_order(id):
    """ añadir un item a un pedido """
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
    """ eliminar un item de un pedido """
    item = OrderItem.query.filter_by(id=item_id, order_id=id).first()
    if not item:
        return jsonify({'error': 'Item no encontrado'}), 404
    
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Item eliminado'}), 200

@orders_bp.route('/<int:id>/items/<int:item_id>', methods=['PUT'])
def update_item_in_order(id, item_id):
    """ actualizar la cantidad de un item en un pedido """
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
    """
    Marcar pedido como 'en producción'.
    Aquí es donde ocurre la MAGIA: al marcar en producción,
    se descuenta automáticamente el inventario.
    """
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    
    from api.models import Recipe, Ingredient, RecipeIngredient
    
    errors = []
    
    for item in order.items:
        recipe = Recipe.query.get(item.recipe_id)
        if not recipe:
            errors.append(f"Receta {item.recipe_id} no encontrada")
            continue
        
        # Por cada item del pedido, descontar ingredientes
        for ri in recipe.ingredients:
            ingredient = Ingredient.query.get(ri.ingredient_id)
            total_needed = ri.quantity_needed * item.quantity
            
            if ingredient.current_stock < total_needed:
                errors.append(f"Stock insuficiente para {ingredient.name}")
                continue
            
            ingredient.current_stock -= total_needed
    
    if errors:
        order.status = 'stock_error'
        db.session.commit()
        return jsonify({'errors': errors, 'status': 'stock_error'}), 400
    
    order.status = 'in_production'
    db.session.commit()
    
    return jsonify({'message': 'Pedido en producción', 'status': 'in_production'}), 200