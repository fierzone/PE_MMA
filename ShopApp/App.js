import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { initDatabase } from './src/database';
import { AuthProvider } from './src/context/AuthContext';
import { ProductProvider } from './src/context/ProductContext';
import { CartProvider } from './src/context/CartContext';
import { OrderProvider } from './src/context/OrderContext';
import { UserProvider } from './src/context/UserContext';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  const handleInitDatabase = async (db) => {
    try {
      console.log('[Database] Starting initialization...');
      await initDatabase(db);
      console.log('[Database] Initialization successful.');
    } catch (error) {
      console.error('[Database] Initialization failed:', error);
    }
  };

  return (
    <SQLiteProvider databaseName="shop.db" onInit={handleInitDatabase} useSuspense={false}>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <OrderProvider>
              <UserProvider>
                <AppNavigator />
                <Toast topOffset={60} />
              </UserProvider>
            </OrderProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </SQLiteProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
