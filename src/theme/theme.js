import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
    // Core palette
    primary: '#7C6EFA',
    primaryDark: '#5A4FD1',
    primaryLight: '#A99FFB',
    primaryGlow: 'rgba(124,110,250,0.18)',

    // Accents
    accent: '#00E5C3',
    accentDim: 'rgba(0,229,195,0.12)',
    rose: '#FF5E8A',
    roseDim: 'rgba(255,94,138,0.12)',
    amber: '#FFB547',
    amberDim: 'rgba(255,181,71,0.12)',
    sky: '#38BDF8',
    skyDim: 'rgba(56,189,248,0.12)',

    // Background layers
    bg: '#080812',
    bgDeep: '#050508',
    surface: '#10101E',
    surfaceHigh: '#16162A',
    card: '#13132280',
    cardSolid: '#131322',
    border: '#252540',
    borderHigh: '#333358',

    // Text
    text: '#F0EFFE',
    textSoft: '#A8A4C8',
    textMuted: '#58567A',
    textInverse: '#080812',

    // Status
    success: '#00E5C3',
    error: '#FF4F6E',
    warning: '#FFB547',
    info: '#38BDF8',

    // Gradient stops (use with LinearGradient)
    gradPrimary: ['#7C6EFA', '#5A4FD1'],
    gradPurpleRose: ['#7C6EFA', '#FF5E8A'],
    gradAccent: ['#00E5C3', '#38BDF8'],
    gradCard: ['#1A1A30', '#10101E'],
    gradDark: ['rgba(8,8,18,0)', 'rgba(8,8,18,0.96)'],
};

export const FONT = {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
};

export const SIZE = {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
    hero: 48,
    pad: 20,
    pad2: 24,
    r: 14,    // radius default
    rLg: 22,    // radius large
    rSm: 8,     // radius small
    rXl: 32,    // radius xl
};

export const ELEVATION = {
    sm: {
        shadowColor: '#7C6EFA',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    md: {
        shadowColor: '#7C6EFA',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 10,
    },
    lg: {
        shadowColor: '#7C6EFA',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.38,
        shadowRadius: 28,
        elevation: 18,
    },
};

export const gs = StyleSheet.create({
    flex: { flex: 1 },
    safe: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    row: { flexDirection: 'row', alignItems: 'center' },
    between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    px: { paddingHorizontal: SIZE.pad },
    py: { paddingVertical: SIZE.pad },
    card: {
        backgroundColor: COLORS.cardSolid,
        borderRadius: SIZE.r,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pill: {
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    badge: {
        position: 'absolute', top: -5, right: -7,
        minWidth: 18, height: 18, borderRadius: 9,
        backgroundColor: COLORS.rose,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 3,
    },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: FONT.bold },
    divider: { height: 1, backgroundColor: COLORS.border },
    h1: { fontSize: SIZE.xxxl, fontWeight: FONT.black, color: COLORS.text, letterSpacing: -0.5 },
    h2: { fontSize: SIZE.xxl, fontWeight: FONT.bold, color: COLORS.text },
    h3: { fontSize: SIZE.xl, fontWeight: FONT.semiBold, color: COLORS.text },
    body: { fontSize: SIZE.base, color: COLORS.textSoft, lineHeight: 22 },
    caption: { fontSize: SIZE.sm, color: COLORS.textMuted },
    label: { fontSize: SIZE.sm, fontWeight: FONT.semiBold, color: COLORS.textSoft, letterSpacing: 0.3 },
    price: { fontSize: SIZE.xl, fontWeight: FONT.black, color: COLORS.primary },
    btnPrimary: {
        height: 54, borderRadius: SIZE.r, alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
    },
    btnText: { fontSize: SIZE.base, fontWeight: FONT.bold, color: '#fff', letterSpacing: 0.4 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surface, borderRadius: SIZE.r,
        borderWidth: 1, borderColor: COLORS.border,
        paddingHorizontal: 16, height: 52,
    },
    inputWrapFocus: { borderColor: COLORS.primary },
    inputText: { flex: 1, fontSize: SIZE.base, color: COLORS.text, marginLeft: 10 },
    sectionTitle: { fontSize: SIZE.sm, fontWeight: FONT.bold, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },
});

export const SCREEN = { width, height };
export const CARD_W = (width - SIZE.pad * 3) / 2;
