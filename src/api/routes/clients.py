"""
Ruta base de clients.
Endpoints:
- GET /api/clients - Listar todos
- POST /api/clients - Crear uno
"""
from flask import Blueprint, request, jsonify
from api.models import db, Client

clients_bp = Blueprint('clients', __name__)

@clients_bp.route('', methods=['GET'])
def get_clients():
    """ listar todos los clientes """
    clients = Client.query.filter_by(is_active=True).all()
    return jsonify([c.serialize() for c in clients]), 200

@clients_bp.route('', methods=['POST'])
def create_client():
    """ crear un nuevo cliente """
    data = request.json
    
    if not data.get('name'):
        return jsonify({'error': 'name es obligatorio'}), 400
    
    client = Client(
        name=data['name'],
        email=data.get('email'),
        phone=data.get('phone'),
        address=data.get('address'),
        is_active=True
    )
    
    db.session.add(client)
    db.session.commit()
    
    return jsonify(client.serialize()), 201

@clients_bp.route('/<int:id>', methods=['GET'])
def get_client(id):
    """ obtener un cliente por id """
    client = Client.query.get(id)
    if not client:
        return jsonify({'error': 'Cliente no encontrado'}), 404
    return jsonify(client.serialize()), 200

@clients_bp.route('/<int:id>', methods=['PUT'])
def update_client(id):
    """ actualizar un cliente """
    client = Client.query.get(id)
    if not client:
        return jsonify({'error': 'Cliente no encontrado'}), 404
    
    data = request.json
    if 'name' in data: client.name = data['name']
    if 'email' in data: client.email = data['email']
    if 'phone' in data: client.phone = data['phone']
    if 'address' in data: client.address = data['address']
    
    db.session.commit()
    return jsonify(client.serialize()), 200

@clients_bp.route('/<int:id>', methods=['DELETE'])
def delete_client(id):
    """ eliminar (desactivar) un cliente """
    client = Client.query.get(id)
    if not client:
        return jsonify({'error': 'Cliente no encontrado'}), 404
    
    client.is_active = False
    db.session.commit()
    return jsonify({'message': 'Cliente eliminado'}), 200