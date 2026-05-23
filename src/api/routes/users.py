from flask import Blueprint, request, jsonify
from api.models import db, User, Tenant
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

users_bp = Blueprint('users', __name__)

@users_bp.route('', methods=['GET'])
def get_users():
    users = User.query.filter_by(is_active=True).all()
    return jsonify([u.serialize() for u in users]), 200

@users_bp.route('', methods=['POST'])
def create_user():
    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'email y password son obligatorios'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El email ya está registrado'}), 400

    # Crear tenant automáticamente si no existe
    tenant = None
    if data.get('business_name'):
        slug = data['business_name'].lower().replace(' ', '-')
        tenant = Tenant(
            name=data['business_name'],
            slug=slug,
            business_type=data.get('business_type', 'general'),
            plan='free',
            created_at=str(datetime.now())
        )
        db.session.add(tenant)
        db.session.flush()

    user = User(
        email=data['email'],
        password=generate_password_hash(data['password']),
        role=data.get('role', 'admin'),
        is_active=True,
        tenant_id=tenant.id if tenant else None
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.serialize()), 201

@users_bp.route('/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify(user.serialize()), 200

@users_bp.route('/<int:id>', methods=['PUT'])
def update_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    data = request.json
    if 'email' in data: user.email = data['email']
    if 'password' in data: user.password = data['password']
    if 'role' in data: user.role = data['role']
    db.session.commit()
    return jsonify(user.serialize()), 200

@users_bp.route('/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    user.is_active = False
    db.session.commit()
    return jsonify({'message': 'Usuario eliminado'}), 200

@users_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'email y password son obligatorios'}), 400

    user = User.query.filter_by(email=data['email'], is_active=True).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    # Incluir info del tenant en el response
    tenant_info = None
    if user.tenant_id:
        tenant = Tenant.query.get(user.tenant_id)
        if tenant:
            tenant_info = tenant.serialize()

    return jsonify({
        'message': 'Login exitoso',
        'user': {
            **user.serialize(),
            'tenant': tenant_info
        }
    }), 200