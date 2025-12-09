import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Restaurant } from '../types';

interface RestaurantContextType {
    restaurants: Restaurant[];
    currentRestaurant: Restaurant | null;
    setRestaurant: (restaurantId: string) => void;
    isLoading: boolean;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const { data, error } = await supabase
                .from('restaurants')
                .select('*');

            if (error) throw error;

            if (data) {
                const mappedRestaurants: Restaurant[] = data.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    location: r.location,
                    themeColor: r.theme_color
                }));
                setRestaurants(mappedRestaurants);
                // Default to the first one or try to load from storage
                if (mappedRestaurants.length > 0) {
                    const savedId = localStorage.getItem('fridas_restaurant_id');
                    const found = mappedRestaurants.find(r => r.id === savedId) || mappedRestaurants[0];
                    setCurrentRestaurant(found);
                }
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            // Fallback for development if table doesn't exist yet
            const mockRestaurants: Restaurant[] = [
                { id: '1', name: "Frida's Collierville", location: 'Collierville', themeColor: 'rose' },
                { id: '2', name: "Frida's Midtown", location: 'Midtown', themeColor: 'amber' },
                { id: '3', name: "Guac Downtown", location: 'Downtown', themeColor: 'emerald' }
            ];
            setRestaurants(mockRestaurants);
            setCurrentRestaurant(mockRestaurants[0]);
        } finally {
            setIsLoading(false);
        }
    };

    const setRestaurant = (restaurantId: string) => {
        const found = restaurants.find(r => r.id === restaurantId);
        if (found) {
            setCurrentRestaurant(found);
            localStorage.setItem('fridas_restaurant_id', found.id);
        }
    };

    return (
        <RestaurantContext.Provider value={{ restaurants, currentRestaurant, setRestaurant, isLoading }}>
            {children}
        </RestaurantContext.Provider>
    );
};

export const useRestaurant = () => {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
};
