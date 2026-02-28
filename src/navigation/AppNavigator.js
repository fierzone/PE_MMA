import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import CartScreen from '../screens/CartScreen';
import RevenueScreen from '../screens/RevenueScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AppContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isAuthenticated } = useAuth();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                {!isAuthenticated ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Products" component={ProductListScreen} />
                        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                        <Stack.Screen name="AddProduct" component={ProductFormScreen} />
                        <Stack.Screen name="EditProduct" component={ProductFormScreen} />
                        <Stack.Screen name="Cart" component={CartScreen} />
                        <Stack.Screen name="Revenue" component={RevenueScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
