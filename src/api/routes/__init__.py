"""
Exporta todos los blueprints de rutas.
"""
from api.routes.ingredients import ingredients_bp
from api.routes.recipes import recipes_bp
from api.routes.clients import clients_bp
from api.routes.orders import orders_bp
from api.routes.transactions import transactions_bp

__all__ = ['ingredients_bp', 'recipes_bp', 'clients_bp', 'orders_bp', 'transactions_bp']