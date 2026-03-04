import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { CartItemDetailed } from '../types';
import { Ionicons } from '@expo/vector-icons';

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
                <Text style={styles.unitPrice}>${item.product.price.toFixed(2)} / month</Text>
                <TouchableOpacity onPress={() => onRemove(item.id)}>
                    <Text style={styles.removeText}>Remove</Text>
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
                        <Ionicons name="remove" size={14} color="#334155" />
                    </TouchableOpacity>
                    <Text style={styles.qty}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                        <Ionicons name="add" size={14} color="#334155" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        gap: 16,
    },
    thumb: {
        width: 70,
        height: 70,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    thumbImage: {
        width: '80%',
        height: '80%',
    },
    content: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    unitPrice: {
        fontSize: 13,
        color: '#64748B',
    },
    removeText: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 4,
    },
    rightCol: {
        alignItems: 'flex-end',
        gap: 12,
    },
    lineTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    stepBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    qty: {
        width: 36,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
});
