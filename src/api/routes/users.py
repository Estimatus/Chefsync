"""
Ruta base de users.
Endpoints:
- GET /api/users - Listar todos
- POST /api/users - Crear uno
"""
from flask import Blueprint, request, jsonify
from api.models import db, User

users_bp = Blueprint('users', __name__)

@users_bp.route('', methods=['GET'])
def get_users():
    """ listar todos los usuarios (sin password) """
    users = User.query.filter_by(is_active=True).all()
    return jsonify([u.serialize() for u in users]), 200

@users_bp.route('', methods=['POST'])
def create_user():
    """ crear un nuevo usuario """
    data = request.json
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'email y password son obligatorios'}), 400
    
    # Verificar si email ya existe
    existing = User.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({'error': 'El email ya está registrado'}), 400
    
    user = User(
        email=data['email'],
        password=data['password'],
        role=data.get('role', 'chef'),
        is_active=True
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.serialize()), 201

@users_bp.route('/<int:id>', methods=['GET'])
def get_user(id):
    """ obtener un usuario por id """
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify(user.serialize()), 200

@users_bp.route('/<int:id>', methods=['PUT'])
def update_user(id):
    """ actualizar un usuario """
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
    """ eliminar (desactivar) un usuario """
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    user.is_active = False
    db.session.commit()
    return jsonify({'message': 'Usuario eliminado'}), 200

@users_bp.route('/login', methods=['POST'])
def login():
    """ iniciar sesion """
    data = request.json
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'email y password son obligatorios'}), 400
    
    user = User.query.filter_by(email=data['email'], is_active=True).first()
    if not user or user.password != data['password']:
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    return jsonify({
        'message': 'Login exitoso',
        'user': user.serialize()
    }), 200