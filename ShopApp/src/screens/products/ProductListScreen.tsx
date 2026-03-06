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
import { WebView } from 'react-native-webview';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerTabs'>;

const CATEGORIES = ['All Tools', 'Basic', 'Pro', 'Premium'];

// ── Inline HTML cho YouTube background ──────────────────────────────────────
const VIDEO_BG_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:100%; height:100%; overflow:hidden; background:#000; }
  iframe {
    position: absolute;
    top: 50%; left: 50%;
    /* oversized to fill any aspect ratio */
    width: 177.78vh;
    height: 100vh;
    min-width: 100vw;
    min-height: 56.25vw;
    transform: translate(-50%, -50%);
    pointer-events: none;
    border: none;
  }
</style>
</head>
<body>
  <iframe
    src="https://www.youtube.com/embed/aw_k00T4UFk?autoplay=1&mute=1&loop=1&controls=0&disablekb=1&playlist=aw_k00T4UFk&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0"
    allow="autoplay; encrypted-media"
    allowfullscreen
  ></iframe>
</body>
</html>
`;

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

    const screenWidth = Dimensions.get('window').width;
    const numCols = screenWidth > 900 ? 3 : screenWidth > 600 ? 2 : 2;

    const renderHeader = () => (
        <View style={styles.header}>

            {/* ── NAVBAR (không thay đổi) ── */}
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

            {/* ── HERO SECTION với video background ── */}
            <View style={styles.heroSection}>

                {/* Layer 1: YouTube video (bottom) */}
                {Platform.OS === 'web' ? (
                    <iframe
                        style={{
                            position: 'absolute',
                            top: '50%', left: '50%',
                            width: '177.78vh',
                            height: '100vh',
                            minWidth: '100vw',
                            minHeight: '56.25vw',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            border: 'none',
                            zIndex: 0,
                        } as any}
                        src="https://www.youtube.com/embed/aw_k00T4UFk?autoplay=1&mute=1&loop=1&controls=0&disablekb=1&playlist=aw_k00T4UFk&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    />
                ) : (
                    <WebView
                        style={styles.videoBackground}
                        source={{ html: VIDEO_BG_HTML }}
                        scrollEnabled={false}
                        allowsInlineMediaPlayback
                        mediaPlaybackRequiresUserAction={false}
                        javaScriptEnabled
                        originWhitelist={['*']}
                        pointerEvents="none"
                    />
                )}

                {/* Layer 2: dark overlay */}
                <View style={styles.overlay} pointerEvents="none" />

                {/* Layer 3: text content (top) */}
                <View style={styles.heroContent}>
                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>FOUNDATIONS</Text>
                    </View>
                    <Text style={styles.heroLine1}>Nâng tầm</Text>
                    <Text style={styles.heroLine2}>Trí Tuệ Mới.</Text>
                    <Text style={styles.heroSub}>
                        Những công cụ AI định hình lại bức tranh sáng tạo và năng suất{'\n'}trong kỷ nguyên số tiếp theo.
                    </Text>
                </View>

            </View>

            {/* ── FILTER BAR (không thay đổi) ── */}
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

    // ── Navbar ──────────────────────────────────────────
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

    // ── Header wrapper ───────────────────────────────────
    header: {
        backgroundColor: '#000000',
    },

    // ── Hero: position:relative để stack các layer ───────
    heroSection: {
        height: 340,                    // chiều cao cố định cho hero
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',        // fallback khi video chưa load
    },

    // Layer 1 – WebView video (absolute, fill parent)
    videoBackground: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 0,
    },

    // Layer 2 – dark overlay
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        // gradient-like: phía trên sáng hơn một chút, phía dưới tối hơn
        backgroundColor: 'rgba(0, 0, 0, 0.60)',
        zIndex: 1,
    },

    // Layer 3 – text content
    heroContent: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2,
        paddingHorizontal: 36,
        paddingTop: 44,
        paddingBottom: 36,
        justifyContent: 'center',
    },
    heroBadge: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        alignSelf: 'flex-start',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    heroBadgeText: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
    },
    heroLine1: {
        fontSize: 60,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -2,
        lineHeight: 62,
        // text shadow để nổi hơn trên video
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 12,
    },
    heroLine2: {
        fontSize: 60,
        fontWeight: '900',
        color: '#5EEAD4',
        letterSpacing: -4,
        lineHeight: 62,
        marginBottom: 20,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 16,
    },
    heroSub: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.72)',
        lineHeight: 26,
        maxWidth: 460,
        fontWeight: '400',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
    },

    // ── Filter bar ───────────────────────────────────────
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

    // ── Grid ─────────────────────────────────────────────
    cardWrapper: {
        padding: 16,
    },

    // ── Empty ────────────────────────────────────────────
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
