from flask import Blueprint, request, jsonify
from api.models import db, Ingredient, PriceHistory
from datetime import datetime

ingredients_bp = Blueprint('ingredients', __name__)

def get_tenant_id(request):
    """Extrae tenant_id del header X-Tenant-ID"""
    return request.headers.get('X-Tenant-ID', type=int)

@ingredients_bp.route('', methods=['GET'])
def get_ingredients():
    tenant_id = get_tenant_id(request)
    query = Ingredient.query.filter_by(is_active=True)
    if tenant_id:
        query = query.filter_by(tenant_id=tenant_id)
    ingredients = query.all()
    return jsonify([i.serialize() for i in ingredients]), 200

@ingredients_bp.route('', methods=['POST'])
def create_ingredient():
    data = request.json
    tenant_id = get_tenant_id(request)

    if not data.get('name') or not data.get('unit') or not data.get('cost_per_unit'):
        return jsonify({'error': 'name, unit y cost_per_unit son obligatorios'}), 400

    # Si ya existe para ese tenant, suma stock
    query = Ingredient.query.filter_by(name=data['name'], is_active=True)
    if tenant_id:
        query = query.filter_by(tenant_id=tenant_id)
    existing = query.first()

    if existing:
        existing.current_stock += float(data.get('current_stock', 0))
        db.session.commit()
        return jsonify(existing.serialize()), 200

    ingredient = Ingredient(
        tenant_id=tenant_id,
        name=data['name'],
        unit=data['unit'],
        cost_per_unit=float(data['cost_per_unit']),
        current_stock=float(data.get('current_stock', 0)),
        min_stock=float(data.get('min_stock', 5)),
        category=data.get('category', 'General'),
        supplier=data.get('supplier'),
        is_active=True
    )
    db.session.add(ingredient)
    db.session.commit()
    return jsonify(ingredient.serialize()), 201

@ingredients_bp.route('/<int:id>', methods=['GET'])
def get_ingredient(id):
    ingredient = Ingredient.query.get(id)
    if not ingredient:
        return jsonify({'error': 'Ingrediente no encontrado'}), 404
    return jsonify(ingredient.serialize()), 200

@ingredients_bp.route('/<int:id>', methods=['PUT'])
def update_ingredient(id):
    ingredient = Ingredient.query.get(id)
    if not ingredient:
        return jsonify({'error': 'Ingrediente no encontrado'}), 404

    data = request.json
    old_price = ingredient.cost_per_unit

    if 'name' in data: ingredient.name = data['name']
    if 'unit' in data: ingredient.unit = data['unit']
    if 'category' in data: ingredient.category = data['category']
    if 'min_stock' in data: ingredient.min_stock = float(data['min_stock'])
    if 'supplier' in data: ingredient.supplier = data['supplier']
    if 'current_stock' in data: ingredient.current_stock = float(data['current_stock'])
    if 'cost_per_unit' in data:
        new_price = float(data['cost_per_unit'])
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

    db.session.commit()
    return jsonify(ingredient.serialize()), 200

@ingredients_bp.route('/<int:id>', methods=['DELETE'])
def delete_ingredient(id):
    ingredient = Ingredient.query.get(id)
    if not ingredient:
        return jsonify({'error': 'Ingrediente no encontrado'}), 404
    ingredient.is_active = False
    db.session.commit()
    return jsonify({'message': 'Ingrediente eliminado'}), 200

@ingredients_bp.route('/low-stock', methods=['GET'])
def get_low_stock():
    """Ingredientes bajo su umbral mínimo personalizado"""
    tenant_id = get_tenant_id(request)
    query = Ingredient.query.filter(Ingredient.is_active == True)
    if tenant_id:
        query = query.filter(Ingredient.tenant_id == tenant_id)
    # Filtrar donde stock actual < min_stock
    ingredients = query.filter(
        Ingredient.current_stock < Ingredient.min_stock
    ).all()
    return jsonify([i.serialize() for i in ingredients]), 200

@ingredients_bp.route('/categories', methods=['GET'])
def get_categories():
    """Devuelve categorías únicas usadas por el tenant"""
    tenant_id = get_tenant_id(request)
    query = Ingredient.query.filter_by(is_active=True)
    if tenant_id:
        query = query.filter_by(tenant_id=tenant_id)
    ingredients = query.all()
    categories = list(set(i.category for i in ingredients if i.category))
    return jsonify(categories), 200

@ingredients_bp.route('/price-history', methods=['GET'])
def get_price_history():
    limit = request.args.get('limit', 20, type=int)
    history = PriceHistory.query.order_by(PriceHistory.id.desc()).limit(limit).all()
    return jsonify([h.serialize() for h in history]), 200