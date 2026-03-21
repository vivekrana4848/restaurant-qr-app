// src/hooks/useMenuItems.js
import { useEffect, useState } from 'react';
import { subscribeMenuItems } from '../firebase/database';

export function useMenuItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeMenuItems((data) => {
      setItems(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { items, loading };
}
