# =============================================================================
# ARCHIVO: recipe_items.py
# DESCRIPCIÓN: Rutas API para gestión directa de RecipeIngredient.
# Permite operar sobre ingredientes de recetas de forma independiente.
# =============================================================================

from flask import Blueprint, request, jsonify
from api.models import db, RecipeIngredient

# Blueprint para rutas de recipe_ingredients
recipe_ingredients_bp = Blueprint('recipe_ingredients', __name__)

# =============================================================================
# GET /api/recipe-items
# =============================================================================
# Lista todos los recipe_ingredients (ingredientes de recetas).
# Returns: JSON array de RecipeIngredient serializados
# =============================================================================
@recipe_ingredients_bp.route('', methods=['GET'])
def get_recipe_ingredients():
    ris = RecipeIngredient.query.all()
    return jsonify([ri.serialize() for ri in ris]), 200

# =============================================================================
# GET /api/recipe-items/<id>
# =============================================================================
# Obtiene un recipe_ingredient específico por su ID.
# Params: id (int) - ID del RecipeIngredient
# Returns: JSON RecipeIngredient o error 404
# =============================================================================
@recipe_ingredients_bp.route('/<int:id>', methods=['GET'])
def get_recipe_ingredient(id):
    ri = RecipeIngredient.query.get(id)
    if not ri:
        return jsonify({'error': 'RecipeIngredient no encontrado'}), 404
    return jsonify(ri.serialize()), 200

# =============================================================================
# PUT /api/recipe-items/<id>
# =============================================================================
# Actualiza un recipe_ingredient (solo quantity_needed).
# Params: id (int) - ID del RecipeIngredient
# Body: quantity_needed (float)
# Returns: JSON RecipeIngredient actualizado
# =============================================================================
@recipe_ingredients_bp.route('/<int:id>', methods=['PUT'])
def update_recipe_ingredient(id):
    ri = RecipeIngredient.query.get(id)
    if not ri:
        return jsonify({'error': 'RecipeIngredient no encontrado'}), 404

    data = request.json
    if 'quantity_needed' in data:
        ri.quantity_needed = float(data['quantity_needed'])

    db.session.commit()
    return jsonify(ri.serialize()), 200

# =============================================================================
# DELETE /api/recipe-items/<id>
# =============================================================================
# Elimina un recipe_ingredient (desvincula ingrediente de receta).
# Params: id (int) - ID del RecipeIngredient
# Returns: JSON mensaje de confirmación
# =============================================================================
@recipe_ingredients_bp.route('/<int:id>', methods=['DELETE'])
def delete_recipe_ingredient(id):
    ri = RecipeIngredient.query.get(id)
    if not ri:
        return jsonify({'error': 'RecipeIngredient no encontrado'}), 404

    db.session.delete(ri)
    db.session.commit()
    return jsonify({'message': 'RecipeIngredient eliminado'}), 200