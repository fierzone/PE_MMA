import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tier } from '../types';

interface TierBadgeProps {
    tier: Tier;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
    const getBadgeStyle = () => {
        switch (tier) {
            case 'Premium': return styles.premium;
            case 'Pro': return styles.pro;
            default: return styles.basic;
        }
    };

    const getTextStyle = () => {
        switch (tier) {
            case 'Premium': return styles.premiumText;
            case 'Pro': return styles.proText;
            default: return styles.basicText;
        }
    };

    return (
        <View style={[styles.badge, getBadgeStyle()]}>
            <Text style={[styles.text, getTextStyle()]}>{tier.toUpperCase()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    basic: {
        backgroundColor: '#F4F4F5',
        borderColor: '#E4E4E7',
    },
    pro: {
        backgroundColor: '#F0F9FB',
        borderColor: '#E6F4FE',
    },
    premium: {
        backgroundColor: '#09090B',
        borderColor: '#09090B',
    },
    text: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    basicText: {
        color: '#71717A',
    },
    proText: {
        color: '#16869C',
    },
    premiumText: {
        color: '#FFFFFF',
    },
});
