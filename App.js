import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, CartProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/database/database';
import { StatusBar } from 'expo-status-bar';

import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Text style={{ fontSize: 20, color: 'red', marginBottom: 10 }}>Something went wrong.</Text>
          <Text style={{ color: 'black' }}>{this.state.error && this.state.error.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const setup = async () => {
      try {
        await initializeDatabase();
      } catch (e) {
        console.error('DB init error:', e);
        setDbError(e.toString());
      } finally {
        setReady(true);
      }
    };
    setup();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0F1A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0F0F1A" />
        {dbError ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: 'white', marginBottom: 10 }}>Database Initialization Failed:</Text>
            <Text style={{ color: 'red' }}>{dbError}</Text>
          </View>
        ) : (
          <AuthProvider>
            <CartProvider>
              <AppNavigator />
            </CartProvider>
          </AuthProvider>
        )}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
