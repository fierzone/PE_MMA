import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { CartItemDetailed } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { ShopifyTheme } from '../theme/ShopifyTheme';

interface CartItemProps {
    item: CartItemDetailed;
    onUpdateQuantity: (id: number, change: number) => void;
    onRemove: (id: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
    // Local state for immediate UI feedback (realtime)
    const [optimisticQty, setOptimisticQty] = React.useState(item.quantity);

    // Sync when context updates (if it catches up or on full reload)
    React.useEffect(() => {
        setOptimisticQty(item.quantity);
    }, [item.quantity]);

    const lineTotal = item.product.price * optimisticQty;

    const handleAdd = () => {
        setOptimisticQty(q => q + 1);
        onUpdateQuantity(item.id, 1);
    };

    const handleSub = () => {
        if (optimisticQty > 1) {
            setOptimisticQty(q => q - 1);
            onUpdateQuantity(item.id, -1);
        } else {
            onRemove(item.id);
        }
    };

    return (
        <View style={styles.card}>
            {/* Top row: Image & Info */}
            <View style={styles.topRow}>
                <View style={styles.thumb}>
                    <Image source={{ uri: item.product.image }} style={styles.thumbImage} resizeMode="contain" />
                </View>
                <View style={styles.content}>
                    <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
                    <Text style={styles.unitPrice}>${item.product.price.toFixed(2)} / bản quyền</Text>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(item.id)}>
                        <Ionicons name="trash-outline" size={14} color="#FF453A" />
                        <Text style={styles.removeText}>XÓA</Text>
                    </TouchableOpacity>
                </View>
                {/* Stepper on top right optionally, or bottom */}
            </View>

            {/* Bottom row: Stepper & Total */}
            <View style={styles.bottomRow}>
                <View style={styles.stepper}>
                    <TouchableOpacity style={styles.stepBtn} onPress={handleSub}>
                        <Ionicons name="remove" size={12} color={optimisticQty > 1 ? "#FFF" : "#FF453A"} />
                    </TouchableOpacity>
                    <Text style={styles.qty}>{optimisticQty}</Text>
                    <TouchableOpacity style={styles.stepBtn} onPress={handleAdd}>
                        <Ionicons name="add" size={12} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>TỔNG</Text>
                    <Text style={styles.lineTotal}>${lineTotal.toFixed(2)}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#0A0A0A',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    thumb: {
        width: 80,
        height: 80,
        backgroundColor: '#111827',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    thumbImage: {
        width: '70%',
        height: '70%',
    },
    content: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -0.5,
    },
    unitPrice: {
        fontSize: 12,
        color: ShopifyTheme.colors.textMuted,
        fontWeight: '500',
    },
    removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    removeText: {
        fontSize: 10,
        color: '#FF453A',
        fontWeight: '900',
        letterSpacing: 1,
    },
    totalBox: {
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: ShopifyTheme.colors.textMuted,
        letterSpacing: 2,
        marginBottom: 4,
    },
    lineTotal: {
        fontSize: 20,
        fontWeight: '900',
        color: ShopifyTheme.colors.accent,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    stepBtn: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qty: {
        width: 32,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '900',
        color: '#FFF',
    },
});
