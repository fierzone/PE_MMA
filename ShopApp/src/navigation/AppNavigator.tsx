import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

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
import { ProfileScreen } from '../screens/profile/ProfileScreen';           // Admin dashboard
import { RevenueScreen } from '../screens/revenue/RevenueScreen';           // Admin analytics
import { AdminProductListScreen } from '../screens/admin/AdminProductListScreen';
import { AdminUserListScreen } from '../screens/admin/AdminUserListScreen';
import { ProductFormScreen } from '../screens/products/ProductFormScreen';
import { LandingScreen } from '../screens/LandingScreen';

import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const CustomerTab = createBottomTabNavigator();
const AdminTab = createBottomTabNavigator();

// ─── Loading Screen ────────────────────────────────────────────────
function LoadingScreen() {
    return (
        <View style={styles.loadingScreen}>
            <Ionicons name="diamond" size={40} color="#5EEAD4" />
            <Text style={styles.loadingText}>KHỞI TẠO HỆ THỐNG...</Text>
        </View>
    );
}

// ─── Auth Navigator ────────────────────────────────────────────────
function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            <AuthStack.Screen name="Login" component={LoginScreen as any} />
            <AuthStack.Screen name="Register" component={RegisterScreen as any} />
        </AuthStack.Navigator>
    );
}

// ─── Customer Tab Navigator ─────────────────────────────────────────
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

// ─── Admin Tab Navigator ────────────────────────────────────────────
function AdminTabNavigator() {
    return (
        <AdminTab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#5EEAD4',
                tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
                tabBarStyle: adminTabBarStyle,
                tabBarLabelStyle: tabLabelStyle,
                tabBarIcon: ({ focused, color }) => {
                    const icons: Record<string, [string, string]> = {
                        Dashboard: ['grid', 'grid-outline'],
                        Analytics: ['podium', 'podium-outline'],
                        Products: ['cube', 'cube-outline'],
                        Customers: ['people', 'people-outline'],
                    };
                    const [active, inactive] = icons[route.name] || ['circle', 'circle-outline'];
                    return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
                },
            })}
        >
            <AdminTab.Screen name="Dashboard" component={ProfileScreen as any} options={{ title: 'Hồ sơ' }} />
            <AdminTab.Screen name="Analytics" component={RevenueScreen as any} options={{ title: 'Doanh thu' }} />
            <AdminTab.Screen name="Products" component={AdminProductListScreen as any} options={{ title: 'Sản phẩm' }} />
            <AdminTab.Screen name="Customers" component={AdminUserListScreen as any} options={{ title: 'Khách hàng' }} />
        </AdminTab.Navigator>
    );
}

// ─── Root Navigator ─────────────────────────────────────────────────
export default function AppNavigator() {
    const { user, isLoading, isAdmin } = useAuth();

    if (isLoading) return <LoadingScreen />;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
                {!user ? (
                    // Not logged in → Show Auth flow
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : isAdmin ? (
                    // Admin user → Show Admin flow
                    <>
                        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
                        <Stack.Screen
                            name="ProductForm"
                            component={ProductFormScreen as any}
                            options={{ headerShown: true, title: 'Quản lý sản phẩm' }}
                        />
                        <Stack.Screen
                            name="AdminProductList"
                            component={AdminProductListScreen as any}
                            options={{ headerShown: true, title: 'Kho sản phẩm' }}
                        />
                        <Stack.Screen
                            name="AdminUserList"
                            component={AdminUserListScreen as any}
                            options={{ headerShown: true, title: 'Quản lý khách hàng' }}
                        />
                    </>
                ) : (
                    // Customer user → Show Customer flow
                    <>
                        <Stack.Screen name="Landing" component={LandingScreen as any} />
                        <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
                        <Stack.Screen
                            name="ProductDetail"
                            component={ProductDetailScreen as any}
                            options={{ headerShown: true, title: 'Chi tiết sản phẩm' }}
                        />
                        <Stack.Screen
                            name="OrderHistory"
                            component={OrderHistoryScreen as any}
                            options={{ headerShown: false }}
                        />
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
    elevation: 0,
    shadowOpacity: 0,
};

const adminTabBarStyle = {
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    elevation: 0,
    shadowOpacity: 0,
};

const tabLabelStyle = {
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
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
