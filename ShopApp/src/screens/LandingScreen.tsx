import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    ScrollView, Dimensions, Platform, Animated, StatusBar,
    PanResponder, ImageBackground, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShopifyTheme } from '../theme/ShopifyTheme';
import { useVideoPlayer, VideoView } from 'expo-video';
import { BlurView } from 'expo-blur';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const YT_HERO_ID = "LU4tghjdnG8";      // Shopify Sidekick (Renaissance vibe)
const YT_LOGISTICS_ID = "rddSHVroIcc"; // Shopify Logistics
const YT_FOUNDATION_ID = "gR_KGbyOBBM"; // Updated Foundations video

const getYoutubeEmbed = (id: string) => `
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#000; overflow:hidden; width:100vw; height:100vh; }
  .container { position:relative; width:100%; height:100%; overflow:hidden; }
  iframe { 
    position:absolute; top:50%; left:50%; 
    width:170%; height:170%; /* Scale up to hide logo/title */
    transform: translate(-50%, -50%); 
    border:none; pointer-events:none; 
  }
</style></head>
<body><div class="container">
  <iframe src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1" allow="autoplay; encrypted-media"></iframe>
</div></body></html>`;

const YouTubeBG: React.FC<{ videoId: string; opacity?: number }> = ({ videoId, opacity = 1 }) => {
    if (Platform.OS === 'web') {
        return (
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', opacity }]}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1`}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '170%',
                        height: '170%',
                        transform: 'translate(-50%, -50%)',
                        border: 'none',
                        pointerEvents: 'none',
                    }}
                    allow="autoplay; encrypted-media"
                />
            </View>
        );
    }
    return (
        <View style={[StyleSheet.absoluteFill, { opacity }]}>
            <WebView
                source={{ html: getYoutubeEmbed(videoId) }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                scrollEnabled={false}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
            />
        </View>
    );
};

const CHAPTERS = [
    { id: 'I', title: 'SIDEKICK', color: '#5EEAD4', desc: 'AI đồng hành thông minh cho mọi workflow.' },
    { id: 'II', title: 'AGENTIC', color: '#A78BFA', desc: 'Tự động hóa tác vụ phức tạp, không cần giám sát.' },
    { id: 'III', title: 'FOUNDATIONS', color: '#F472B6', desc: 'Nền tảng SDK mạnh mẽ và linh hoạt.' },
    { id: 'IV', title: 'LOGISTICS', color: '#60A5FA', desc: 'Vận hành chuỗi cung ứng theo thời gian thực.' },
];

const FEATURES = [
    { icon: 'flash-outline', num: '120+', label: 'AGENTIC APPS', color: '#5EEAD4' },
    { icon: 'timer-outline', num: '4.0ms', label: 'LATENCY CORE', color: '#A78BFA' },
    { icon: 'infinite-outline', num: '∞', label: 'SCALE POTENTIAL', color: '#F472B6' },
    { icon: 'shield-checkmark-outline', num: '99.9%', label: 'UPTIME SLA', color: '#60A5FA' },
];

// ── Stitch grid overlay ──────────────────────────────────────
const StitchPattern = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {[0, 25, 50, 75, 100].map(l => (
            <View key={`v${l}`} style={[styles.stitchV, { left: `${l}%` as any }]} />
        ))}
        {[0, 20, 40, 60, 80, 100].map(t => (
            <View key={`h${t}`} style={[styles.stitchH, { top: `${t}%` as any }]} />
        ))}
    </View>
);

// ── Parallax background with mouse/touch tilt ────────────────
const ParallaxHero: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const tiltX = useRef(new Animated.Value(0)).current;
    const tiltY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: () => false,
            onPanResponderGrant: () => {
                Animated.spring(scale, { toValue: 1.04, useNativeDriver: true, friction: 8 }).start();
            },
            onPanResponderMove: (_, gs) => {
                const tx = (gs.moveX / width - 0.5) * 28;
                const ty = (gs.moveY / height - 0.5) * 16;
                Animated.spring(tiltX, { toValue: tx, useNativeDriver: true, friction: 12 }).start();
                Animated.spring(tiltY, { toValue: ty, useNativeDriver: true, friction: 12 }).start();
            },
            onPanResponderRelease: () => {
                Animated.parallel([
                    Animated.spring(tiltX, { toValue: 0, useNativeDriver: true, friction: 10 }),
                    Animated.spring(tiltY, { toValue: 0, useNativeDriver: true, friction: 10 }),
                    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 10 }),
                ]).start();
            },
        })
    ).current;

    return (
        <View style={styles.heroSection} {...panResponder.panHandlers}>
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [
                            { translateX: tiltX },
                            { translateY: tiltY },
                            { scale },
                        ],
                    },
                ]}
            >
                <Image
                    source={require('../public/img/background.png')}
                    style={styles.bgImage}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)', '#000']}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
            <StitchPattern />
            {children}
        </View>
    );
};

// ── Scroll-reveal wrapper ─────────────────────────────────────
const FadeInView: React.FC<{
    children: React.ReactNode;
    scrollY: Animated.Value;
    triggerAt: number;
    style?: any;
    direction?: 'up' | 'left' | 'right';
}> = ({ children, scrollY, triggerAt, style, direction = 'up' }) => {
    const opacity = scrollY.interpolate({
        inputRange: [triggerAt - 60, triggerAt + 80],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });
    const translate = scrollY.interpolate({
        inputRange: [triggerAt - 60, triggerAt + 80],
        outputRange: [direction === 'up' ? 50 : direction === 'left' ? -60 : 60, 0],
        extrapolate: 'clamp',
    });
    const transform =
        direction === 'up'
            ? [{ translateY: translate }]
            : [{ translateX: translate }];

    return (
        <Animated.View style={[{ opacity, transform }, style]}>
            {children}
        </Animated.View>
    );
};

// ── Chapter card with hover/press 3-D tilt ────────────────────
const ChapterCard: React.FC<{ ch: typeof CHAPTERS[0]; onPress: () => void }> = ({ ch, onPress }) => {
    const tilt = useRef(new Animated.Value(0)).current;
    const scaleA = useRef(new Animated.Value(1)).current;
    const glowA = useRef(new Animated.Value(0)).current;

    const onIn = () =>
        Animated.parallel([
            Animated.spring(scaleA, { toValue: 1.06, useNativeDriver: true, friction: 7 }),
            Animated.spring(tilt, { toValue: 8, useNativeDriver: true, friction: 7 }),
            Animated.timing(glowA, { toValue: 1, duration: 200, useNativeDriver: false }),
        ]).start();

    const onOut = () =>
        Animated.parallel([
            Animated.spring(scaleA, { toValue: 1, useNativeDriver: true, friction: 7 }),
            Animated.spring(tilt, { toValue: 0, useNativeDriver: true, friction: 7 }),
            Animated.timing(glowA, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]).start();

    const shadowColor = glowA.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', ch.color],
    });

    return (
        <TouchableOpacity
            style={styles.chapterItem}
            onPress={onPress}
            onPressIn={onIn}
            onPressOut={onOut}
            activeOpacity={1}
        >
            <Animated.View
                style={[
                    styles.chapterCard3D,
                    {
                        transform: [{ scale: scaleA }, { rotate: tilt.interpolate({ inputRange: [-8, 0, 8], outputRange: ['-2deg', '0deg', '2deg'] }) }],
                        shadowColor,
                        shadowOpacity: glowA,
                        shadowRadius: 24,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 12,
                    },
                ]}
            >
                <BlurView intensity={24} tint="dark" style={styles.chapterGlass}>
                    <Animated.View style={[styles.chapterGlowBorder, { borderColor: glowA.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,0.06)', ch.color + '55'] }) }]} />
                    <Text style={[styles.chapterRoman, { color: ch.color }]}>{ch.id}</Text>
                    <Text style={styles.chapterTitle}>{ch.title}</Text>
                    <Text style={styles.chapterDesc}>{ch.desc}</Text>
                    <View style={[styles.chapterDot, { backgroundColor: ch.color }]} />
                </BlurView>
            </Animated.View>
        </TouchableOpacity>
    );
};

// ── Stat counter card ─────────────────────────────────────────
const StatCard: React.FC<{ item: typeof FEATURES[0]; scrollY: Animated.Value; idx: number }> = ({ item, scrollY, idx }) => {
    const TRIGGER = height * 2.8 + idx * 60;
    const scale = scrollY.interpolate({ inputRange: [TRIGGER - 40, TRIGGER + 100], outputRange: [0.7, 1], extrapolate: 'clamp' });
    const opacity = scrollY.interpolate({ inputRange: [TRIGGER - 40, TRIGGER + 100], outputRange: [0, 1], extrapolate: 'clamp' });
    return (
        <Animated.View style={[styles.statCard, { transform: [{ scale }], opacity }]}>
            <View style={[styles.statIconRing, { borderColor: item.color + '55' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={[styles.statNum, { color: item.color }]}>{item.num}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
        </Animated.View>
    );
};

// ── Horizontal marquee ticker ─────────────────────────────────
const TICKER_ITEMS = ['AGENTIC AI', 'RENAISSANCE EDITION', 'WINTER 2026', 'POWERED BY MINIMALIST AI', 'NEXT GEN LOGISTICS', 'FOUNDATION SDK', 'SIDEKICK MODE'];

const Ticker: React.FC = () => {
    const tx = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(tx, { toValue: -width * 2, duration: 18000, useNativeDriver: true })
        ).start();
    }, []);
    return (
        <View style={styles.ticker} pointerEvents="none">
            <View style={styles.tickerLine} />
            <Animated.View style={[styles.tickerRow, { transform: [{ translateX: tx }] }]}>
                {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                    <React.Fragment key={i}>
                        <Text style={styles.tickerText}>{t}</Text>
                        <View style={styles.tickerDiamond} />
                    </React.Fragment>
                ))}
            </Animated.View>
            <View style={styles.tickerLine} />
        </View>
    );
};

// ── Main export ───────────────────────────────────────────────
export const LandingScreen: React.FC = () => {
    const navigation = useNavigation();
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [ytY, setYtY] = useState(0);

    const goToStore = () => (navigation as any).navigate('CustomerTabs');

    const scrollToVideo = () => {
        scrollViewRef.current?.scrollTo({ y: ytY, animated: true });
    };

    // Parallax for various sections
    const heroParallax = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, height * 0.4], extrapolate: 'clamp' });
    const navOpacity = scrollY.interpolate({ inputRange: [0, 120], outputRange: [0, 1], extrapolate: 'clamp' });
    const badgeOpacity = scrollY.interpolate({ inputRange: [0, 200], outputRange: [1, 0], extrapolate: 'clamp' });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <Animated.ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            >
                {/* ── HERO: background.png with parallax mouse tilt ── */}
                <ParallaxHero>
                    <Animated.View
                        style={[styles.heroContent, { transform: [{ translateY: heroParallax }] }]}
                    >
                        <Animated.View style={[styles.editionBadge, { opacity: badgeOpacity }]}>
                            <View style={styles.badgeDot} />
                            <Text style={styles.editionText}>THE RENAISSANCE EDITION · WINTER 2026</Text>
                        </Animated.View>

                        <Text style={styles.megaTitle}>Kỷ Nguyên</Text>
                        <Text style={styles.megaTitleAccent}>Phục Hưng.</Text>

                        <Text style={styles.subTitleText}>
                            Sẵn sàng cho làn sóng Agentic AI. Trải nghiệm bước nhảy vọt trong{'\n'}
                            tự động hóa và quản trị hệ thống tương lai.
                        </Text>

                        <View style={styles.heroCtas}>
                            <TouchableOpacity style={styles.exploreBtn} onPress={goToStore}>
                                <Text style={styles.exploreBtnText}>KHÁM PHÁ NGAY</Text>
                                <View style={styles.btnIconBox}>
                                    <Ionicons name="arrow-forward" size={18} color="#000" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.ghostBtn} onPress={scrollToVideo}>
                                <Text style={styles.ghostBtnText}>XEM VIDEO</Text>
                                <Ionicons name="play-circle-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Scroll hint */}
                    <View style={styles.scrollHint}>
                        <Animated.View style={{ opacity: badgeOpacity }}>
                            <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.3)" />
                        </Animated.View>
                    </View>
                </ParallaxHero>

                {/* ── TICKER ── */}
                <Ticker />

                {/* ── YOUTUBE VIDEO FEATURE ── */}
                <View
                    style={styles.ytSection}
                    onLayout={(e) => setYtY(e.nativeEvent.layout.y)}
                >
                    <FadeInView scrollY={scrollY} triggerAt={height * 0.7} direction="up">
                        <View style={styles.sectionHeaderCenter}>
                            <View style={styles.line} />
                            <Text style={styles.sectionLabel}>ĐÀO TẠO & TRÌNH DIỄN</Text>
                            <View style={styles.line} />
                        </View>
                        <Text style={styles.ytHeadline}>Xem Tương Lai{'\n'}Trong Hành Động.</Text>
                    </FadeInView>

                    <FadeInView scrollY={scrollY} triggerAt={height * 0.9} direction="up" style={styles.ytWrapper}>
                        <View style={styles.ytFrame}>
                            <YouTubeBG videoId={YT_HERO_ID} />
                            <LinearGradient
                                colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)']}
                                style={StyleSheet.absoluteFill}
                                pointerEvents="none"
                            />
                        </View>
                        <View style={styles.ytCaption}>
                            <View style={[styles.ytDot, { backgroundColor: '#F472B6' }]} />
                            <Text style={styles.ytCaptionText}>WINTER 2026 KEYNOTE · MINIMALIST AI</Text>
                        </View>
                    </FadeInView>
                </View>

                {/* ── CHAPTER GRID ── */}
                <View style={styles.chapterSection}>
                    <FadeInView scrollY={scrollY} triggerAt={height * 1.5}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.line} />
                            <Text style={styles.sectionLabel}>BẢN ĐỒ ẤN BẢN</Text>
                        </View>
                        <Text style={styles.sectionBigTitle}>Bốn Chương.{'\n'}Một Hệ Sinh Thái.</Text>
                    </FadeInView>

                    <View style={styles.chapterGrid}>
                        {CHAPTERS.map((ch, i) => (
                            <FadeInView
                                key={ch.id}
                                scrollY={scrollY}
                                triggerAt={height * 1.65 + i * 80}
                                direction={i % 2 === 0 ? 'left' : 'right'}
                                style={{ width: '47.5%' }}
                            >
                                <ChapterCard ch={ch} onPress={goToStore} />
                            </FadeInView>
                        ))}
                    </View>
                </View>

                {/* ── LOGISTICS IMMERSIVE ── */}
                <View style={styles.immersiveBlock}>
                    <YouTubeBG videoId={YT_LOGISTICS_ID} />
                    <LinearGradient
                        colors={['#000', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.7)', '#000']}
                        style={StyleSheet.absoluteFill}
                    />
                    <StitchPattern />

                    <FadeInView scrollY={scrollY} triggerAt={height * 2.1} style={styles.immersiveContent}>
                        <Text style={styles.captionTag}>IV · LOGISTICS</Text>
                        <Text style={styles.captionTitle}>Vận Hành{'\n'}Vô Hình.</Text>
                        <Text style={styles.captionDesc}>
                            Hệ thống AI xử lý hàng triệu giao dịch mỗi giây,{'\n'}
                            xóa nhòa khoảng cách giữa kho hàng và người dùng cuối.
                        </Text>
                        <TouchableOpacity style={styles.glassBtn} onPress={goToStore}>
                            <Text style={styles.glassBtnText}>XEM CÔNG NGHỆ →</Text>
                        </TouchableOpacity>
                    </FadeInView>
                </View>

                {/* ── FOUNDATION CARD ── */}
                <View style={styles.featureBlock}>
                    <FadeInView scrollY={scrollY} triggerAt={height * 2.5} direction="up">
                        <LinearGradient colors={['#111827', '#050A14']} style={styles.foundationCard}>
                            <YouTubeBG videoId={YT_FOUNDATION_ID} opacity={0.3} />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.9)']}
                                style={[StyleSheet.absoluteFill, { borderRadius: 40 }]}
                            />
                            {/* Decorative corner lines */}
                            <View style={styles.cornerTL} />
                            <View style={styles.cornerBR} />
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardTag}>III · FOUNDATIONS</Text>
                                <Text style={styles.cardMainTitle}>Cơ Chế{'\n'}Tự Trị.</Text>
                                <Text style={styles.cardDesc}>
                                    Nền tảng được xây dựng trên lõi AI tiên tiến nhất, cho phép ứng dụng{'\n'}
                                    tự học và thích nghi với hành vi người dùng theo thời gian thực.
                                </Text>
                                <TouchableOpacity style={styles.accentLink} onPress={goToStore}>
                                    <Text style={styles.accentLinkText}>Khám phá SDK Cửa hàng</Text>
                                    <Ionicons name="link-outline" size={16} color={ShopifyTheme.colors.accent} />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </FadeInView>
                </View>

                {/* ── HORIZONTAL FEATURE STRIP (bento) ── */}
                <View style={styles.bentoSection}>
                    <FadeInView scrollY={scrollY} triggerAt={height * 2.9}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.line} />
                            <Text style={styles.sectionLabel}>HỆ SINH THÁI · METRICS</Text>
                        </View>
                    </FadeInView>
                    <View style={styles.statGrid}>
                        {FEATURES.map((f, i) => (
                            <StatCard key={f.label} item={f} scrollY={scrollY} idx={i} />
                        ))}
                    </View>
                </View>

                {/* ── SECOND IMMERSIVE: background.png tilt again ── */}
                <ParallaxHero>
                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                        style={StyleSheet.absoluteFill}
                    />
                    <FadeInView scrollY={scrollY} triggerAt={height * 3.2} style={styles.ctaContent}>
                        <Text style={styles.ctaLabel}>SẴN SÀNG CHO KỶ NGUYÊN MỚI?</Text>
                        <Text style={styles.ctaTitle}>Bắt Đầu{'\n'}Hành Trình.</Text>
                        <Text style={styles.ctaDesc}>
                            Tham gia cùng hàng nghìn nhà phát triển đang xây dựng{'\n'}
                            tương lai của thương mại thông minh.
                        </Text>
                        <TouchableOpacity style={styles.bigCta} onPress={goToStore}>
                            <Text style={styles.bigCtaText}>MỞ CỬA HÀNG</Text>
                            <Ionicons name="storefront-outline" size={20} color="#000" />
                        </TouchableOpacity>
                    </FadeInView>
                </ParallaxHero>

                {/* ── FOOTER ── */}
                <View style={styles.footerSection}>
                    <View style={styles.footerDivider} />
                    <View style={styles.footerInner}>
                        <View style={styles.footerTop}>
                            <View style={styles.logoBox}>
                                <Ionicons name="diamond-outline" size={28} color={ShopifyTheme.colors.accent} />
                                <Text style={styles.footerBrand}>MINIMALIST AI</Text>
                            </View>
                            <View style={styles.footerLinks}>
                                {['SDK', 'DOCS', 'BLOG', 'CAREERS'].map(l => (
                                    <TouchableOpacity key={l} onPress={goToStore}>
                                        <Text style={styles.footerLink}>{l}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <Text style={styles.footerLegal}>STITCHED WITH PRIDE · VERSION '26 · © MINIMALIST AI</Text>
                        <View style={styles.socialRow}>
                            {['logo-twitter', 'logo-github', 'logo-discord'].map((icon) => (
                                <TouchableOpacity key={icon} style={styles.socialIcon}>
                                    <Ionicons name={icon as any} size={20} color="rgba(255,255,255,0.25)" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Animated.ScrollView>

            {/* ── FIXED NAV (fades in on scroll) ── */}
            <Animated.View style={[styles.fixedNavWrap, { opacity: navOpacity }]}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.fixedNavBorder} />
                <View style={styles.navInner}>
                    <View style={styles.logoBox}>
                        <Ionicons name="diamond-outline" size={22} color={ShopifyTheme.colors.accent} />
                        <Text style={styles.navLogo}>EDITION '26</Text>
                    </View>
                    <View style={styles.navLinks}>
                        {['I', 'II', 'III', 'IV'].map(ch => (
                            <TouchableOpacity key={ch} onPress={goToStore}>
                                <Text style={styles.navChapter}>{ch}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.navCta} onPress={goToStore}>
                        <Text style={styles.navCtaText}>BẮT ĐẦU</Text>
                        <Ionicons name="flash-outline" size={13} color="#000" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 0 },
    absVideo: { ...StyleSheet.absoluteFillObject },

    // Stitch
    stitchV: { position: 'absolute', top: 0, bottom: 0, width: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' },
    stitchH: { position: 'absolute', left: 0, right: 0, height: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' },

    // Nav
    fixedNavWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: 82, zIndex: 1000 },
    fixedNavBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
    navInner: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingTop: Platform.OS === 'ios' ? 20 : 4 },
    logoBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    navLogo: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 4 },
    navLinks: { flexDirection: 'row', gap: 28 },
    navChapter: { color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: 12, letterSpacing: 2 },
    navCta: { backgroundColor: ShopifyTheme.colors.accent, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 100, flexDirection: 'row', alignItems: 'center', gap: 8 },
    navCtaText: { color: '#000', fontSize: 11, fontWeight: '900', letterSpacing: 1 },

    // Hero
    heroSection: { height: height * 1.0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    bgImage: { ...StyleSheet.absoluteFillObject, width: '110%', height: '110%', left: '-5%' as any, top: '-5%' as any },
    heroContent: { alignItems: 'center', paddingHorizontal: 40, zIndex: 10 },
    editionBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 100, paddingHorizontal: 22, paddingVertical: 9, marginBottom: 44, backgroundColor: 'rgba(0,0,0,0.4)' },
    badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ShopifyTheme.colors.accent },
    editionText: { color: ShopifyTheme.colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 3 },
    megaTitle: { color: '#FFF', fontSize: Platform.OS === 'web' ? 100 : 68, fontWeight: '900', textAlign: 'center', letterSpacing: -3 },
    megaTitleAccent: { color: ShopifyTheme.colors.accent, fontSize: Platform.OS === 'web' ? 100 : 68, fontWeight: '900', textAlign: 'center', letterSpacing: -5, marginTop: Platform.OS === 'web' ? -24 : -12 },
    subTitleText: { color: 'rgba(255,255,255,0.5)', fontSize: 17, textAlign: 'center', lineHeight: 28, fontWeight: '500', marginTop: 44, maxWidth: 640 },
    heroCtas: { flexDirection: 'row', gap: 20, marginTop: 60, alignItems: 'center' },
    exploreBtn: { backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', paddingLeft: 32, paddingRight: 8, paddingVertical: 8, borderRadius: 100, gap: 20, height: 64 },
    exploreBtnText: { color: '#000', fontWeight: '900', fontSize: 12, letterSpacing: 1.5 },
    btnIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    ghostBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 64, paddingHorizontal: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 100 },
    ghostBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12, letterSpacing: 1 },
    scrollHint: { position: 'absolute', bottom: 36, alignSelf: 'center', zIndex: 10 },

    // Ticker
    ticker: { height: 52, backgroundColor: '#0A0A0A', overflow: 'hidden', justifyContent: 'center' },
    tickerLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', position: 'absolute', left: 0, right: 0 },
    tickerRow: { flexDirection: 'row', alignItems: 'center' },
    tickerText: { color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: '900', letterSpacing: 4, marginHorizontal: 24 },
    tickerDiamond: { width: 4, height: 4, backgroundColor: ShopifyTheme.colors.accent, transform: [{ rotate: '45deg' }] },

    // YouTube Section
    ytSection: { backgroundColor: '#000', paddingVertical: 100, paddingHorizontal: 32 },
    sectionHeaderCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 32 },
    ytHeadline: { color: '#FFF', fontSize: 52, fontWeight: '900', letterSpacing: -2, textAlign: 'center', lineHeight: 52, marginBottom: 60 },
    ytWrapper: { width: '100%' },
    ytFrame: { width: '100%', height: 220, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    ytWebview: { flex: 1, backgroundColor: '#000' },
    ytCaption: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, justifyContent: 'center' },
    ytDot: { width: 8, height: 8, borderRadius: 4 },
    ytCaptionText: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '900', letterSpacing: 3 },

    // Chapter Grid
    chapterSection: { paddingHorizontal: 28, paddingVertical: 100, backgroundColor: '#000' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 },
    line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)', maxWidth: 60 },
    sectionLabel: { color: ShopifyTheme.colors.textMuted ?? 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '900', letterSpacing: 4 },
    sectionBigTitle: { color: '#FFF', fontSize: 44, fontWeight: '900', letterSpacing: -2, lineHeight: 48, marginBottom: 60 },
    chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
    chapterItem: { width: '47.5%', marginBottom: 8 },
    chapterCard3D: { borderRadius: 24 },
    chapterGlass: { borderRadius: 24, padding: 28, minHeight: 200, justifyContent: 'space-between', overflow: 'hidden' },
    chapterGlowBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 24, borderWidth: 1 },
    chapterRoman: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
    chapterTitle: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
    chapterDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 20, fontWeight: '500', flex: 1 },
    chapterDot: { width: 6, height: 6, borderRadius: 3, alignSelf: 'flex-end', marginTop: 12 },

    // Immersive
    immersiveBlock: { height: height * 0.85, position: 'relative', justifyContent: 'center', paddingHorizontal: 40 },
    immersiveContent: { zIndex: 10 },
    captionTag: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 4, marginBottom: 24 },
    captionTitle: { color: '#FFF', fontSize: 60, fontWeight: '900', letterSpacing: -3, lineHeight: 62 },
    captionDesc: { color: 'rgba(255,255,255,0.55)', fontSize: 17, lineHeight: 28, marginTop: 32, fontWeight: '500' },
    glassBtn: { marginTop: 48, borderBottomWidth: 1, borderBottomColor: '#FFF', alignSelf: 'flex-start', paddingBottom: 8 },
    glassBtnText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },

    // Foundation
    featureBlock: { paddingHorizontal: 20, paddingVertical: 100 },
    foundationCard: { borderRadius: 40, padding: 48, minHeight: 520, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', justifyContent: 'flex-end' },
    cornerTL: { position: 'absolute', top: 24, left: 24, width: 32, height: 32, borderTopWidth: 1, borderLeftWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    cornerBR: { position: 'absolute', bottom: 24, right: 24, width: 32, height: 32, borderBottomWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    cardInfo: { zIndex: 10 },
    cardTag: { color: ShopifyTheme.colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 4, marginBottom: 24 },
    cardMainTitle: { color: '#FFF', fontSize: 52, fontWeight: '900', letterSpacing: -2, lineHeight: 54, marginBottom: 24 },
    cardDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 26, marginBottom: 40 },
    accentLink: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    accentLinkText: { color: ShopifyTheme.colors.accent, fontWeight: '900', fontSize: 14, letterSpacing: 1 },

    // Bento stats
    bentoSection: { paddingVertical: 100, paddingHorizontal: 24, backgroundColor: '#000' },
    statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 48 },
    statCard: { width: '47%', backgroundColor: '#0D0D0D', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', minHeight: 160, justifyContent: 'space-between' },
    statIconRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    statNum: { fontSize: 42, fontWeight: '900', letterSpacing: -2 },
    statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '900', letterSpacing: 3, marginTop: 8 },

    // CTA section
    ctaContent: { alignItems: 'center', paddingHorizontal: 40, zIndex: 10 },
    ctaLabel: { color: ShopifyTheme.colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 4, marginBottom: 28 },
    ctaTitle: { color: '#FFF', fontSize: 64, fontWeight: '900', letterSpacing: -3, textAlign: 'center', lineHeight: 64 },
    ctaDesc: { color: 'rgba(255,255,255,0.45)', fontSize: 17, lineHeight: 28, textAlign: 'center', marginTop: 32, marginBottom: 56 },
    bigCta: { backgroundColor: ShopifyTheme.colors.accent, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 40, paddingVertical: 20, borderRadius: 100 },
    bigCtaText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1.5 },

    // Footer
    footerSection: { backgroundColor: '#000', paddingBottom: 60 },
    footerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 60 },
    footerInner: { alignItems: 'center', paddingHorizontal: 32 },
    footerTop: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 },
    footerBrand: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 8 },
    footerLinks: { flexDirection: 'row', gap: 32 },
    footerLink: { color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    footerLegal: { color: 'rgba(255,255,255,0.12)', fontSize: 9, fontWeight: '900', letterSpacing: 3, marginBottom: 40 },
    socialRow: { flexDirection: 'row', gap: 32 },
    socialIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.02)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
});