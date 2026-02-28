import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
    ScrollView, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SIZE, gs } from '../theme/theme';
import { loginUser } from '../database/database';
import { useAuth } from '../context/AppContext';

function InputField({ icon, placeholder, value, onChangeText, secure, onToggle, keyboard, error }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={{ marginBottom: 16 }}>
            <View style={[styles.inputWrap, focused && styles.inputFocused, error && styles.inputError]}>
                <Ionicons name={icon} size={18} color={focused ? COLORS.primary : COLORS.textMuted} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secure}
                    keyboardType={keyboard || 'default'}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {onToggle && (
                    <TouchableOpacity onPress={onToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>
            {error ? <Text style={styles.errText}>{error}</Text> : null}
        </View>
    );
}

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Kiểm tra Validate dữ liệu đầu vào
    const validate = () => {
        const e = {};
        if (!email.trim()) e.email = 'Vui lòng nhập Email!';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Định dạng email không hợp lệ!';
        if (!password) e.password = 'Vui lòng nhập mật khẩu!';
        return e;
    };

    // Xử lý nút bấm Đăng Nhập
    const handleLogin = async () => {
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return; // Nếu có lỗi thì không chạy tiếp

        setLoading(true); // Hiển thị vòng xoay
        try {
            // Gọi lên SQLite để kiểm tra User
            const user = await loginUser(email.trim().toLowerCase(), password);

            // Xử lý Context Auth và lưu AsyncStorage nếu "remember" == true
            await login(user, remember);
        } catch (err) {
            Alert.alert('Đăng nhập thất bại', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            {/* Các bóng màu Background */}
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />

            <SafeAreaView style={gs.safe}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={gs.flex}>
                    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        {/* Logo khu vực */}
                        <View style={styles.logoSection}>
                            <LinearGradient colors={COLORS.gradPrimary} style={styles.logoGrad} start={[0, 0]} end={[1, 1]}>
                                <Ionicons name="storefront" size={36} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.appName}>ShopApp</Text>
                            <Text style={styles.tagline}>Trải nghiệm mua sắm tuyệt vời</Text>
                        </View>

                        {/* Thẻ đăng nhập (Login Card) */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Chào mừng trở lại 👋</Text>
                            <Text style={styles.cardSub}>Đăng nhập vào tài khoản của bạn</Text>

                            <View style={{ marginTop: 24 }}>
                                <InputField
                                    icon="mail-outline" placeholder="Địa chỉ email"
                                    value={email} onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: '' })); }}
                                    keyboard="email-address" error={errors.email}
                                />
                                <InputField
                                    icon="lock-closed-outline" placeholder="Mật khẩu"
                                    value={password} onChangeText={v => { setPassword(v); setErrors(p => ({ ...p, password: '' })); }}
                                    secure={!showPass} onToggle={() => setShowPass(p => !p)} error={errors.password}
                                />

                                {/* Switch nhớ mật khẩu */}
                                <View style={styles.remRow}>
                                    <View style={gs.row}>
                                        <Switch
                                            value={remember} onValueChange={setRemember}
                                            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                                            thumbColor={remember ? COLORS.primary : COLORS.textMuted}
                                            ios_backgroundColor={COLORS.border}
                                        />
                                        <Text style={styles.remText}>Ghi nhớ thao tác (Nhớ mật khẩu)</Text>
                                    </View>
                                </View>

                                {/* Nút Submit */}
                                <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
                                    <LinearGradient colors={COLORS.gradPrimary} style={styles.loginBtn} start={[0, 0]} end={[1, 0]}>
                                        {loading
                                            ? <ActivityIndicator color="#fff" />
                                            : <>
                                                <Text style={styles.loginBtnText}>Đăng Nhập</Text>
                                                <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
                                            </>
                                        }
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {/* Dấu gạch nang */}
                            <View style={styles.divRow}>
                                <View style={gs.divider} />
                                <Text style={styles.divText}>hoặc</Text>
                                <View style={gs.divider} />
                            </View>

                            {/* Nút sang trang Đăng ký */}
                            <TouchableOpacity style={styles.regBtn} onPress={() => navigation.navigate('Register')} activeOpacity={0.8}>
                                <Text style={styles.regBtnText}>Tạo Tài Khoản Mới</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.footNote}>Bằng cách đăng nhập, bạn đồng ý với Điều khoản và Chọn sách của chúng tôi</Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    blob: { position: 'absolute', borderRadius: 999, opacity: 0.18 },
    blob1: { width: 300, height: 300, backgroundColor: COLORS.primary, top: -60, left: -80 },
    blob2: { width: 250, height: 250, backgroundColor: COLORS.rose, bottom: 80, right: -70 },
    scroll: { flexGrow: 1, paddingHorizontal: SIZE.pad, paddingBottom: 32 },
    logoSection: { alignItems: 'center', marginTop: 52, marginBottom: 36 },
    logoGrad: {
        width: 80, height: 80, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center', marginBottom: 18,
    },
    appName: { fontSize: SIZE.xxxl, fontWeight: FONT.black, color: COLORS.text, letterSpacing: -0.5 },
    tagline: { fontSize: SIZE.sm, color: COLORS.textMuted, marginTop: 6, letterSpacing: 0.3 },
    card: {
        backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.rLg,
        padding: SIZE.pad2, borderWidth: 1, borderColor: COLORS.border,
    },
    cardTitle: { fontSize: SIZE.xl, fontWeight: FONT.bold, color: COLORS.text },
    cardSub: { fontSize: SIZE.md, color: COLORS.textMuted, marginTop: 4 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surface, borderRadius: SIZE.r,
        borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, height: 52,
    },
    inputFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
    inputError: { borderColor: COLORS.error },
    input: { flex: 1, marginLeft: 10, fontSize: SIZE.base, color: COLORS.text },
    errText: { color: COLORS.error, fontSize: SIZE.xs, marginTop: 5, marginLeft: 4 },
    remRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 4 },
    remText: { fontSize: SIZE.sm, color: COLORS.textSoft, marginLeft: 10 },
    loginBtn: {
        height: 54, borderRadius: SIZE.r, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    loginBtnText: { fontSize: SIZE.base, fontWeight: FONT.bold, color: '#fff', letterSpacing: 0.5 },
    divRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        marginVertical: 22,
    },
    divText: { color: COLORS.textMuted, fontSize: SIZE.sm },
    regBtn: {
        height: 54, borderRadius: SIZE.r, borderWidth: 1.5, borderColor: COLORS.borderHigh,
        alignItems: 'center', justifyContent: 'center',
    },
    regBtnText: { color: COLORS.textSoft, fontSize: SIZE.base, fontWeight: FONT.semiBold },
    footNote: { textAlign: 'center', color: COLORS.textMuted, fontSize: SIZE.xs, marginTop: 24 },
});
