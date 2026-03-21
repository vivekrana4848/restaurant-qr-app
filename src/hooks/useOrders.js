// src/hooks/useOrders.js
import { useEffect, useState } from 'react';
import { subscribeOrders, subscribeTableOrder } from '../firebase/database';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { orders, loading };
}

export function useTableOrder(tableNumber) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableNumber) { setLoading(false); return; }
    const unsub = subscribeTableOrder(tableNumber, (data) => {
      setOrder(data);
      setLoading(false);
    });
    return unsub;
  }, [tableNumber]);

  return { order, loading };
}
