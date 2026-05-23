# =============================================================================
# ARCHIVO: ingredients.py
# DESCRIPCIÓN: Rutas API para gestión de ingredientes/inventario.
# Provee CRUD completo: listar, crear, actualizar, eliminar ingredientes.
# También incluye endpoints para stock bajo y historial de precios.
# =============================================================================

from flask import Blueprint, request, jsonify
from api.models import db, Ingredient, PriceHistory
from datetime import datetime

# Blueprint para rutas de ingredientes
ingredients_bp = Blueprint('ingredients', __name__)

# =============================================================================
# HELPER: get_tenant_id
# =============================================================================
# Extrae el tenant_id del header X-Tenant-ID para filtrar datos por empresa.
# Params: request - objeto request de Flask
# Returns: int - tenant_id o None si no existe
# =============================================================================
def get_tenant_id(request):
    """Extrae tenant_id del header X-Tenant-ID"""
    return request.headers.get('X-Tenant-ID', type=int)

# =============================================================================
# GET /api/ingredients
# =============================================================================
# Lista todos los ingredientes activos del tenant actual.
# Si no hay tenant_id, solo retorna ingredientes sin tenant (legacy).
# Returns: JSON array con ingredientes serializados
# =============================================================================
@ingredients_bp.route('', methods=['GET'])
def get_ingredients():
    tenant_id = get_tenant_id(request)
    query = Ingredient.query.filter(Ingredient.is_active == True)
    if tenant_id:
        query = query.filter(Ingredient.tenant_id == tenant_id)
    else:
        query = query.filter(Ingredient.tenant_id == None)
    ingredients = query.all()
    return jsonify([i.serialize() for i in ingredients]), 200

# =============================================================================
# POST /api/ingredients
# =============================================================================
# Crea un nuevo ingrediente o suma stock si ya existe uno con el mismo nombre.
# Body: name (str, requerido), unit (str, requerido), cost_per_unit (float, requerido),
#       current_stock (float, opcional, default 0), min_stock (float, opcional, default 5),
#       category (str, opcional), supplier (str, opcional)
# Returns: JSON ingrediente creado/actualizado
# =============================================================================
@ingredients_bp.route('', methods=['POST'])
def create_ingredient():
    data = request.json
    tenant_id = get_tenant_id(request)

    # Validación de campos obligatorios
    if not data.get('name') or not data.get('unit') or not data.get('cost_per_unit'):
        return jsonify({'error': 'name, unit y cost_per_unit son obligatorios'}), 400

    # Si ya existe para ese tenant, suma stock en lugar de crear nuevo
    query = Ingredient.query.filter(Ingredient.name == data['name'], Ingredient.is_active == True)
    if tenant_id:
        query = query.filter(Ingredient.tenant_id == tenant_id)
    else:
        query = query.filter(Ingredient.tenant_id == None)
    existing = query.first()

    if existing:
        # Acumular stock existente + nuevo
        existing.current_stock += float(data.get('current_stock', 0))
        db.session.commit()
        return jsonify(existing.serialize()), 200

    # Crear nuevo ingrediente
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

# =============================================================================
# GET /api/ingredients/<id>
# =============================================================================
# Obtiene un ingrediente específico por su ID.
# Params: id (int) - ID del ingrediente
# Returns: JSON ingrediente o error 404 si no existe
# =============================================================================
@ingredients_bp.route('/<int:id>', methods=['GET'])
def get_ingredient(id):
    ingredient = Ingredient.query.get(id)
    if not ingredient:
        return jsonify({'error': 'Ingrediente no encontrado'}), 404
    return jsonify(ingredient.serialize()), 200

# =============================================================================
# PUT /api/ingredients/<id>
# =============================================================================
# Actualiza un ingrediente existente. Si cambia el precio, guarda historial.
# Params: id (int) - ID del ingrediente
# Body: name, unit, category, min_stock, supplier, current_stock, cost_per_unit
# Returns: JSON ingrediente actualizado
# =============================================================================
@ingredients_bp.route('/<int:id>', methods=['PUT'])
def update_ingredient(id):
    ingredient = Ingredient.query.get(id)
    if not ingredient:
        return jsonify({'error': 'Ingrediente no encontrado'}), 404

    data = request.json
    old_price = ingredient.cost_per_unit

    # Actualizar solo campos presentes en el body
    if 'name' in data: ingredient.name = data['name']
    if 'unit' in data: ingredient.unit = data['unit']
    if 'category' in data: ingredient.category = data['category']
    if 'min_stock' in data: ingredient.min_stock = float(data['min_stock'])
    if 'supplier' in data: ingredient.supplier = data['supplier']
    if 'current_stock' in data: ingredient.current_stock = float(data['current_stock'])
    if 'cost_per_unit' in data:
        new_price = float(data['cost_per_unit'])
        # Si cambió el precio, registrar en historial
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

# =============================================================================
# DELETE /api/ingredients/<id>
# =============================================================================
# Elimina lógicamente un ingrediente (is_active = false).
# Params: id (int) - ID del ingrediente
# Returns: JSON mensaje de confirmación
# =============================================================================
@ingredients_bp.route('/<int:id>', methods=['DELETE'])
def delete_ingredient(id):
    ingredient = Ingredient.query.get(id)
    if not ingredient:
        return jsonify({'error': 'Ingrediente no encontrado'}), 404
    ingredient.is_active = False
    db.session.commit()
    return jsonify({'message': 'Ingrediente eliminado'}), 200

# =============================================================================
# GET /api/ingredients/low-stock
# =============================================================================
# Devuelve ingredientes cuyo stock actual está por debajo del mínimo.
# Returns: JSON array de ingredientes con stock bajo
# =============================================================================
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

# =============================================================================
# GET /api/ingredients/categories
# =============================================================================
# Devuelve lista de categorías únicas usadas por el tenant.
# Returns: JSON array de strings con nombres de categorías
# =============================================================================
@ingredients_bp.route('/categories', methods=['GET'])
def get_categories():
    """Devuelve categorías únicas usadas por el tenant"""
    tenant_id = get_tenant_id(request)
    query = Ingredient.query.filter(Ingredient.is_active == True)
    if tenant_id:
        query = query.filter(Ingredient.tenant_id == tenant_id)
    else:
        query = query.filter(Ingredient.tenant_id == None)
    ingredients = query.all()
    categories = list(set(i.category for i in ingredients if i.category))
    return jsonify(categories), 200

# =============================================================================
# GET /api/ingredients/price-history
# =============================================================================
# Devuelve historial de cambios de precio de ingredientes.
# Query params: limit (int, default 20) - máximo de registros a devolver
# Returns: JSON array de entradas del historial
# =============================================================================
@ingredients_bp.route('/price-history', methods=['GET'])
def get_price_history():
    limit = request.args.get('limit', 20, type=int)
    history = PriceHistory.query.order_by(PriceHistory.id.desc()).limit(limit).all()
    return jsonify([h.serialize() for h in history]), 200