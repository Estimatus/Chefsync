# =============================================================================
# ARCHIVO: routes_main.py
# DESCRIPCIÓN: Punto de entrada principal de la API.
# Registra todos los blueprints bajo prefijo /api.
# Incluye endpoint de prueba /hello.
# =============================================================================

from flask import Blueprint, jsonify
from api.routes.ingredients import ingredients_bp
from api.routes.recipes import recipes_bp
from api.routes.clients import clients_bp
from api.routes.orders import orders_bp
from api.routes.users import users_bp
from api.routes.recipe_items import recipe_ingredients_bp
from api.routes.transactions import transactions_bp

# Blueprint principal de la API
api = Blueprint('api', __name__)

# =============================================================================
# GET/POST /api/hello
# =============================================================================
# Endpoint de prueba para verificar conexión con el backend.
# Returns: JSON con mensaje de saludo
# =============================================================================
@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message from the backend"
    }
    return jsonify(response_body), 200

# Registrar todos los blueprints con sus prefijos de URL
api.register_blueprint(ingredients_bp, url_prefix='/ingredients')
api.register_blueprint(recipes_bp, url_prefix='/recipes')
api.register_blueprint(clients_bp, url_prefix='/clients')
api.register_blueprint(orders_bp, url_prefix='/orders')
api.register_blueprint(users_bp, url_prefix='/users')
api.register_blueprint(recipe_ingredients_bp, url_prefix='/recipe-items')
api.register_blueprint(transactions_bp, url_prefix='/transactions')