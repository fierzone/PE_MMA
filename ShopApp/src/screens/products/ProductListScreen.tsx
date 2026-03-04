import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    SafeAreaView, Platform, Dimensions, ScrollView
} from 'react-native';
import { useProduct } from '../../context/ProductContext';
import { ProductCard } from '../../components/ProductCard';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerTabs'>;

const CATEGORIES = ['All Tools', 'Basic', 'Pro', 'Premium'];

export const ProductListScreen: React.FC<Props> = ({ navigation }) => {
    const { products, fetchProducts, isLoading } = useProduct();
    const { isAdmin } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
    const categories = ['Tất cả', 'Basic', 'Pro', 'Premium'];

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filtered = useMemo(() => {
        let result = products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCat = activeCategory === 'Tất cả' || p.tier === activeCategory;
            return matchSearch && matchCat;
        });
        if (sortOrder === 'asc') result.sort((a, b) => a.price - b.price);
        else if (sortOrder === 'desc') result.sort((a, b) => b.price - a.price);
        return result;
    }, [products, searchQuery, activeCategory, sortOrder]);

    // Calculate number of columns based on screen width
    const screenWidth = Dimensions.get('window').width;
    const numCols = screenWidth > 900 ? 3 : screenWidth > 600 ? 2 : 2;

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Top nav bar */}
            <View style={styles.navbar}>
                <View style={styles.logoRow}>
                    <Ionicons name="diamond" size={20} color="#5EEAD4" />
                    <Text style={styles.logoText}>EDITION '26</Text>
                </View>
                <View style={styles.navActions}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={16} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm trí tuệ..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    {isAdmin && (
                        <TouchableOpacity
                            style={styles.cartBtn}
                            onPress={() => navigation.navigate('AdminProductList' as any, {})}
                        >
                            <Ionicons name="settings-outline" size={18} color="#000" />
                            <Text style={styles.cartBtnText}>QUẢN LÝ</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Hero section - Editorial Edition style */}
            <View style={styles.heroSection}>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>FOUNDATIONS</Text>
                </View>
                <Text style={styles.heroLine1}>Nâng tầm</Text>
                <Text style={styles.heroLine2}>Trí Tuệ Mới.</Text>
                <Text style={styles.heroSub}>
                    Những công cụ AI định hình lại bức tranh sáng tạo và năng suất{'\n'}trong kỷ nguyên số tiếp theo.
                </Text>
                <View style={styles.heroDecorator} />
            </View>

            {/* Sorting & Category Row */}
            <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.tab, activeCategory === cat && styles.tabActive]}
                            onPress={() => setActiveCategory(cat)}
                        >
                            <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
                                {cat.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.sortContainer}>
                    <TouchableOpacity
                        style={[styles.sortBtn, sortOrder === 'asc' && styles.sortBtnActive]}
                        onPress={() => setSortOrder(sortOrder === 'asc' ? 'none' : 'asc')}
                    >
                        <Ionicons name="arrow-up" size={14} color={sortOrder === 'asc' ? '#5EEAD4' : '#94A3B8'} />
                        <Text style={[styles.sortBtnText, sortOrder === 'asc' && styles.sortBtnTextActive]}>GIÁ ↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortBtn, sortOrder === 'desc' && styles.sortBtnActive]}
                        onPress={() => setSortOrder(sortOrder === 'desc' ? 'none' : 'desc')}
                    >
                        <Ionicons name="arrow-down" size={14} color={sortOrder === 'desc' ? '#5EEAD4' : '#94A3B8'} />
                        <Text style={[styles.sortBtnText, sortOrder === 'desc' && styles.sortBtnTextActive]}>GIÁ ↓</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyText}>Thử thay đổi từ khóa hoặc bộ lọc của bạn.</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                key={`grid-${numCols}`}
                data={filtered}
                keyExtractor={item => item.id.toString()}
                numColumns={numCols}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                renderItem={({ item }) => (
                    <View style={[styles.cardWrapper, { width: `${100 / numCols}%` }]}>
                        <ProductCard
                            product={item}
                            onPress={() => navigation.navigate('ProductDetail' as any, { product: item })}
                        />
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                onRefresh={fetchProducts}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    listContent: {
        paddingBottom: 80,
    },

    // Navbar
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1.5,
    },
    navActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        justifyContent: 'flex-end',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 100,
        paddingHorizontal: 16,
        height: 40,
        flex: 1,
        maxWidth: 320,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: '#FFFFFF',
    },
    cartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#5EEAD4',
        borderRadius: 100,
        paddingHorizontal: 18,
        paddingVertical: 10,
        gap: 6,
    },
    cartBtnText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },

    // Header
    header: {
        backgroundColor: '#000000',
    },
    heroSection: {
        paddingHorizontal: 36,
        paddingTop: 80,
        paddingBottom: 60,
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
    },
    heroBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        alignSelf: 'flex-start',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroBadgeText: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
    },
    heroLine1: {
        fontSize: 64,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -2,
        lineHeight: 64,
    },
    heroLine2: {
        fontSize: 64,
        fontWeight: '900',
        color: '#5EEAD4',
        letterSpacing: -4,
        lineHeight: 64,
        marginBottom: 24,
    },
    heroSub: {
        fontSize: 18,
        color: '#94A3B8',
        lineHeight: 28,
        maxWidth: 500,
        zIndex: 2,
        fontWeight: '500',
    },
    heroDecorator: {
        position: 'absolute',
        right: -100,
        top: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#1E293B',
        opacity: 0.2,
        zIndex: 1,
    },

    // Category tabs
    filterBar: {
        flexDirection: 'column',
        paddingHorizontal: 36,
        paddingTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        marginBottom: 12,
    },
    tabsRow: {
        flexDirection: 'row',
        gap: 24,
        paddingBottom: 0,
    },
    tab: {
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#5EEAD4',
    },
    tabText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
        letterSpacing: 1.5,
    },
    tabTextActive: {
        color: '#FFFFFF',
    },

    // Sorting
    sortContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        paddingBottom: 20,
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 100,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6,
    },
    sortBtnActive: {
        borderColor: '#5EEAD4',
        backgroundColor: 'rgba(94, 234, 212, 0.05)',
    },
    sortBtnText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '800',
        letterSpacing: 1,
    },
    sortBtnTextActive: {
        color: '#5EEAD4',
    },

    // Grid
    cardWrapper: {
        padding: 16,
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
    },
});
