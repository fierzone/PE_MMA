import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, SafeAreaView, Image, Platform, Modal, Alert, ScrollView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useProduct } from '../../context/ProductContext';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminProductList'>;

export const AdminProductListScreen: React.FC<Props> = ({ navigation }) => {
    const { products, fetchProducts, deleteProduct, isLoading } = useProduct();
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (item: Product) => {
        Alert.alert(
            'Lưu trữ công cụ',
            `Bạn có chắc chắn muốn lưu trữ "${item.name}"? Nó sẽ không còn xuất hiện công khai trên cửa hàng.`,
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Lưu trữ', style: 'destructive', onPress: () => deleteProduct(item.id) },
            ]
        );
    };

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.row}>
            {/* Thumbnail + name */}
            <View style={styles.colTool}>
                <View style={styles.thumb}>
                    <Image source={{ uri: item.image }} style={styles.thumbImg} resizeMode="contain" />
                </View>
                <View>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.productId}>ID: #{item.id}</Text>
                </View>
            </View>

            {/* Price */}
            <View style={styles.colPrice}>
                <Text style={styles.priceText}>${item.price.toFixed(2)}<Text style={styles.priceUnit}>/tháng</Text></Text>
            </View>

            {/* Tier */}
            <View style={styles.colTier}>
                <View style={[styles.tierBadge, {
                    backgroundColor: item.tier === 'Premium' ? '#FEF3C7' : item.tier === 'Pro' ? '#EFF6FF' : '#F0FDF4',
                    borderColor: item.tier === 'Premium' ? '#FDE68A' : item.tier === 'Pro' ? '#BFDBFE' : '#BBF7D0',
                }]}>
                    <Text style={[styles.tierText, {
                        color: item.tier === 'Premium' ? '#92400E' : item.tier === 'Pro' ? '#1E40AF' : '#15803D',
                    }]}>{item.tier}</Text>
                </View>
            </View>

            {/* Status */}
            <View style={styles.colStatus}>
                <View style={styles.statusBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.statusText}>Hoạt động</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.colActions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('ProductForm', { product: item })}
                >
                    <Ionicons name="pencil-outline" size={16} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
                    <Ionicons name="archive-outline" size={16} color="#64748B" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderHeader = () => (
        <View>
            {/* Page header */}
            <View style={styles.pageHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.pageTitle}>Quản lý Kho hàng</Text>
                    <Text style={styles.pageSub}>Quản lý danh mục công cụ AI, điều chỉnh mô hình giá và kiểm soát cấp độ truy cập.</Text>
                </View>
                <View style={styles.headerActions}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={16} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm công cụ..."
                            placeholderTextColor="#94A3B8"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => navigation.navigate('ProductForm', {})}
                    >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                        <Text style={styles.addBtnText}>Thêm mới</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Table header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.colTool]}>CÔNG CỤ</Text>
                <Text style={[styles.th, styles.colPrice]}>GIÁ</Text>
                <Text style={[styles.th, styles.colTier]}>CẤP ĐỘ</Text>
                <Text style={[styles.th, styles.colStatus]}>TRẠNG THÁI</Text>
                <Text style={[styles.th, styles.colActions, { textAlign: 'right' }]}>THAO TÁC</Text>
            </View>
            <View style={styles.tableDivider} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filtered}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                onRefresh={fetchProducts}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="archive-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>Không có công cụ nào</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F8F8',
    },
    listContent: {
        paddingBottom: 40,
    },
    pageHeader: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: Platform.OS === 'web' ? 'flex-end' : 'flex-start',
        padding: 24,
        gap: 20,
        backgroundColor: '#F6F8F8',
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -1,
        marginBottom: 6,
    },
    pageSub: {
        fontSize: 14,
        color: '#64748B',
        maxWidth: 420,
        lineHeight: 20,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 6,
        paddingHorizontal: 14,
        height: 40,
        minWidth: 200,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#0F172A',
        borderRadius: 6,
        paddingHorizontal: 16,
        height: 40,
    },
    addBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },

    // Table
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: '#F6F8F8',
    },
    tableDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 24,
    },
    th: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 0.8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    colTool: {
        flex: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    thumb: {
        width: 56,
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    thumbImg: {
        width: '80%',
        height: '80%',
    },
    productName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    productId: {
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginTop: 2,
    },
    colPrice: {
        flex: 2,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    priceUnit: {
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: 'System',
    },
    colTier: {
        flex: 2,
    },
    tierBadge: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    tierText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    colStatus: {
        flex: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#DCFCE7',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#16A34A',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#16A34A',
    },
    colActions: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 4,
    },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
