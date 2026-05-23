# =============================================================================
# ARCHIVO: recipes.py
# DESCRIPCIÓN: Rutas API para gestión de recetas/productos.
# Cada receta tiene ingredientes asociados con cantidades.
# Incluye endpoints para costo, margen y alertas de rentabilidad.
# =============================================================================

from flask import Blueprint, request, jsonify
from api.models import db, Recipe, RecipeIngredient

# Blueprint para rutas de recetas
recipes_bp = Blueprint('recipes', __name__)

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
# GET /api/recipes
# =============================================================================
# Lista todas las recetas activas del tenant actual.
# Returns: JSON array de recetas serializadas (incluye ingredientes y costo)
# =============================================================================
@recipes_bp.route('', methods=['GET'])
def get_recipes():
    tenant_id = get_tenant_id(request)
    query = Recipe.query.filter(Recipe.is_active == True)
    if tenant_id:
        query = query.filter(Recipe.tenant_id == tenant_id)
    else:
        query = query.filter(Recipe.tenant_id == None)
    return jsonify([r.serialize() for r in query.all()]), 200

# =============================================================================
# POST /api/recipes
# =============================================================================
# Crea una nueva receta.
# Body: name (str, requerido), sale_price (float, requerido),
#       description (str, opcional), margin_threshold (float, opcional, default 30),
#       category (str, opcional)
# Returns: JSON receta creada
# =============================================================================
@recipes_bp.route('', methods=['POST'])
def create_recipe():
    data = request.json
    tenant_id = get_tenant_id(request)

    if not data.get('name') or not data.get('sale_price'):
        return jsonify({'error': 'name y sale_price son obligatorios'}), 400

    recipe = Recipe(
        tenant_id=tenant_id,
        name=data['name'],
        description=data.get('description'),
        sale_price=float(data['sale_price']),
        margin_threshold=float(data.get('margin_threshold', 30)),
        category=data.get('category', 'Sin categoría'),
        is_active=True
    )
    db.session.add(recipe)
    db.session.commit()
    return jsonify(recipe.serialize()), 201

# =============================================================================
# GET /api/recipes/<id>
# =============================================================================
# Obtiene una receta específica con sus ingredientes.
# Params: id (int) - ID de la receta
# Returns: JSON receta o error 404
# =============================================================================
@recipes_bp.route('/<int:id>', methods=['GET'])
def get_recipe(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    return jsonify(recipe.serialize()), 200

# =============================================================================
# PUT /api/recipes/<id>
# =============================================================================
# Actualiza datos básicos de una receta (no ingredientes).
# Params: id (int) - ID de la receta
# Body: name, description, sale_price, margin_threshold, category
# Returns: JSON receta actualizada
# =============================================================================
@recipes_bp.route('/<int:id>', methods=['PUT'])
def update_recipe(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    data = request.json
    if 'name' in data: recipe.name = data['name']
    if 'description' in data: recipe.description = data['description']
    if 'sale_price' in data: recipe.sale_price = float(data['sale_price'])
    if 'margin_threshold' in data: recipe.margin_threshold = float(data['margin_threshold'])
    if 'category' in data: recipe.category = data['category']
    db.session.commit()
    return jsonify(recipe.serialize()), 200

# =============================================================================
# DELETE /api/recipes/<id>
# =============================================================================
# Elimina lógicamente una receta (is_active = false).
# Params: id (int) - ID de la receta
# Returns: JSON mensaje de confirmación
# =============================================================================
@recipes_bp.route('/<int:id>', methods=['DELETE'])
def delete_recipe(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    recipe.is_active = False
    db.session.commit()
    return jsonify({'message': 'Receta eliminada'}), 200

# =============================================================================
# GET /api/recipes/<id>/cost
# =============================================================================
# Calcula el costo total de una receta basado en sus ingredientes.
# Params: id (int) - ID de la receta
# Returns: JSON con recipe_id, recipe_name y calculated_cost
# =============================================================================
@recipes_bp.route('/<int:id>/cost', methods=['GET'])
def get_recipe_cost(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    return jsonify({
        'recipe_id': id,
        'recipe_name': recipe.name,
        'calculated_cost': recipe.calculate_cost()
    }), 200

# =============================================================================
# GET /api/recipes/<id>/margin
# =============================================================================
# Calcula el margen de ganancia de una receta.
# Params: id (int) - ID de la receta
# Returns: JSON con márgenes, precios, costos y alerta si margen < threshold
# =============================================================================
@recipes_bp.route('/<int:id>/margin', methods=['GET'])
def get_recipe_margin(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    cost = recipe.calculate_cost()
    margin = recipe.calculate_margin()
    return jsonify({
        'recipe_id': id,
        'recipe_name': recipe.name,
        'sale_price': recipe.sale_price,
        'calculated_cost': cost,
        'margin_percent': margin,
        'margin_threshold': recipe.margin_threshold,
        'alert': margin < recipe.margin_threshold
    }), 200

# =============================================================================
# POST /api/recipes/<id>/ingredients
# =============================================================================
# Agrega un ingrediente a una receta con cantidad.
# Params: id (int) - ID de la receta
# Body: ingredient_id (int, requerido), quantity_needed (float, requerido)
# Returns: JSON RecipeIngredient creado
# =============================================================================
@recipes_bp.route('/<int:id>/ingredients', methods=['POST'])
def add_ingredient_to_recipe(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    data = request.json
    if not data.get('ingredient_id') or not data.get('quantity_needed'):
        return jsonify({'error': 'ingredient_id y quantity_needed son obligatorios'}), 400
    ri = RecipeIngredient(
        recipe_id=id,
        ingredient_id=data['ingredient_id'],
        quantity_needed=float(data['quantity_needed'])
    )
    db.session.add(ri)
    db.session.commit()
    return jsonify(ri.serialize()), 201

# =============================================================================
# DELETE /api/recipes/<id>/ingredients/<ingredient_id>
# =============================================================================
# Elimina un ingrediente de una receta.
# Params: id (int) - recipe ID, ingredient_id (int) - ingredient ID
# Returns: JSON mensaje de confirmación
# =============================================================================
@recipes_bp.route('/<int:id>/ingredients/<int:ingredient_id>', methods=['DELETE'])
def remove_ingredient_from_recipe(id, ingredient_id):
    ri = RecipeIngredient.query.filter_by(recipe_id=id, ingredient_id=ingredient_id).first()
    if not ri:
        return jsonify({'error': 'Ingrediente no encontrado en esta receta'}), 404
    db.session.delete(ri)
    db.session.commit()
    return jsonify({'message': 'Ingrediente eliminado de la receta'}), 200

# =============================================================================
# PUT /api/recipes/<id>/ingredients/<ingredient_id>
# =============================================================================
# Actualiza la cantidad de un ingrediente en una receta.
# Params: id (int) - recipe ID, ingredient_id (int) - ingredient ID
# Body: quantity_needed (float)
# Returns: JSON RecipeIngredient actualizado
# =============================================================================
@recipes_bp.route('/<int:id>/ingredients/<int:ingredient_id>', methods=['PUT'])
def update_ingredient_quantity(id, ingredient_id):
    ri = RecipeIngredient.query.filter_by(recipe_id=id, ingredient_id=ingredient_id).first()
    if not ri:
        return jsonify({'error': 'Ingrediente no encontrado en esta receta'}), 404
    data = request.json
    if 'quantity_needed' in data:
        ri.quantity_needed = float(data['quantity_needed'])
    db.session.commit()
    return jsonify(ri.serialize()), 200

# =============================================================================
# GET /api/recipes/alerts
# =============================================================================
# Lista recetas con margen de ganancia por debajo del umbral.
# Query params: threshold (float, default 30) - umbral de margen mínimo
# Returns: JSON array de recetas con alerta
# =============================================================================
@recipes_bp.route('/alerts', methods=['GET'])
def get_margin_alerts():
    tenant_id = get_tenant_id(request)
    threshold = request.args.get('threshold', 30, type=float)
    query = Recipe.query.filter(Recipe.is_active == True)
    if tenant_id:
        query = query.filter(Recipe.tenant_id == tenant_id)
    else:
        query = query.filter(Recipe.tenant_id == None)
    alerts = []
    for recipe in query.all():
        margin = recipe.calculate_margin()
        if margin < threshold:
            alerts.append({
                'recipe_id': recipe.id,
                'recipe_name': recipe.name,
                'sale_price': recipe.sale_price,
                'calculated_cost': recipe.calculate_cost(),
                'margin_percent': margin,
                'margin_threshold': recipe.margin_threshold
            })
    return jsonify(alerts), 200