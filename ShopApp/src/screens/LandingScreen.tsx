import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    Image, ScrollView, Dimensions, Platform, Animated, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const LandingScreen: React.FC = () => {
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
        }).start();
    }, []);

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Grain/Noise simulation */}
            <View style={styles.noiseBg} />

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
            >
                {/* Hero Section - Shopify Edition Style */}
                <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
                    <View style={styles.editionBadge}>
                        <Text style={styles.editionText}>MINIMALIST EDITION · WINTER 2026</Text>
                    </View>

                    <Text style={styles.megaTitle}>Thương Mại</Text>
                    <Text style={styles.megaTitleAccent}>Được Tái Định Nghĩa.</Text>

                    <View style={styles.heroSubRow}>
                        <Text style={styles.subTitleText}>
                            Khám phá hơn 100 nâng cấp AI mang tính nền tảng, được thiết kế để xóa nhòa ranh giới giữa ý tưởng và hiện thực.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.exploreBtn}
                        onPress={() => (navigation as any).navigate('CustomerTabs')}
                    >
                        <Text style={styles.exploreBtnText}>TRẢI NGHIỆM NGAY</Text>
                        <Ionicons name="chevron-forward" size={18} color="#000" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Big Feature Block */}
                <View style={styles.featureBlock}>
                    <LinearGradient
                        colors={['#111827', '#0F172A']}
                        style={styles.glassCard}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTag}>AI INTEGRATION</Text>
                            <Text style={styles.cardMainTitle}>Trí Tuệ Cốt Lõi</Text>
                        </View>
                        <Text style={styles.cardDesc}>
                            Tận dụng sức mạnh của những mô hình ngôn ngữ lớn nhất hành tinh để tự động hóa mọi quy trình bán hàng của bạn.
                        </Text>
                        <View style={styles.imagePlaceholder}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1620712943543-bcc462272304?auto=format&fit=crop&q=80&w=800' }}
                                style={styles.featureImg}
                            />
                        </View>
                    </LinearGradient>
                </View>

                {/* Editorial Grid */}
                <View style={styles.editorialGrid}>
                    <View style={styles.gridLeft}>
                        <Text style={styles.gridHeading}>Hiệu Năng.{'\n'}Vượt Trội.</Text>
                        <Text style={styles.gridSub}>Tốc độ phản hồi dưới 100ms cho mọi yêu cầu phức tạp.</Text>
                    </View>
                    <View style={styles.gridRight}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNum}>100+</Text>
                            <Text style={styles.statLabel}>Công cụ AI</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNum}>24/7</Text>
                            <Text style={styles.statLabel}>Hỗ trợ tối ưu</Text>
                        </View>
                    </View>
                </View>

                {/* Footer Style */}
                <View style={styles.footerSection}>
                    <Text style={styles.footerBrand}>MINIMALIST PRIME</Text>
                    <Text style={styles.footerLegal}>© 2026 KIẾN TRÚC BỞI TƯƠNG LAI.</Text>
                </View>
            </Animated.ScrollView>

            {/* Floating Header */}
            <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
                <View style={styles.navRow}>
                    <Ionicons name="diamond" size={20} color="#5EEAD4" />
                    <Text style={styles.navLogo}>EDITION '26</Text>
                    <TouchableOpacity
                        style={styles.navCta}
                        onPress={() => (navigation as any).navigate('CustomerTabs')}
                    >
                        <Text style={styles.navCtaText}>BẮT ĐẦU</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    noiseBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        opacity: 0.9,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    heroSection: {
        minHeight: height * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 100,
    },
    editionBadge: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 100,
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginBottom: 40,
    },
    editionText: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
    },
    megaTitle: {
        color: '#FFFFFF',
        fontSize: Platform.OS === 'web' ? 88 : 56,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: -2,
    },
    megaTitleAccent: {
        color: '#5EEAD4',
        fontSize: Platform.OS === 'web' ? 88 : 56,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: -4,
        marginTop: Platform.OS === 'web' ? -10 : 0,
    },
    heroSubRow: {
        marginTop: 40,
        maxWidth: 600,
    },
    subTitleText: {
        color: '#94A3B8',
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 28,
        fontWeight: '500',
    },
    exploreBtn: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 20,
        borderRadius: 100,
        marginTop: 60,
        gap: 12,
    },
    exploreBtnText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1,
    },
    featureBlock: {
        paddingHorizontal: 24,
        marginTop: 40,
    },
    glassCard: {
        borderRadius: 32,
        padding: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        minHeight: 500,
    },
    cardHeader: {
        marginBottom: 24,
    },
    cardTag: {
        color: '#5EEAD4',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 12,
    },
    cardMainTitle: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
    },
    cardDesc: {
        color: '#94A3B8',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 40,
        maxWidth: 400,
    },
    imagePlaceholder: {
        width: '100%',
        height: 300,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1E293B',
    },
    featureImg: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    editorialGrid: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        paddingHorizontal: 32,
        marginTop: 100,
        gap: 40,
    },
    gridLeft: {
        flex: 1,
    },
    gridHeading: {
        color: '#FFF',
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -2,
    },
    gridSub: {
        color: '#64748B',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 20,
    },
    gridRight: {
        flex: 1,
        flexDirection: 'row',
        gap: 20,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 24,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statNum: {
        color: '#5EEAD4',
        fontSize: 32,
        fontWeight: '900',
    },
    statLabel: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 8,
    },
    footerSection: {
        marginTop: 120,
        alignItems: 'center',
        paddingBottom: 60,
    },
    footerBrand: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 4,
        marginBottom: 12,
    },
    footerLegal: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
    },
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        height: 80,
        justifyContent: 'center',
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        zIndex: 100,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    navLogo: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 2,
    },
    navCta: {
        backgroundColor: '#5EEAD4',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
    },
    navCtaText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '800',
    },
});
