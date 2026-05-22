from flask import Blueprint, request, jsonify
from api.models import db, Recipe, RecipeIngredient

recipes_bp = Blueprint('recipes', __name__)

def get_tenant_id(request):
    return request.headers.get('X-Tenant-ID', type=int)

@recipes_bp.route('', methods=['GET'])
def get_recipes():
    tenant_id = get_tenant_id(request)
    query = Recipe.query.filter(Recipe.is_active == True)
    if tenant_id:
        query = query.filter(Recipe.tenant_id == tenant_id)
    else:
        query = query.filter(Recipe.tenant_id == None)
    return jsonify([r.serialize() for r in query.all()]), 200

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

@recipes_bp.route('/<int:id>', methods=['GET'])
def get_recipe(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    return jsonify(recipe.serialize()), 200

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

@recipes_bp.route('/<int:id>', methods=['DELETE'])
def delete_recipe(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    recipe.is_active = False
    db.session.commit()
    return jsonify({'message': 'Receta eliminada'}), 200

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

@recipes_bp.route('/<int:id>/ingredients/<int:ingredient_id>', methods=['DELETE'])
def remove_ingredient_from_recipe(id, ingredient_id):
    ri = RecipeIngredient.query.filter_by(recipe_id=id, ingredient_id=ingredient_id).first()
    if not ri:
        return jsonify({'error': 'Ingrediente no encontrado en esta receta'}), 404
    db.session.delete(ri)
    db.session.commit()
    return jsonify({'message': 'Ingrediente eliminado de la receta'}), 200

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