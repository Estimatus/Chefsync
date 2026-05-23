# =============================================================================
# RUTAS: Transactions (Movimientos de Caja)
# =============================================================================
# Endpoints para registrar y consultar ingresos/gastos del negocio.
# Cada endpoint filtra por tenant_id para separar datos entre empresas.

from flask import Blueprint, request, jsonify
from api.models import db, Transaction
from datetime import datetime

# Blueprint: agrupa las rutas bajo /api/transactions
transactions_bp = Blueprint('transactions', __name__)


# =============================================================================
# HELPER: get_tenant_id
# =============================================================================
# Extrae el tenant_id del header X-Tenant-ID enviado por el frontend.
# Si no existe, retorna None (el backend maneja esto en cada endpoint).

def get_tenant_id(request):
    return request.headers.get('X-Tenant-ID', type=int)


# =============================================================================
# GET /api/transactions
# =============================================================================
# Lista todas las transacciones del tenant actual.
# Filtros opcionales:
#   - month: formato "YYYY-MM" para filtrar por mes
#   - type: "income" o "expense" para filtrar por tipo

@transactions_bp.route('', methods=['GET'])
def get_transactions():
    # Obtener tenant del header
    tenant_id = get_tenant_id(request)

    # Query base: todas las transacciones
    query = Transaction.query

    # FILTRO MULTI-TENANT: si hay tenant_id, mostrar solo las de ese tenant.
    # Si no hay tenant_id, mostrar solo las que tienen tenant_id = NULL
    # (datos legacy sin asignar).
    if tenant_id:
        query = query.filter(Transaction.tenant_id == tenant_id)
    else:
        query = query.filter(Transaction.tenant_id == None)

    # Filtro por mes (ej: "2026-05")
    month = request.args.get('month')
    # Filtro por tipo: "income" | "expense"
    type_ = request.args.get('type')

    # Aplicar filtros si vienen en la query string
    if month:
        # Compara el inicio de la fecha (date empieza con "YYYY-MM")
        query = query.filter(Transaction.date.startswith(month))
    if type_:
        query = query.filter_by(type=type_)

    # Ordenar por fecha descendente (más reciente primero)
    transactions = query.order_by(Transaction.date.desc()).all()

    # Serializar cada transaction a JSON y devolver lista
    return jsonify([t.serialize() for t in transactions]), 200


# =============================================================================
# POST /api/transactions
# =============================================================================
# Crea una nueva transacción (ingreso o gasto).

@transactions_bp.route('', methods=['POST'])
def create_transaction():
    data = request.json  # Cuerpo de la petición en JSON
    tenant_id = get_tenant_id(request)

    # Validación: type y amount son obligatorios
    if not data.get('type') or not data.get('amount'):
        return jsonify({'error': 'type y amount son obligatorios'}), 400

    # Validación: type debe ser "income" o "expense"
    if data['type'] not in ['income', 'expense']:
        return jsonify({'error': 'type debe ser income o expense'}), 400

    # Crear la transacción con los datos del body
    transaction = Transaction(
        tenant_id=tenant_id,                          # Asociar al tenant actual
        type=data['type'],                             # "income" o "expense"
        amount=float(data['amount']),                  # Convertir a número
        category=data.get('category', 'General'),      # Default: "General"
        description=data.get('description', ''),       # Default: string vacío
        # Default: fecha de hoy en formato YYYY-MM-DD
        date=data.get('date', str(datetime.now().strftime('%Y-%m-%d'))),
        created_at=str(datetime.now())                 # Timestamp completo
    )

    # Guardar en la BD
    db.session.add(transaction)
    db.session.commit()

    # Devolver la transacción creada (serializada a JSON)
    return jsonify(transaction.serialize()), 201


# =============================================================================
# PUT /api/transactions/<id>
# =============================================================================
# Actualiza una transacción existente (solo algunos campos editables).

@transactions_bp.route('/<int:id>', methods=['PUT'])
def update_transaction(id):
    # Buscar transacción por ID
    transaction = Transaction.query.get(id)
    if not transaction:
        return jsonify({'error': 'Transacción no encontrada'}), 404

    data = request.json

    # Actualizar campos solo si vienen en el body
    if 'amount' in data:
        transaction.amount = float(data['amount'])
    if 'category' in data:
        transaction.category = data['category']
    if 'description' in data:
        transaction.description = data['description']
    if 'date' in data:
        transaction.date = data['date']
    if 'type' in data:
        transaction.type = data['type']

    db.session.commit()
    return jsonify(transaction.serialize()), 200


# =============================================================================
# DELETE /api/transactions/<id>
# =============================================================================
# Elimina una transacción (eliminación física de la BD).

@transactions_bp.route('/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    transaction = Transaction.query.get(id)
    if not transaction:
        return jsonify({'error': 'Transacción no encontrada'}), 404

    # Eliminar de la BD
    db.session.delete(transaction)
    db.session.commit()

    return jsonify({'message': 'Transacción eliminada'}), 200


# =============================================================================
# GET /api/transactions/summary
# =============================================================================
# Devuelve un resumen financiero del mes:
#   - total_income: suma de todos los ingresos
#   - total_expense: suma de todos los gastos
#   - net: diferencia (ganancia/pérdida neta)
#   - by_category: desglose por categoría
#   - transaction_count: total de movimientos

@transactions_bp.route('/summary', methods=['GET'])
def get_summary():
    tenant_id = get_tenant_id(request)
    # Default: mes actual en formato YYYY-MM
    month = request.args.get('month', datetime.now().strftime('%Y-%m'))

    # Query filtrando por mes y tenant
    query = Transaction.query.filter(Transaction.date.startswith(month))
    if tenant_id:
        query = query.filter(Transaction.tenant_id == tenant_id)
    else:
        query = query.filter(Transaction.tenant_id == None)

    transactions = query.all()

    # Calcular totales
    # Sumar amounts donde type = 'income'
    total_income = sum(t.amount for t in transactions if t.type == 'income')
    # Sumar amounts donde type = 'expense'
    total_expense = sum(t.amount for t in transactions if t.type == 'expense')
    # Ganancia/pérdida neta
    net = total_income - total_expense

    # =============================================================================
    # AGRUPAR POR CATEGORÍA
    # =============================================================================
    # Crea un dict con clave "type:category" para cada combinación única.
    # Acumula total y count por cada una.
    by_category = {}
    for t in transactions:
        key = f"{t.type}:{t.category}"
        if key not in by_category:
            # Primera vez que vemos esta combinación: crear entrada
            by_category[key] = {"type": t.type, "category": t.category, "total": 0, "count": 0}
        # Acumular monto y cantidad
        by_category[key]["total"] += t.amount
        by_category[key]["count"] += 1

    # Devolver resumen como JSON
    return jsonify({
        "month": month,
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net": round(net, 2),
        "by_category": list(by_category.values()),
        "transaction_count": len(transactions)
    }), 200