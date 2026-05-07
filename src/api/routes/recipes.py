"""
Ruta base de recipes.
Endpoints:
- GET /api/recipes - Listar todos
- POST /api/recipes - Crear uno
- GET /api/recipes/<id>/cost - Ver coste calculated
- GET /api/recipes/<id>/margin - Ver margen beneficio
"""
from flask import Blueprint, request, jsonify
from api.models import db, Recipe, RecipeIngredient

recipes_bp = Blueprint('recipes', __name__)

@recipes_bp.route('', methods=['GET'])
def get_recipes():
    """ listar todas las recetas """
    recipes = Recipe.query.filter_by(is_active=True).all()
    return jsonify([r.serialize() for r in recipes]), 200

@recipes_bp.route('', methods=['POST'])
def create_recipe():
    """ crear una nueva receta """
    data = request.json
    
    if not data.get('name') or not data.get('sale_price'):
        return jsonify({'error': 'name y sale_price son obligatorios'}), 400
    
    recipe = Recipe(
        name=data['name'],
        description=data.get('description'),
        sale_price=float(data['sale_price']),
        margin_threshold=float(data.get('margin_threshold', 30)),
        is_active=True
    )
    
    db.session.add(recipe)
    db.session.commit()
    
    return jsonify(recipe.serialize()), 201

@recipes_bp.route('/<int:id>', methods=['GET'])
def get_recipe(id):
    """ obtener una receta por id """
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    return jsonify(recipe.serialize()), 200

@recipes_bp.route('/<int:id>', methods=['PUT'])
def update_recipe(id):
    """ actualizar una receta """
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    
    data = request.json
    if 'name' in data: recipe.name = data['name']
    if 'description' in data: recipe.description = data['description']
    if 'sale_price' in data: recipe.sale_price = float(data['sale_price'])
    if 'margin_threshold' in data: recipe.margin_threshold = float(data['margin_threshold'])
    
    db.session.commit()
    return jsonify(recipe.serialize()), 200

@recipes_bp.route('/<int:id>', methods=['DELETE'])
def delete_recipe(id):
    """ eliminar (desactivar) una receta """
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    
    recipe.is_active = False
    db.session.commit()
    return jsonify({'message': 'Receta eliminada'}), 200

@recipes_bp.route('/<int:id>/cost', methods=['GET'])
def get_recipe_cost(id):
    """ obtener coste calculated de una receta (escandallo) """
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    
    cost = recipe.calculate_cost()
    return jsonify({
        'recipe_id': id,
        'recipe_name': recipe.name,
        'calculated_cost': cost
    }), 200

@recipes_bp.route('/<int:id>/margin', methods=['GET'])
def get_recipe_margin(id):
    """ obtener margen de beneficio de una receta """
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    
    cost = recipe.calculate_cost()
    margin = recipe.calculate_margin()
    alert = margin < recipe.margin_threshold
    
    return jsonify({
        'recipe_id': id,
        'recipe_name': recipe.name,
        'sale_price': recipe.sale_price,
        'calculated_cost': cost,
        'margin_percent': margin,
        'margin_threshold': recipe.margin_threshold,
        'alert': alert
    }), 200

@recipes_bp.route('/<int:id>/ingredients', methods=['POST'])
def add_ingredient_to_recipe(id):
    """ añadir un ingrediente a una receta """
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({'error': 'Receta no encontrada'}), 404
    
    data = request.json
    if not data.get('ingredient_id') or not data.get('quantity_needed'):
        return jsonify({'error': 'ingredient_id y quantity_needed son obligatorios'}), 400
    
    recipe_ingredient = RecipeIngredient(
        recipe_id=id,
        ingredient_id=data['ingredient_id'],
        quantity_needed=float(data['quantity_needed'])
    )
    
    db.session.add(recipe_ingredient)
    db.session.commit()
    
    return jsonify(recipe_ingredient.serialize()), 201

@recipes_bp.route('/<int:id>/ingredients/<int:ingredient_id>', methods=['DELETE'])
def remove_ingredient_from_recipe(id, ingredient_id):
    """ eliminar un ingrediente de una receta """
    ri = RecipeIngredient.query.filter_by(recipe_id=id, ingredient_id=ingredient_id).first()
    if not ri:
        return jsonify({'error': 'Ingrediente no encontrado en esta receta'}), 404
    
    db.session.delete(ri)
    db.session.commit()
    
    return jsonify({'message': 'Ingrediente eliminado de la receta'}), 200

@recipes_bp.route('/<int:id>/ingredients/<int:ingredient_id>', methods=['PUT'])
def update_ingredient_quantity(id, ingredient_id):
    """ actualizar la cantidad de un ingredient en una receta """
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
    """
    Listar recetas cuyo margen está por debajo del umbral.
    """
    threshold = request.args.get('threshold', 30, type=float)
    
    recipes = Recipe.query.filter_by(is_active=True).all()
    alerts = []
    
    for recipe in recipes:
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