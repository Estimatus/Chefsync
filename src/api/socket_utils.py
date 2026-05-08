"""
Funciones helper para WebSockets
"""
from flask_socketio import emit
import api.socket_instance as socket_instance

def emit_new_order(order):
    """Emitir evento cuando se crea un nuevo pedido"""
    sio = socket_instance.get_socketio()
    if sio:
        sio.emit('new_order', order, to='/')

def emit_order_update(order):
    """Emitir evento cuando se actualiza un pedido"""
    sio = socket_instance.get_socketio()
    if sio:
        sio.emit('order_update', order, to='/')

def emit_stock_alert(ingredient):
    """Emitir evento cuando hay alerta de stock"""
    sio = socket_instance.get_socketio()
    if sio:
        sio.emit('stock_alert', ingredient, to='/')
