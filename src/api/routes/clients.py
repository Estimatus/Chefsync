from flask import Blueprint, request, jsonify
from api.models import db, Client

clients_bp = Blueprint('clients', __name__)

def get_tenant_id(request):
    return request.headers.get('X-Tenant-ID', type=int)

@clients_bp.route('', methods=['GET'])
def get_clients():
    tenant_id = get_tenant_id(request)
    query = Client.query.filter_by(is_active=True)
    if tenant_id:
        query = query.filter_by(tenant_id=tenant_id)
    return jsonify([c.serialize() for c in query.all()]), 200

@clients_bp.route('', methods=['POST'])
def create_client():
    data = request.json
    tenant_id = get_tenant_id(request)

    if not data.get('name'):
        return jsonify({'error': 'name es obligatorio'}), 400

    client = Client(
        tenant_id=tenant_id,
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
    client = Client.query.get(id)
    if not client:
        return jsonify({'error': 'Cliente no encontrado'}), 404
    return jsonify(client.serialize()), 200

@clients_bp.route('/<int:id>', methods=['PUT'])
def update_client(id):
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
    client = Client.query.get(id)
    if not client:
        return jsonify({'error': 'Cliente no encontrado'}), 404
    client.is_active = False
    db.session.commit()
    return jsonify({'message': 'Cliente eliminado'}), 200