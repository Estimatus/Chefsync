# =============================================================================
# RUTAS: Transactions (Movimientos de Caja)
# Endpoints para registrar y consultar ingresos/gastos del negocio.
# Cada endpoint filtra por tenant_id para separar datos entre empresas.
# =============================================================================

from flask import Blueprint, request, jsonify
from api.models import db, Transaction
from datetime import datetime

# Blueprint: agrupa las rutas bajo /api/transactions
transactions_bp = Blueprint('transactions', __name__)


# =============================================================================
# HELPER: get_tenant_id
# Extrae el tenant_id del header X-Tenant-ID enviado por el frontend.
# =============================================================================
def get_tenant_id(request):
    return request.headers.get('X-Tenant-ID', type=int)


# =============================================================================
# GET /api/transactions
# Lista todas las transacciones del tenant actual.
# Filtros opcionales:
#   - month: formato "YYYY-MM" para filtrar por mes
#   - type: "income" o "expense" para filtrar por tipo
# =============================================================================
@transactions_bp.route('', methods=['GET'])
def get_transactions():
    tenant_id = get_tenant_id(request)
    query = Transaction.query

    # FILTRO MULTI-TENANT
    if tenant_id:
        query = query.filter(Transaction.tenant_id == tenant_id)
    else:
        query = query.filter(Transaction.tenant_id == None)

    # Filtros opcionales
    month = request.args.get('month')
    type_ = request.args.get('type')

    if month:
        query = query.filter(Transaction.date.startswith(month))
    if type_:
        query = query.filter_by(type=type_)

    transactions = query.order_by(Transaction.date.desc()).all()
    return jsonify([t.serialize() for t in transactions]), 200


# =============================================================================
# POST /api/transactions
# Crea una nueva transacción (ingreso o gasto).
# =============================================================================
@transactions_bp.route('', methods=['POST'])
def create_transaction():
    data = request.json
    tenant_id = get_tenant_id(request)

    if not data.get('type') or not data.get('amount'):
        return jsonify({'error': 'type y amount son obligatorios'}), 400

    if data['type'] not in ['income', 'expense']:
        return jsonify({'error': 'type debe ser income o expense'}), 400

    transaction = Transaction(
        tenant_id=tenant_id,
        type=data['type'],
        amount=float(data['amount']),
        category=data.get('category', 'General'),
        description=data.get('description', ''),
        date=data.get('date', str(datetime.now().strftime('%Y-%m-%d'))),
        created_at=str(datetime.now())
    )

    db.session.add(transaction)
    db.session.commit()
    return jsonify(transaction.serialize()), 201


# =============================================================================
# PUT /api/transactions/<id>
# Actualiza una transacción existente.
# =============================================================================
@transactions_bp.route('/<int:id>', methods=['PUT'])
def update_transaction(id):
    transaction = Transaction.query.get(id)
    if not transaction:
        return jsonify({'error': 'Transacción no encontrada'}), 404

    data = request.json
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
# Elimina una transacción.
# =============================================================================
@transactions_bp.route('/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    transaction = Transaction.query.get(id)
    if not transaction:
        return jsonify({'error': 'Transacción no encontrada'}), 404

    db.session.delete(transaction)
    db.session.commit()
    return jsonify({'message': 'Transacción eliminada'}), 200


# =============================================================================
# GET /api/transactions/summary
# Resumen financiero del mes:
#   - total_income, total_expense, net
#   - by_category: desglose por categoría
#   - transaction_count
# =============================================================================
@transactions_bp.route('/summary', methods=['GET'])
def get_summary():
    tenant_id = get_tenant_id(request)
    month = request.args.get('month', datetime.now().strftime('%Y-%m'))

    query = Transaction.query.filter(Transaction.date.startswith(month))
    if tenant_id:
        query = query.filter(Transaction.tenant_id == tenant_id)
    else:
        query = query.filter(Transaction.tenant_id == None)

    transactions = query.all()

    # Calcular totales
    total_income = sum(t.amount for t in transactions if t.type == 'income')
    total_expense = sum(t.amount for t in transactions if t.type == 'expense')
    net = total_income - total_expense

    # Agrupar por categoría
    by_category = {}
    for t in transactions:
        key = f"{t.type}:{t.category}"
        if key not in by_category:
            by_category[key] = {"type": t.type, "category": t.category, "total": 0, "count": 0}
        by_category[key]["total"] += t.amount
        by_category[key]["count"] += 1

    return jsonify({
        "month": month,
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net": round(net, 2),
        "by_category": list(by_category.values()),
        "transaction_count": len(transactions)
    }), 200