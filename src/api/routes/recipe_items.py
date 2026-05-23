"""
Ruta base de recipe_ingredients.
Gestión directa de ingredientes de recetas.
"""
from flask import Blueprint, request, jsonify
from api.models import db, RecipeIngredient

recipe_ingredients_bp = Blueprint('recipe_ingredients', __name__)

@recipe_ingredients_bp.route('', methods=['GET'])
def get_recipe_ingredients():
    """ listar todos los recipe_ingredients """
    ris = RecipeIngredient.query.all()
    return jsonify([ri.serialize() for ri in ris]), 200

@recipe_ingredients_bp.route('/<int:id>', methods=['GET'])
def get_recipe_ingredient(id):
    """ obtener un recipe_ingredient por id """
    ri = RecipeIngredient.query.get(id)
    if not ri:
        return jsonify({'error': 'RecipeIngredient no encontrado'}), 404
    return jsonify(ri.serialize()), 200

@recipe_ingredients_bp.route('/<int:id>', methods=['PUT'])
def update_recipe_ingredient(id):
    """ actualizar un recipe_ingredient """
    ri = RecipeIngredient.query.get(id)
    if not ri:
        return jsonify({'error': 'RecipeIngredient no encontrado'}), 404
    
    data = request.json
    if 'quantity_needed' in data:
        ri.quantity_needed = float(data['quantity_needed'])
    
    db.session.commit()
    return jsonify(ri.serialize()), 200

@recipe_ingredients_bp.route('/<int:id>', methods=['DELETE'])
def delete_recipe_ingredient(id):
    """ eliminar un recipe_ingredient """
    ri = RecipeIngredient.query.get(id)
    if not ri:
        return jsonify({'error': 'RecipeIngredient no encontrado'}), 404
    
    db.session.delete(ri)
    db.session.commit()
    return jsonify({'message': 'RecipeIngredient eliminado'}), 200