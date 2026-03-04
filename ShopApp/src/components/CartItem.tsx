import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { CartItemDetailed } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { ShopifyTheme } from '../theme/ShopifyTheme';

interface CartItemProps {
    item: CartItemDetailed;
    onUpdateQuantity: (id: number, qty: number) => void;
    onRemove: (id: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
    const lineTotal = item.product.price * item.quantity;

    return (
        <View style={styles.row}>
            {/* Thumbnail */}
            <View style={styles.thumb}>
                <Image source={{ uri: item.product.image }} style={styles.thumbImage} resizeMode="contain" />
            </View>

            {/* Middle content */}
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.unitPrice}>${item.product.price.toFixed(2)} / bản quyền</Text>
                <TouchableOpacity onPress={() => onRemove(item.id)}>
                    <Text style={styles.removeText}>LOẠI BỎ</Text>
                </TouchableOpacity>
            </View>

            {/* Right: total + qty stepper */}
            <View style={styles.rightCol}>
                <Text style={styles.lineTotal}>${lineTotal.toFixed(2)}</Text>
                <View style={styles.stepper}>
                    <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => {
                            if (item.quantity > 1) onUpdateQuantity(item.id, item.quantity - 1);
                            else onRemove(item.id);
                        }}
                    >
                        <Ionicons name="remove" size={12} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.qty}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                        <Ionicons name="add" size={12} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        gap: 16,
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
    removeText: {
        fontSize: 10,
        color: '#FF453A',
        fontWeight: '900',
        letterSpacing: 1,
        marginTop: 8,
    },
    rightCol: {
        alignItems: 'flex-end',
        gap: 12,
    },
    lineTotal: {
        fontSize: 16,
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
