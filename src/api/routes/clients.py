# =============================================================================
# ARCHIVO: clients.py
# DESCRIPCIÓN: Rutas API para gestión de clientes.
# Cada cliente puede tener múltiples pedidos asociados.
# =============================================================================

from flask import Blueprint, request, jsonify
from api.models import db, Client

# Blueprint para rutas de clientes
clients_bp = Blueprint('clients', __name__)

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
# GET /api/clients
# =============================================================================
# Lista todos los clientes activos del tenant actual.
# Returns: JSON array de clientes serializados
# =============================================================================
@clients_bp.route('', methods=['GET'])
def get_clients():
    tenant_id = get_tenant_id(request)
    query = Client.query.filter(Client.is_active == True)
    if tenant_id:
        query = query.filter(Client.tenant_id == tenant_id)
    else:
        query = query.filter(Client.tenant_id == None)
    return jsonify([c.serialize() for c in query.all()]), 200

# =============================================================================
# POST /api/clients
# =============================================================================
# Crea un nuevo cliente.
# Body: name (str, requerido), email (str, opcional),
#       phone (str, opcional), address (str, opcional)
# Returns: JSON cliente creado
# =============================================================================
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

# =============================================================================
# GET /api/clients/<id>
# =============================================================================
# Obtiene un cliente específico por su ID.
# Params: id (int) - ID del cliente
# Returns: JSON cliente o error 404
# =============================================================================
@clients_bp.route('/<int:id>', methods=['GET'])
def get_client(id):
    client = Client.query.get(id)
    if not client:
        return jsonify({'error': 'Cliente no encontrado'}), 404
    return jsonify(client.serialize()), 200

# =============================================================================
# PUT /api/clients/<id>
# =============================================================================
# Actualiza un cliente existente.
# Params: id (int) - ID del cliente
# Body: name, email, phone, address (todos opcionales)
# Returns: JSON cliente actualizado
# =============================================================================
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

# =============================================================================
# DELETE /api/clients/<id>
# =============================================================================
# Elimina lógicamente un cliente (is_active = false).
# Params: id (int) - ID del cliente
# Returns: JSON mensaje de confirmación
# =============================================================================
@clients_bp.route('/<int:id>', methods=['DELETE'])
def delete_client(id):
    client = Client.query.get(id)
    if not client:
        return jsonify({'error': 'Cliente no encontrado'}), 404
    client.is_active = False
    db.session.commit()
    return jsonify({'message': 'Cliente eliminado'}), 200