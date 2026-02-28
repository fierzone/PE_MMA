import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    TextInput, Image, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SIZE, gs, CARD_W, ELEVATION } from '../theme/theme';
import { getAllProducts, deleteProduct } from '../database/database';
import { useCart, useAuth } from '../context/AppContext';
import { useFocusEffect } from '@react-navigation/native';

export default function ProductListScreen({ navigation }) {
    const { addToCart, totalItems } = useCart();
    const { user } = useAuth();

    // State quản lý danh sách sản phẩm
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState(null); // 'asc' | 'desc' | null

    // Trạng thái load dữ liệu
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Tải sản phẩm từ SQLite lên danh sách
    const loadProducts = useCallback(async () => {
        try {
            const data = await getAllProducts();
            setProducts(data);
            applyFilters(data, search, sortOrder);
        } catch (e) {
            Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [search, sortOrder]);

    // Cập nhật lại mỗi khi Màn hình được Focus
    useFocusEffect(useCallback(() => { loadProducts(); }, [loadProducts]));

    // Bộ lọc tìm kiếm và sắp xếp giá
    const applyFilters = (data, q, sort) => {
        let result = data.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
        if (sort === 'asc') result = [...result].sort((a, b) => a.price - b.price);
        if (sort === 'desc') result = [...result].sort((a, b) => b.price - a.price);
        setFiltered(result);
    };

    useEffect(() => { applyFilters(products, search, sortOrder); }, [search, sortOrder, products]);

    // Hàm xóa sản phẩm
    const handleDelete = (id, name) => {
        Alert.alert('Xóa Sản Phẩm', `Bạn có chắc muốn xóa "${name}"?`, [
            { text: 'Hủy bỏ', style: 'cancel' },
            {
                text: 'Xóa ngay', style: 'destructive',
                onPress: async () => { await deleteProduct(id); loadProducts(); },
            },
        ]);
    };

    // Nút Sắp xếp phụ (Component con)
    const SortButton = ({ label, value, icon }) => {
        const isActive = sortOrder === value;
        return (
            <TouchableOpacity
                style={[styles.sortBtn, isActive && styles.sortBtnActive]}
                onPress={() => setSortOrder(prev => prev === value ? null : value)}
                activeOpacity={0.7}
            >
                <Ionicons name={icon} size={14} color={isActive ? '#fff' : COLORS.textSoft} />
                <Text style={[styles.sortBtnText, isActive && styles.sortBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    // Render hiển thị từng dòng Sản Phẩm (dạng lưới 2 cột)
    const renderProduct = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
            <View style={styles.imageWrap}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                        <Ionicons name="cube-outline" size={36} color={COLORS.textMuted} />
                    </View>
                )}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.imageOverlay} />

                {/* Nút thêm vào giỏ nổi trên Hình ảnh */}
                <TouchableOpacity style={styles.cartBtn} onPress={() => addToCart(item)} activeOpacity={0.85}>
                    <LinearGradient colors={COLORS.gradPrimary} style={styles.cartBtnGrad} start={[0, 0]} end={[1, 1]}>
                        <Ionicons name="cart" size={16} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                <View style={gs.between}>
                    <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                    <View style={gs.row}>
                        {/* Sửa và Xóa */}
                        <TouchableOpacity onPress={() => navigation.navigate('EditProduct', { product: item })} style={styles.actionBtn}>
                            <Ionicons name="pencil" size={15} color={COLORS.sky} />
                        </TouchableOpacity>
                        <View style={{ width: 8 }} />
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionBtn}>
                            <Ionicons name="trash" size={15} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Đầu danh sách (Thanh search + Count lọc)
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Tìm kiếm tiếng việt */}
            <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm danh mục sản phẩm..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    selectionColor={COLORS.primary}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Sắp xếp và số kết quả */}
            <View style={gs.between}>
                <Text style={styles.countText}>Tìm thấy {filtered.length} kết quả</Text>
                <View style={gs.row}>
                    <SortButton label="Giá tăng" value="asc" icon="arrow-up" />
                    <View style={{ width: 8 }} />
                    <SortButton label="Giá giảm" value="desc" icon="arrow-down" />
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.root}>
            <SafeAreaView style={gs.safe}>
                {/* Top Navbar Header */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
                        <Text style={styles.greeting}>Xin chào, {user?.fullName?.split(' ')[0]} 👋</Text>
                        <Text style={styles.topTitle}>Khám phá</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cartIconWrap} onPress={() => navigation.navigate('Cart')} activeOpacity={0.8}>
                        <View style={styles.cartIconBg}>
                            <Ionicons name="cart-outline" size={24} color={COLORS.text} />
                            {/* Badge đỏ hiện số lượng giỏ hàng */}
                            {totalItems > 0 && (
                                <View style={[gs.badge, { backgroundColor: COLORS.rose }]}>
                                    <Text style={gs.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Nội dung danh sách sản phẩm lưới */}
                {loading ? (
                    <View style={gs.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderProduct}
                        numColumns={2}
                        columnWrapperStyle={styles.colWrap}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Ionicons name="cube-outline" size={64} color={COLORS.borderHigh} />
                                <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
                                <Text style={styles.emptySub}>Vui lòng thử tìm kiếm tùy chọn khác</Text>
                            </View>
                        }
                        contentContainerStyle={styles.list}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProducts(); }} tintColor={COLORS.primary} />}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Floating Action Button (FAB) : Thêm mới sản phẩm */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddProduct')}
                    activeOpacity={0.9}
                >
                    <LinearGradient colors={COLORS.gradPrimary} style={styles.fabGrad} start={[0, 0]} end={[1, 1]}>
                        <Ionicons name="add" size={28} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SIZE.pad, paddingTop: SIZE.sm, paddingBottom: SIZE.pad,
    },
    greeting: { fontSize: SIZE.sm, color: COLORS.textSoft, fontWeight: FONT.medium, letterSpacing: 0.5 },
    topTitle: { fontSize: SIZE.xxxl, fontWeight: FONT.black, color: COLORS.text, letterSpacing: -0.5, marginTop: 2 },
    cartIconWrap: { position: 'relative' },
    cartIconBg: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: COLORS.surfaceHigh, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: COLORS.border,
    },
    headerContainer: { paddingHorizontal: SIZE.pad, paddingBottom: SIZE.pad },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surface, borderRadius: SIZE.rLg,
        paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: COLORS.border,
        marginBottom: 16,
    },
    searchInput: { flex: 1, fontSize: SIZE.base, color: COLORS.text },
    countText: { fontSize: SIZE.sm, color: COLORS.textMuted, fontWeight: FONT.semiBold },
    sortBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: COLORS.surface, paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: SIZE.r, borderWidth: 1, borderColor: COLORS.border,
    },
    sortBtnActive: { backgroundColor: COLORS.primaryGlow, borderColor: COLORS.primary },
    sortBtnText: { fontSize: SIZE.xs, color: COLORS.textSoft, fontWeight: FONT.bold },
    sortBtnTextActive: { color: COLORS.primary },
    list: { paddingBottom: 120 },
    colWrap: { paddingHorizontal: SIZE.pad, gap: SIZE.pad },
    card: {
        width: CARD_W, backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.rLg,
        borderWidth: 1, borderColor: COLORS.border, marginBottom: SIZE.pad,
        overflow: 'hidden', ...ELEVATION.sm,
    },
    imageWrap: { position: 'relative', height: 140 },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
    imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 },
    cartBtn: { position: 'absolute', top: 10, right: 10, ...ELEVATION.md },
    cartBtnGrad: {
        width: 32, height: 32, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    cardBody: { padding: 14 },
    name: { fontSize: SIZE.base, fontWeight: FONT.bold, color: COLORS.text, marginBottom: 4 },
    desc: { fontSize: SIZE.xs, color: COLORS.textMuted, marginBottom: 12, lineHeight: 16 },
    price: { fontSize: SIZE.lg, fontWeight: FONT.black, color: COLORS.text },
    actionBtn: {
        width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.surface,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
    },
    empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { color: COLORS.textSoft, fontSize: SIZE.lg, fontWeight: FONT.bold },
    emptySub: { color: COLORS.textMuted, fontSize: SIZE.sm },
    fab: { position: 'absolute', bottom: 24, right: 20, ...ELEVATION.lg },
    fabGrad: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});
