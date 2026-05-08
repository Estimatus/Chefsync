import { useState, useEffect, useCallback } from 'react';

const OFFLINE_QUEUE_KEY = 'chefsync_offline_orders';

export const useOfflineOrders = (backendUrl) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineQueue, setOfflineQueue] = useState([]);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const savedQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
        if (savedQueue) {
            setOfflineQueue(JSON.parse(savedQueue));
        }
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncOfflineOrders();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [backendUrl]);

    const queueOrder = useCallback(async (orderData) => {
        if (navigator.onLine) {
            return null;
        }

        const offlineOrder = {
            ...orderData,
            queuedAt: new Date().toISOString(),
            id: Date.now()
        };

        const newQueue = [...offlineQueue, offlineOrder];
        setOfflineQueue(newQueue);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
        return offlineOrder;
    }, [offlineQueue]);

    const syncOfflineOrders = useCallback(async () => {
        if (syncing || offlineQueue.length === 0) return;

        setSyncing(true);
        const queue = [...offlineQueue];
        const failed = [];

        for (const order of queue) {
            try {
                const response = await fetch(`${backendUrl}/api/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order)
                });

                if (!response.ok) {
                    failed.push(order);
                }
            } catch (err) {
                failed.push(order);
            }
        }

        setOfflineQueue(failed);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failed));
        setSyncing(false);

        return { synced: queue.length - failed.length, failed: failed.length };
    }, [backendUrl, offlineQueue, syncing]);

    const clearQueue = useCallback(() => {
        setOfflineQueue([]);
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
    }, []);

    return {
        isOnline,
        offlineQueue,
        queueOrder,
        syncOfflineOrders,
        clearQueue,
        syncing,
        pendingCount: offlineQueue.length
    };
};

export const usePushNotifications = () => {
    const [permission, setPermission] = useState(Notification?.permission || 'default');

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            return 'unsupported';
        }

        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    }, []);

    const showNotification = useCallback((title, options = {}) => {
        if (permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/env-file-809e82fa.png',
                badge: '/env-file-809e82fa.png',
                ...options
            });

            setTimeout(() => notification.close(), 5000);
            return notification;
        }
        return null;
    }, [permission]);

    return { permission, requestPermission, showNotification };
};
