import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    Image, ScrollView, Dimensions, Platform, Animated, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShopifyTheme } from '../theme/ShopifyTheme';

const { width, height } = Dimensions.get('window');

const CHAPTERS = [
    { id: 'I', title: 'SIDEKICK' },
    { id: 'II', title: 'AGENTIC' },
    { id: 'III', title: 'FOUNDATIONS' },
    { id: 'IV', title: 'LOGISTICS' },
    { id: 'V', title: 'CHECKOUT' },
];

export const LandingScreen: React.FC = () => {
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, []);

    const goToStore = () => (navigation as any).navigate('CustomerTabs');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* ── HERO SECTION ── */}
                <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
                    <View style={styles.editionBadge}>
                        <Text style={styles.editionText}>THE RENAISSANCE EDITION · WINTER 2026</Text>
                    </View>

                    <Text style={styles.megaTitle}>Kỷ Nguyên</Text>
                    <Text style={styles.megaTitleAccent}>Phục Hưng.</Text>

                    <Text style={styles.subTitleText}>
                        Hơn 100 nâng cấp AI mang tính nền tảng, xóa nhòa ranh giới giữa{'\n'}
                        nghệ thuật cổ điển và công nghệ tương lai.
                    </Text>

                    <TouchableOpacity style={styles.exploreBtn} onPress={goToStore}>
                        <Text style={styles.exploreBtnText}>TRẢI NGHIỆM NGAY</Text>
                        <Ionicons name="chevron-forward" size={18} color="#000" />
                    </TouchableOpacity>
                </Animated.View>

                {/* ── CHAPTER GRID ── */}
                <View style={styles.chapterSection}>
                    <Text style={styles.sectionLabel}>MỤC LỤC ẤN BẢN</Text>
                    <View style={styles.chapterGrid}>
                        {CHAPTERS.map((ch) => (
                            <TouchableOpacity key={ch.id} style={styles.chapterItem} onPress={goToStore}>
                                <Text style={styles.chapterRoman}>{ch.id}</Text>
                                <Text style={styles.chapterTitle}>{ch.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── IMMERSIVE IMAGE ── */}
                <View style={styles.immersiveSection}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1619410283995-43d9134e7656?auto=format&fit=crop&q=80&w=1200' }}
                        style={styles.immersiveImg}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.85)', '#000']}
                        style={styles.immersiveOverlay}
                    >
                        <Text style={styles.captionTag}>VISION</Text>
                        <Text style={styles.captionTitle}>Nghệ thuật trong từng dòng code.</Text>
                    </LinearGradient>
                </View>

                {/* ── FEATURE CARD ── */}
                <View style={styles.featureBlock}>
                    <LinearGradient colors={['#111827', '#0F172A']} style={styles.glassCard}>
                        <Text style={styles.cardTag}>IV · LOGISTICS</Text>
                        <Text style={styles.cardMainTitle}>Quản Trị Vô Hình</Text>
                        <Text style={styles.cardDesc}>
                            Hệ thống tự động hóa bằng AI giúp bạn vận hành doanh nghiệp toàn cầu mà không cần chạm tay.
                        </Text>
                        <TouchableOpacity style={styles.textLink} onPress={goToStore}>
                            <Text style={styles.textLinkContent}>Khám phá cửa hàng →</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* ── STATS ROW ── */}
                <View style={styles.statsSection}>
                    {[
                        { num: '100+', label: 'Công cụ AI' },
                        { num: '24/7', label: 'Hỗ trợ' },
                        { num: '99.9%', label: 'Uptime' },
                    ].map((s, i) => (
                        <View key={i} style={styles.statItem}>
                            <Text style={styles.statNum}>{s.num}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── FOOTER ── */}
                <View style={styles.footerSection}>
                    <Text style={styles.footerBrand}>MINIMALIST PRIME</Text>
                    <Text style={styles.footerLegal}>© 2026 THIẾT KẾ BỞI TƯƠNG LAI.</Text>
                    <View style={styles.socialRow}>
                        <Ionicons name="logo-twitter" size={20} color="rgba(255,255,255,0.2)" />
                        <Ionicons name="logo-instagram" size={20} color="rgba(255,255,255,0.2)" />
                        <Ionicons name="logo-linkedin" size={20} color="rgba(255,255,255,0.2)" />
                    </View>
                </View>
            </Animated.ScrollView>

            {/* ── FIXED NAV ── */}
            <View style={styles.fixedNav}>
                <Ionicons name="diamond" size={20} color={ShopifyTheme.colors.accent} />
                <Text style={styles.navLogo}>EDITION '26</Text>
                <TouchableOpacity style={styles.navCta} onPress={goToStore}>
                    <Text style={styles.navCtaText}>BẮT ĐẦU</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { paddingBottom: 40 },

    // Fixed top nav
    fixedNav: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 72,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 32,
        backgroundColor: 'rgba(0,0,0,0.88)',
        zIndex: 1000,
    },
    navLogo: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
    navCta: {
        backgroundColor: ShopifyTheme.colors.accent,
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100,
    },
    navCtaText: { color: '#000', fontSize: 11, fontWeight: '900' },

    // Hero
    heroSection: {
        minHeight: height * 0.88,
        justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 32, paddingTop: 96,
    },
    editionBadge: {
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 100, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 48,
    },
    editionText: { color: ShopifyTheme.colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
    megaTitle: {
        color: '#FFF',
        fontSize: Platform.OS === 'web' ? 88 : 56,
        fontWeight: '900', textAlign: 'center', letterSpacing: -2,
    },
    megaTitleAccent: {
        color: ShopifyTheme.colors.accent,
        fontSize: Platform.OS === 'web' ? 88 : 56,
        fontWeight: '900', textAlign: 'center', letterSpacing: -4,
    },
    subTitleText: {
        color: ShopifyTheme.colors.textMuted, fontSize: 18,
        textAlign: 'center', lineHeight: 30, fontWeight: '500',
        marginTop: 32, maxWidth: 600,
    },
    exploreBtn: {
        backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 40, paddingVertical: 22, borderRadius: 100,
        marginTop: 60, gap: 12,
    },
    exploreBtnText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },

    // Chapter Grid
    chapterSection: { paddingHorizontal: 32, marginVertical: 100 },
    sectionLabel: { color: ShopifyTheme.colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 40 },
    chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 40 },
    chapterItem: { width: '40%', gap: 12 },
    chapterRoman: { color: ShopifyTheme.colors.accent, fontSize: 20, fontWeight: '900' },
    chapterTitle: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

    // Immersive
    immersiveSection: { width: '100%', height: height * 0.75, position: 'relative' },
    immersiveImg: { width: '100%', height: '100%' },
    immersiveOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '55%', justifyContent: 'flex-end', padding: 48,
    },
    captionTag: { color: ShopifyTheme.colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
    captionTitle: { color: '#FFF', fontSize: 40, fontWeight: '900', letterSpacing: -1 },

    // Feature card
    featureBlock: { paddingHorizontal: 32, marginTop: 80 },
    glassCard: {
        borderRadius: 40, padding: 56,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', minHeight: 360,
    },
    cardTag: { color: ShopifyTheme.colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
    cardMainTitle: { color: '#FFF', fontSize: 40, fontWeight: '900', letterSpacing: -1, marginBottom: 20 },
    cardDesc: { color: ShopifyTheme.colors.textMuted, fontSize: 18, lineHeight: 28, marginBottom: 40, maxWidth: 500 },
    textLink: { borderBottomWidth: 1, borderBottomColor: '#FFF', alignSelf: 'flex-start', paddingBottom: 4 },
    textLinkContent: { color: '#FFF', fontWeight: '800', fontSize: 14 },

    // Stats
    statsSection: {
        flexDirection: 'row', paddingHorizontal: 32, marginTop: 100,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 60,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { color: '#FFF', fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    statLabel: { color: ShopifyTheme.colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 8 },

    // Footer
    footerSection: { marginTop: 100, alignItems: 'center', paddingBottom: 80 },
    footerBrand: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 8, marginBottom: 16 },
    footerLegal: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 40 },
    socialRow: { flexDirection: 'row', gap: 32 },
});
