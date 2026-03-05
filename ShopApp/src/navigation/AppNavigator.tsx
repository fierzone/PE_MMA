import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ShopifyTheme } from '../theme/ShopifyTheme';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Customer Screens
import { ProductListScreen } from '../screens/products/ProductListScreen';
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { CustomerAccountScreen } from '../screens/customer/CustomerAccountScreen';
import { OrderHistoryScreen } from '../screens/customer/OrderHistoryScreen';

// Admin Screens
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { RevenueScreen } from '../screens/revenue/RevenueScreen';
import { AdminProductListScreen } from '../screens/admin/AdminProductListScreen';
import { AdminUserListScreen } from '../screens/admin/AdminUserListScreen';
import { AdminOrderListScreen } from '../screens/admin/AdminOrderListScreen';
import { ProductFormScreen } from '../screens/products/ProductFormScreen';
import { LandingScreen } from '../screens/LandingScreen';

import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const CustomerTab = createBottomTabNavigator();
const AdminTab = createBottomTabNavigator();

function LoadingScreen() {
    return (
        <View style={styles.loadingScreen}>
            <Ionicons name="diamond" size={40} color="#5EEAD4" />
            <Text style={styles.loadingText}>KHỞI TẠO HỆ THỐNG...</Text>
        </View>
    );
}

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            <AuthStack.Screen name="Login" component={LoginScreen as any} />
            <AuthStack.Screen name="Register" component={RegisterScreen as any} />
        </AuthStack.Navigator>
    );
}

function CustomerTabNavigator() {
    return (
        <CustomerTab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#5EEAD4',
                tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
                tabBarStyle: tabBarStyle,
                tabBarLabelStyle: tabLabelStyle,
                tabBarIcon: ({ focused, color }) => {
                    const icons: Record<string, [string, string]> = {
                        Store: ['layers', 'layers-outline'],
                        Cart: ['bag', 'bag-outline'],
                        Account: ['person-circle', 'person-circle-outline'],
                    };
                    const [active, inactive] = icons[route.name] || ['circle', 'circle-outline'];
                    return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
                },
            })}
        >
            <CustomerTab.Screen name="Store" component={ProductListScreen as any} options={{ title: 'Cửa hàng' }} />
            <CustomerTab.Screen name="Cart" component={CartScreen as any} options={{ title: 'Giỏ hàng' }} />
            <CustomerTab.Screen name="Account" component={CustomerAccountScreen as any} options={{ title: 'Tài khoản' }} />
        </CustomerTab.Navigator>
    );
}

function AdminTabNavigator() {
    return (
        <AdminTab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#FFF',
                tabBarInactiveTintColor: 'rgba(255,255,255,0.2)',
                tabBarStyle: adminTabBarStyle,
                tabBarLabelStyle: tabLabelStyle,
                tabBarIcon: ({ focused, color }) => {
                    const icons: Record<string, [string, string]> = {
                        System: ['analytics', 'analytics-outline'],
                        Inventory: ['cube', 'cube-outline'],
                        Logistics: ['list', 'list-outline'],
                        Users: ['people', 'people-outline'],
                        Admin: ['shield-checkmark', 'shield-checkmark-outline'],
                    };
                    const [active, inactive] = icons[route.name] || ['circle', 'circle-outline'];
                    return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
                },
            })}
        >
            <AdminTab.Screen name="System" component={RevenueScreen as any} options={{ title: 'Hệ thống' }} />
            <AdminTab.Screen name="Inventory" component={AdminProductListScreen as any} options={{ title: 'Kho' }} />
            <AdminTab.Screen name="Logistics" component={AdminOrderListScreen as any} options={{ title: 'Đơn hàng' }} />
            <AdminTab.Screen name="Users" component={AdminUserListScreen as any} options={{ title: 'Khách' }} />
            <AdminTab.Screen name="Admin" component={ProfileScreen as any} options={{ title: 'Quản trị' }} />
        </AdminTab.Navigator>
    );
}

export default function AppNavigator() {
    const { user, isLoading, isAdmin } = useAuth();

    if (isLoading) return <LoadingScreen />;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
                {!user ? (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : isAdmin ? (
                    <>
                        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
                        <Stack.Screen name="ProductForm" component={ProductFormScreen as any} options={{ headerShown: true, title: 'Quản lý sản phẩm' }} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Landing" component={LandingScreen as any} />
                        <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
                        <Stack.Screen name="ProductDetail" component={ProductDetailScreen as any} options={{ headerShown: false }} />
                        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen as any} options={{ headerShown: false }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const tabBarStyle = {
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
};

const adminTabBarStyle = {
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
};

const tabLabelStyle = {
    fontSize: 9,
    fontWeight: '900' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
};

const styles = StyleSheet.create({
    loadingScreen: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    loadingText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        fontWeight: '900',
        letterSpacing: 3,
    },
});
