"""
Ruta base de ingredients.
Endpoints:
- GET /api/ingredients - Listar todos
- POST /api/ingredients - Crear uno
"""
from flask import Blueprint, request, jsonify
from api.models import db, Ingredient, PriceHistory
from datetime import datetime

ingredients_bp = Blueprint('ingredients', __name__)

@ingredients_bp.route('', methods=['GET'])
def get_ingredients():
    """ listar todos los ingredientes """
    ingredients = Ingredient.query.filter_by(is_active=True).all()
    return jsonify([i.serialize() for i in ingredients]), 200

@ingredients_bp.route('', methods=['POST'])
def create_ingredient():
    """ crear un nuevo ingrediente o sumar stock si ya existe """
    data = request.json

    if not data.get('name') or not data.get('unit') or not data.get('cost_per_unit'):
        return jsonify({'error': 'name, unit y cost_per_unit son obligatorios'}), 400

    existing = Ingredient.query.filter_by(name=data['name'], is_active=True).first()
    if existing:
        existing.current_stock += float(data.get('current_stock', 0))
        db.session.commit()
        return jsonify(existing.serialize()), 200

    ingredient = Ingredient(
        name=data['name'],
        unit=data['unit'],
        cost_per_unit=float(data['cost_per_unit']),
        current_stock=float(data.get('current_stock', 0)),
        supplier=data.get('supplier'),
        is_active=True
    )

    db.session.add(ingredient)
    db.session.commit()

    return jsonify(ingredient.serialize()), 201

@ingredients_bp.route('/<int:id>', methods=['GET'])
def get_ingredient(id):
    """ obtener un ingrediente por id """
    ingredient = Ingredient.query.get(id)
    if not ingredient:
        return jsonify({'error': 'Ingrediente no encontrado'}), 404
    return jsonify(ingredient.serialize()), 200

@ingredients_bp.route('/<int:id>', methods=['PUT'])
def update_ingredient(id):
    """ actualizar un ingrediente """
    ingredient = Ingredient.query.get(id)
    if not ingredient:
        return jsonify({'error': 'Ingrediente no encontrado'}), 404
    
    data = request.json
    old_price = ingredient.cost_per_unit
    
    if 'name' in data: ingredient.name = data['name']
    if 'unit' in data: ingredient.unit = data['unit']
    if 'cost_per_unit' in data: 
        new_price = float(data['cost_per_unit'])
        # Guardar historial si el precio cambió
        if old_price != new_price:
            history = PriceHistory(
                ingredient_id=ingredient.id,
                ingredient_name=ingredient.name,
                old_price=old_price,
                new_price=new_price,
                changed_at=datetime.now().strftime('%Y-%m-%d %H:%M')
            )
            db.session.add(history)
        ingredient.cost_per_unit = new_price
    if 'current_stock' in data: ingredient.current_stock = float(data['current_stock'])
    if 'supplier' in data: ingredient.supplier = data['supplier']
    
    db.session.commit()
    return jsonify(ingredient.serialize()), 200

@ingredients_bp.route('/<int:id>', methods=['DELETE'])
def delete_ingredient(id):
    """ eliminar (desactivar) un ingrediente """
    ingredient = Ingredient.query.get(id)
    if not ingredient:
        return jsonify({'error': 'Ingrediente no encontrado'}), 404
    
    ingredient.is_active = False
    db.session.commit()
    return jsonify({'message': 'Ingrediente eliminado'}), 200

@ingredients_bp.route('/low-stock', methods=['GET'])
def get_low_stock():
    """ listar ingredientes con stock bajo (menos de 5 unidades) """
    threshold = request.args.get('threshold', 5, type=float)
    ingredients = Ingredient.query.filter(
        Ingredient.is_active == True,
        Ingredient.current_stock < threshold
    ).all()
    return jsonify([i.serialize() for i in ingredients]), 200

@ingredients_bp.route('/shopping-list', methods=['GET'])
def get_shopping_list():
    """
    Generar lista de compra basada en pedidos pendientes.
    Calcula qué ingredientes faltan para los pedidos confirmados.
    """
    threshold = request.args.get('threshold', 5, type=float)
    
    from api.models import Order, OrderItem, Recipe, RecipeIngredient
    
    needed = {}
    
    # Pedidos pendientes o confirmados
    orders = Order.query.filter(
        Order.status.in_(['pending', 'confirmed'])
    ).all()
    
    for order in orders:
        for item in order.items:
            recipe = Recipe.query.get(item.recipe_id)
            if not recipe:
                continue
            for ri in recipe.ingredients:
                ing = Ingredient.query.get(ri.ingredient_id)
                if not ing:
                    continue
                
                total_needed = ri.quantity_needed * item.quantity
                current = ing.current_stock
                deficit = max(0, total_needed - current)
                
                if ing.name in needed:
                    needed[ing.name]['quantity_needed'] += deficit
                else:
                    needed[ing.name] = {
                        'ingredient_id': ing.id,
                        'name': ing.name,
                        'unit': ing.unit,
                        'current_stock': current,
                        'quantity_needed': deficit,
                        'supplier': ing.supplier
                    }
    
    # Filtrar solo los que faltan
    shopping_list = [v for v in needed.values() if v['quantity_needed'] > 0]
    
    return jsonify(shopping_list), 200

@ingredients_bp.route('/price-history', methods=['GET'])
def get_price_history():
    """ obtener historial de cambios de precio """
    limit = request.args.get('limit', 20, type=int)
    history = PriceHistory.query.order_by(PriceHistory.id.desc()).limit(limit).all()
    return jsonify([h.serialize() for h in history]), 200