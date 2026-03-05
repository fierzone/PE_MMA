import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, SafeAreaView, Image, Platform, Alert, StatusBar
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useProduct } from '../../context/ProductContext';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import Toast from 'react-native-toast-message';
import { Modal } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminProductList'>;

export const AdminProductListScreen: React.FC<Props> = ({ navigation }) => {
    const { products, fetchProducts, deleteProduct, isLoading } = useProduct();
    const [search, setSearch] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (item: Product) => {
        setProductToDelete(item);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        try {
            const success = await deleteProduct(productToDelete.id);
            if (success) {
                Toast.show({
                    type: 'success',
                    text1: 'Xóa thành công',
                    text2: `Sản phẩm "${productToDelete.name}" đã được gỡ khỏi kho.`
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Không thể xóa sản phẩm vào lúc này.'
                });
            }
        } catch (e) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi hệ thống',
                text2: 'Vui lòng thử lại sau.'
            });
        } finally {
            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.row}>
            <View style={styles.colTool}>
                <View style={styles.thumb}>
                    <Image source={{ uri: item.image }} style={styles.thumbImg} resizeMode="contain" />
                </View>
                <View>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.productId}>ID: #{item.id}</Text>
                </View>
            </View>

            <View style={styles.colPrice}>
                <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
            </View>

            <View style={styles.colTier}>
                <Text style={styles.tierText}>{item.tier.toUpperCase()}</Text>
            </View>

            <View style={styles.colActions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('ProductForm', { product: item })}
                >
                    <Ionicons name="pencil" size={14} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnTrash} onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={14} color="#FF453A" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.chapterMarker}>CHAPTER XI · INVENTORY</Text>
            <View style={styles.heroRow}>
                <View>
                    <Text style={styles.title}>Quản lý</Text>
                    <Text style={styles.titleAccent}>Kho hàng.</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('ProductForm', {})}
                >
                    <Ionicons name="add" size={20} color="#000" />
                    <Text style={styles.addBtnText}>THÊM MỚI</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color={ShopifyTheme.colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm công cụ..."
                    placeholderTextColor={ShopifyTheme.colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.colTool]}>DANH MỤC</Text>
                <Text style={[styles.th, styles.colPrice]}>GIÁ</Text>
                <Text style={[styles.th, styles.colTier]}>TẦNG</Text>
                <Text style={[styles.th, styles.colActions, { textAlign: 'right' }]}>TD</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
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
                        <Text style={styles.emptyText}>KHÔNG CÓ DỮ LIỆU</Text>
                    </View>
                }
            />

            {/* Custom Delete Confirmation Modal */}
            <Modal visible={showDeleteModal} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalIcon}>
                                <Ionicons name="trash-outline" size={32} color="#FF453A" />
                            </View>
                            <Text style={styles.modalTitle}>Xác nhận xóa?</Text>
                            <Text style={styles.modalDesc}>
                                Bạn có chắc chắn muốn xóa sản phẩm <Text style={styles.modalHighlight}>"{productToDelete?.name}"</Text>?
                                Hành động này không thể hoàn tác.
                            </Text>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setShowDeleteModal(false)}
                                >
                                    <Text style={styles.cancelBtnText}>HỦY BỎ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.confirmBtn}
                                    onPress={handleConfirmDelete}
                                >
                                    <Text style={styles.confirmBtnText}>XÁC NHẬN XÓA</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ShopifyTheme.colors.background,
    },
    header: {
        paddingHorizontal: 32,
        paddingTop: 40,
        paddingBottom: 24,
    },
    chapterMarker: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 16,
    },
    heroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1.5,
    },
    titleAccent: {
        fontSize: 48,
        fontWeight: '900',
        color: ShopifyTheme.colors.accent,
        letterSpacing: -3,
        marginTop: -10,
    },
    addBtn: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 100,
        gap: 8,
    },
    addBtnText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 100,
        paddingHorizontal: 20,
        height: 48,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#FFF',
        fontSize: 14,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    th: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    listContent: {
        paddingBottom: 40,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    colTool: {
        flex: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    thumb: {
        width: 44,
        height: 44,
        backgroundColor: '#111827',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    thumbImg: {
        width: '70%',
        height: '70%',
    },
    productName: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
    },
    productId: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 10,
        marginTop: 2,
    },
    colPrice: {
        flex: 2,
    },
    priceText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    colTier: {
        flex: 2,
    },
    tierText: {
        color: ShopifyTheme.colors.accent,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    colActions: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnTrash: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 69, 58, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyText: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    modal: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#111827',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    modalContent: {
        padding: 32,
        alignItems: 'center',
    },
    modalIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalDesc: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 32,
    },
    modalHighlight: {
        color: '#FFF',
        fontWeight: '700',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '800',
        fontSize: 12,
        letterSpacing: 1,
    },
    confirmBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FF453A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnText: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1,
    },
});
