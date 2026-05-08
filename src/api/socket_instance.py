"""
Módulo para mantener la referencia a socketio
Evita importación circular con api.app
"""
socketio_instance = None

def get_socketio():
    return socketio_instance

def set_socketio(sio):
    global socketio_instance
    socketio_instance = sio
