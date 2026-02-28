import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);
const CartContext = createContext(null);

// ─── AUTH CONTEXT ────────────────────────────────────────────────────────────

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, user: action.payload, isAuthenticated: true };
        case 'LOGOUT':
            return { ...state, user: null, isAuthenticated: false };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user: null, isAuthenticated: false });

    useEffect(() => {
        const loadSavedUser = async () => {
            try {
                const saved = await AsyncStorage.getItem('rememberedUser');
                if (saved) {
                    dispatch({ type: 'LOGIN', payload: JSON.parse(saved) });
                }
            } catch (e) { }
        };
        loadSavedUser();
    }, []);

    const login = useCallback(async (user, remember) => {
        dispatch({ type: 'LOGIN', payload: user });
        if (remember) {
            await AsyncStorage.setItem('rememberedUser', JSON.stringify(user));
        }
    }, []);

    const logout = useCallback(async () => {
        dispatch({ type: 'LOGOUT' });
        await AsyncStorage.removeItem('rememberedUser');
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// ─── CART CONTEXT ────────────────────────────────────────────────────────────

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const exists = state.items.find(i => i.id === action.payload.id);
            if (exists) {
                return {
                    ...state,
                    items: state.items.map(i =>
                        i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
                    ),
                };
            }
            return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
        }
        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter(i => i.id !== action.payload) };
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items
                    .map(i => i.id === action.payload.id ? { ...i, quantity: action.payload.qty } : i)
                    .filter(i => i.quantity > 0),
            };
        case 'CLEAR_CART':
            return { ...state, items: [] };
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    const addToCart = useCallback((product) => dispatch({ type: 'ADD_ITEM', payload: product }), []);
    const removeFromCart = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
    const updateQuantity = useCallback((id, qty) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, qty } }), []);
    const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

    const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items: state.items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
