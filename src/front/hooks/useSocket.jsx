import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const newSocket = io(backendUrl, {
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('WebSocket conectado');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('WebSocket desconectado');
            setConnected(false);
        });

        newSocket.on('connected', (data) => {
            console.log('Mensaje de conexión:', data.message);
        });

        newSocket.on('new_order', (order) => {
            console.log('Nuevo pedido recibido:', order);
            // Aquí puedes actualizar el estado global o mostrar una notificación
            window.dispatchEvent(new CustomEvent('new_order', { detail: order }));
        });

        newSocket.on('order_update', (order) => {
            console.log('Pedido actualizado:', order);
            window.dispatchEvent(new CustomEvent('order_update', { detail: order }));
        });

        newSocket.on('stock_alert', (ingredient) => {
            console.log('Alerta de stock:', ingredient);
            window.dispatchEvent(new CustomEvent('stock_alert', { detail: ingredient }));
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return { socket, connected };
};