import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SIZE, gs, ELEVATION } from '../theme/theme';
import { useAuth, useCart } from '../context/AppContext';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { totalItems, totalPrice } = useCart();

    // Đăng xuất khỏi tài khoản
    const handleLogout = () => {
        Alert.alert('Đăng Xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Hủy bỏ', style: 'cancel' },
            {
                text: 'Thoát', style: 'destructive',
                onPress: () => logout(), // Xử lý đăng xuất trong UserContext
            },
        ]);
    };

    // Lấy 2 chữ cái đầu của Tên
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'US';

    // Hàng Menu (Ví dụ: Browse Products, v.v...)
    const NavRow = ({ icon, label, onPress, color = COLORS.textSoft, isDanger }) => (
        <TouchableOpacity
            style={styles.navRow}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.navIconBg, isDanger && { backgroundColor: COLORS.error + '20' }]}>
                <Ionicons name={icon} size={20} color={isDanger ? COLORS.error : color} />
            </View>
            <Text style={[styles.navLabel, isDanger && { color: COLORS.error, fontWeight: FONT.bold }]}>{label}</Text>
            {!isDanger && <Ionicons name="chevron-forward" size={18} color={COLORS.borderHigh} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.root}>
            <SafeAreaView style={gs.safe}>

                {/* Thanh Header Điều hướng */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <View style={styles.backBtnBg}>
                            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.topTitle}>Hồ Sơ Của Tôi</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    {/* Vùng Avatar và Thông tin chung */}
                    <View style={styles.avatarWrap}>
                        <LinearGradient colors={COLORS.gradPrimary} style={styles.avatarBorder} start={[0, 0]} end={[1, 1]}>
                            <View style={styles.avatarInner}>
                                <Text style={styles.avatarInitials}>{getInitials(user?.fullName)}</Text>
                            </View>
                        </LinearGradient>

                        <Text style={styles.userName}>{user?.fullName || 'Khách Hàng'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>

                        {/* Bảng theo dõi số lượng và giá Giỏ hàng  */}
                        <View style={styles.statsCard}>
                            <View style={styles.statCol}>
                                <Text style={styles.statVal}>{totalItems}</Text>
                                <Text style={styles.statLbl}>S.Phẩm Nhặt</Text>
                            </View>
                            <View style={styles.statDiv} />
                            <View style={styles.statCol}>
                                <Text style={styles.statVal}>${totalPrice.toFixed(0)}</Text>
                                <Text style={styles.statLbl}>Tổng Giá Trị</Text>
                            </View>
                        </View>
                    </View>

                    {/* Card Thông Tin Chi Tiết (Info Card) */}
                    <Text style={styles.sectionHeader}>Thông tin bảo mật</Text>
                    <View style={styles.card}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Số Mã ID</Text>
                            <Text style={styles.infoValue}>#{user?.id || '?'}</Text>
                        </View>
                        <View style={styles.cardDiv} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Gia nhập từ</Text>
                            <Text style={styles.infoValue}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Menu Phím Tắt (Quick Action Links) */}
                    <Text style={styles.sectionHeader}>Công Mạng Nhanh</Text>
                    <View style={styles.card}>
                        <NavRow icon="storefront" label="Duyệt Xem Sản Phẩm" onPress={() => navigation.navigate('Products')} color={COLORS.sky} />
                        <View style={styles.cardDiv} />
                        <NavRow icon="cart" label="Mở Tủ Đồ (Giỏ Hàng)" onPress={() => navigation.navigate('Cart')} color={COLORS.primary} />
                        <View style={styles.cardDiv} />
                        <NavRow icon="bar-chart" label="Bảng Doanh Thu" onPress={() => navigation.navigate('Revenue')} color={COLORS.accent} />
                        <View style={styles.cardDiv} />
                        <NavRow icon="add-circle" label="Tạo Sản Phẩm Mới" onPress={() => navigation.navigate('AddProduct')} color={COLORS.amber} />
                    </View>

                    {/* Vùng Thiết Lập Quản Loại Bỏ (Danger Zone) */}
                    <Text style={styles.sectionHeader}>Cấu Hình Chung</Text>
                    <View style={styles.card}>
                        <NavRow icon="log-out" label="Đăng Xuất Thoát App" onPress={handleLogout} isDanger />
                    </View>

                    <Text style={styles.version}>Phiên bản Premium V 1.0.0 (T.Việt)</Text>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SIZE.pad, paddingTop: 12, paddingBottom: 16,
    },
    backBtn: { alignItems: 'center', justifyContent: 'center' },
    backBtnBg: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.surfaceHigh, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: COLORS.border,
    },
    topTitle: { fontSize: SIZE.lg, fontWeight: FONT.bold, color: COLORS.text, letterSpacing: 0.5 },
    scroll: { paddingHorizontal: SIZE.pad, paddingBottom: 60 },
    avatarWrap: { alignItems: 'center', marginBottom: 32 },
    avatarBorder: {
        width: 106, height: 106, borderRadius: 53,
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        ...ELEVATION.md, padding: 3,
    },
    avatarInner: {
        width: '100%', height: '100%', borderRadius: 50,
        backgroundColor: COLORS.surfaceHigh, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: COLORS.bg,
    },
    avatarInitials: { fontSize: SIZE.xxxl, fontWeight: FONT.black, color: COLORS.text, letterSpacing: -1 },
    userName: { fontSize: SIZE.xxl, fontWeight: FONT.bold, color: COLORS.text, marginBottom: 4, letterSpacing: -0.5 },
    userEmail: { fontSize: SIZE.sm, color: COLORS.textMuted },
    statsCard: {
        flexDirection: 'row', backgroundColor: COLORS.cardSolid, borderRadius: SIZE.rLg,
        paddingVertical: 18, marginTop: 24, borderWidth: 1, borderColor: COLORS.border,
        alignSelf: 'stretch', ...ELEVATION.sm,
    },
    statCol: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
    statVal: { fontSize: SIZE.xl, fontWeight: FONT.black, color: COLORS.text },
    statLbl: { fontSize: SIZE.xs, color: COLORS.textMuted, fontWeight: FONT.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
    statDiv: { width: 1, backgroundColor: COLORS.border },
    sectionHeader: { fontSize: SIZE.xs, fontWeight: FONT.bold, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, marginLeft: 4, marginTop: 12 },
    card: {
        backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.rLg,
        borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, paddingVertical: 4,
        ...ELEVATION.sm,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18 },
    infoLabel: { fontSize: SIZE.sm, color: COLORS.textSoft, fontWeight: FONT.medium },
    infoValue: { fontSize: SIZE.base, color: COLORS.text, fontWeight: FONT.bold },
    cardDiv: { height: 1, backgroundColor: COLORS.border, marginLeft: 60 },
    navRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
    navIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, marginRight: 16 },
    navLabel: { flex: 1, fontSize: SIZE.md, color: COLORS.text, fontWeight: FONT.semiBold, letterSpacing: 0.3 },
    version: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, marginTop: 16 },
});
