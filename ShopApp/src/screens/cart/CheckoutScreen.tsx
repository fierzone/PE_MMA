import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView,
    TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export const CheckoutScreen: React.FC = () => {
    const { cartItems, totalPrice, clearCart } = useCart();
    const { checkout } = useOrder();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        Alert.alert(
            'Xác nhận thanh toán',
            `Tổng cộng: $${totalPrice.toFixed(2)}\n\nBạn có muốn tiến hành thanh toán?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Thanh toán',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const ok = await checkout(cartItems, totalPrice);
                            if (ok) {
                                Toast.show({
                                    type: 'success',
                                    text1: '🎉 Thanh toán thành công!',
                                    text2: 'Đơn hàng của bạn đã được xử lý.',
                                });
                                navigation.goBack();
                            } else {
                                Toast.show({ type: 'error', text1: 'Thanh toán thất bại', text2: 'Vui lòng thử lại.' });
                            }
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {cartItems.map(item => (
                    <View key={item.id} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.product.name}</Text>
                            <Text style={styles.itemQty}>Số lượng: {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                    </View>
                ))}

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.checkoutBtn, loading && { opacity: 0.7 }]}
                    onPress={handleCheckout}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <Text style={styles.checkoutBtnText}>XÁC NHẬN THANH TOÁN · ${totalPrice.toFixed(2)}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingHorizontal: 20, paddingVertical: 16,
        backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    scroll: { flex: 1, padding: 20 },
    itemRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: '#F1F5F9',
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
    itemQty: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
    itemPrice: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        borderTopWidth: 2, borderTopColor: '#0F172A', paddingTop: 16, marginTop: 8,
    },
    totalLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
    totalAmount: { fontSize: 24, fontWeight: '800', color: '#0F172A', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    checkoutBtn: {
        backgroundColor: '#0F172A', borderRadius: 10, paddingVertical: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    checkoutBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
});
