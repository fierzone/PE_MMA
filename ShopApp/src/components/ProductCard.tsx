import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
    onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.85} onPress={onPress}>
            {/* Image area - large, clean, like the mockup */}
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: product.image || 'https://via.placeholder.com/400' }}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>

            {/* Info row */}
            <View style={styles.infoRow}>
                <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
                <View style={styles.priceCol}>
                    <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                    <Text style={styles.priceUnit}>/mo</Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={1}>
                {product.description}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#111827', // Deep gray/black
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#0F172A',
        borderRadius: 16,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '70%',
        height: '70%',
        tintColor: '#FFFFFF', // Optional: forces white logos for uniformity if needed
    },
    infoRow: {
        marginBottom: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        lineHeight: 22,
    },
    priceCol: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginTop: 6,
    },
    price: {
        fontSize: 18,
        fontWeight: '900',
        color: '#5EEAD4', // Electric teal
    },
    priceUnit: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '700',
    },
    description: {
        fontSize: 13,
        color: '#94A3B8',
        lineHeight: 20,
        fontWeight: '500',
    },
});
