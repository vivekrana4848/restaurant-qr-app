// src/context/RestaurantContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeRestaurant } from '../firebase/database';

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState({
    name: 'TableSide Kitchen',
    tagline: "It's not just food, it's an experience",
    taxRate: 5,
    currency: '₹'
  });

  useEffect(() => {
    const unsub = subscribeRestaurant(setRestaurant);
    return unsub;
  }, []);

  return (
    <RestaurantContext.Provider value={restaurant}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => useContext(RestaurantContext);
