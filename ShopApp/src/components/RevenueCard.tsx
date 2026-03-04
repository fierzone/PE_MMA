import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RevenueCardProps {
    label: string;
    amount: number;
    period: string;
}

export const RevenueCard: React.FC<RevenueCardProps> = ({ label, amount, period }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.row}>
                <Text style={styles.amount}>${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <View style={styles.periodBadge}>
                    <Text style={styles.periodText}>{period}</Text>
                </View>
            </View>
            <View style={styles.progressBar}>
                <View style={[styles.progressLine, { width: '65%' }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E4E4E7',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#71717A',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    amount: {
        fontSize: 32,
        fontWeight: '900',
        color: '#09090B',
        letterSpacing: -1.5,
    },
    periodBadge: {
        backgroundColor: '#F0F9FB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    periodText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#16869C',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#F4F4F5',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressLine: {
        height: '100%',
        backgroundColor: '#16869C',
        borderRadius: 2,
    },
});
