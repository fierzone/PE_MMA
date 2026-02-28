import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SIZE, gs } from '../theme/theme';
import { registerUser } from '../database/database';

function InputField({ label, icon, placeholder, value, onChangeText, secure, onToggle, keyboard, error }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={{ marginBottom: 18 }}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrap, focused && styles.inputFocused, error && styles.inputError]}>
                <Ionicons name={icon} size={17} color={focused ? COLORS.primary : COLORS.textMuted} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secure}
                    keyboardType={keyboard || 'default'}
                    autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
                    autoCorrect={false}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {onToggle && (
                    <TouchableOpacity onPress={onToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={17} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>
            {error ? <Text style={styles.errText}>{error}</Text> : null}
        </View>
    );
}

export default function RegisterScreen({ navigation }) {
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [loading, setLoading] = useState(false);

    // Helper set form values
    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    // Validate form đăng ký
    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = 'Họ và tên bắt buộc!';
        if (!form.email.trim()) e.email = 'Vui lòng điền Email!';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ!';
        if (!form.password) e.password = 'Vui lòng điền mật khẩu!';
        else if (form.password.length < 6) e.password = 'Ít nhất 6 ký tự!';
        if (form.password !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp!';
        return e;
    };

    // Nút Tạo tài khoản
    const handle = async () => {
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;
        setLoading(true);
        try {
            await registerUser(form.fullName.trim(), form.email.trim().toLowerCase(), form.password);
            Alert.alert('Thành công!', 'Bạn có thể đăng nhập ngay bây giờ.', [
                { text: 'Tới trang Đăng nhập', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (err) {
            Alert.alert('Lỗi', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            {/* Các bóng màu Background mờ ảo */}
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />

            <SafeAreaView style={gs.safe}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={gs.flex}>
                    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        {/* Nút Quay lại (Back) */}
                        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                            <View style={styles.backCircle}>
                                <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                            </View>
                        </TouchableOpacity>

                        {/* Phần Header đăng ký */}
                        <View style={styles.header}>
                            <LinearGradient colors={COLORS.gradPurpleRose} style={styles.iconGrad} start={[0, 0]} end={[1, 1]}>
                                <Ionicons name="person-add" size={28} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.title}>Tạo Tài Khoản</Text>
                            <Text style={styles.subtitle}>Tham gia cùng hàng vạn người mua sắm</Text>
                        </View>

                        {/* Biểu đồ phân đoạn (Bước đăng ký mô phỏng) */}
                        <View style={styles.stepsRow}>
                            {['Cá nhân', 'Bảo mật', 'Xong'].map((s, i) => (
                                <View key={i} style={styles.stepWrap}>
                                    <View style={[styles.stepDot, i === 0 && styles.stepDotActive]}>
                                        <Text style={[styles.stepNum, i === 0 && styles.stepNumActive]}>{i + 1}</Text>
                                    </View>
                                    <Text style={[styles.stepLabel, i === 0 && styles.stepLabelActive]}>{s}</Text>
                                    {i < 2 && <View style={styles.stepLine} />}
                                </View>
                            ))}
                        </View>

                        {/* Form đăng ký nhập liệu */}
                        <View style={styles.form}>
                            <InputField label="Họ và Tên" icon="person-outline" placeholder="VD: Nguyễn Văn A"
                                value={form.fullName} onChangeText={v => set('fullName', v)} error={errors.fullName} />
                            <InputField label="Địa chỉ Email" icon="mail-outline" placeholder="VD: mail@example.com"
                                value={form.email} onChangeText={v => set('email', v)} keyboard="email-address" error={errors.email} />
                            <InputField label="Mật khẩu" icon="lock-closed-outline" placeholder="Tối thiểu 6 ký tự"
                                value={form.password} onChangeText={v => set('password', v)}
                                secure={!showPass} onToggle={() => setShowPass(p => !p)} error={errors.password} />
                            <InputField label="Xác nhận mật khẩu" icon="shield-checkmark-outline" placeholder="Nhập lại mật khẩu"
                                value={form.confirm} onChangeText={v => set('confirm', v)}
                                secure={!showConf} onToggle={() => setShowConf(p => !p)} error={errors.confirm} />

                            {/* Hiển thị mức độ mạnh mẽ của mật khẩu bằng thanh ngang */}
                            {form.password.length > 0 && (
                                <View style={styles.strengthWrap}>
                                    {[...Array(4)].map((_, i) => (
                                        <View key={i} style={[
                                            styles.strengthBar,
                                            i < Math.min(Math.ceil(form.password.length / 3), 4) && {
                                                backgroundColor: form.password.length < 6 ? COLORS.error : form.password.length < 10 ? COLORS.amber : COLORS.success,
                                            }
                                        ]} />
                                    ))}
                                    <Text style={styles.strengthLabel}>
                                        {form.password.length < 6 ? 'Yếu' : form.password.length < 10 ? 'Trung Bình' : 'Mạnh!'}
                                    </Text>
                                </View>
                            )}

                            {/* Nút Tạo Tài khoản thực sự */}
                            <TouchableOpacity onPress={handle} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
                                <LinearGradient colors={COLORS.gradPrimary} style={styles.submitBtn} start={[0, 0]} end={[1, 0]}>
                                    {loading
                                        ? <ActivityIndicator color="#fff" />
                                        : <Text style={styles.submitText}>Tạo Tài Khoản</Text>
                                    }
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Điều hướng Về trang đăng nhập nếu có tài khoản rồi */}
                        <View style={styles.loginRow}>
                            <Text style={styles.loginHint}>Bạn đã có sẵn tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    blob: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
    blob1: { width: 280, height: 280, backgroundColor: COLORS.primary, top: -40, right: -80 },
    blob2: { width: 200, height: 200, backgroundColor: COLORS.accent, bottom: 60, left: -60 },
    scroll: { flexGrow: 1, paddingHorizontal: SIZE.pad, paddingBottom: 40 },
    back: { marginTop: 12, marginBottom: 4 },
    backCircle: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: COLORS.surfaceHigh, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: COLORS.border,
    },
    header: { alignItems: 'center', marginBottom: 28, marginTop: 10 },
    iconGrad: {
        width: 72, height: 72, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    title: { fontSize: SIZE.xxl, fontWeight: FONT.black, color: COLORS.text, letterSpacing: -0.5 },
    subtitle: { fontSize: SIZE.sm, color: COLORS.textMuted, marginTop: 6 },
    stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28, gap: 0 },
    stepWrap: { flexDirection: 'row', alignItems: 'center' },
    stepDot: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center',
    },
    stepDotActive: { backgroundColor: COLORS.primaryGlow, borderColor: COLORS.primary },
    stepNum: { fontSize: SIZE.xs, fontWeight: FONT.bold, color: COLORS.textMuted },
    stepNumActive: { color: COLORS.primary },
    stepLabel: { fontSize: SIZE.xs, color: COLORS.textMuted, marginLeft: 6, marginRight: 6 },
    stepLabelActive: { color: COLORS.primary },
    stepLine: { width: 28, height: 1.5, backgroundColor: COLORS.border, marginHorizontal: 4 },
    form: {
        backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.rLg,
        padding: SIZE.pad2, borderWidth: 1, borderColor: COLORS.border,
    },
    label: { fontSize: SIZE.sm, fontWeight: FONT.semiBold, color: COLORS.textSoft, marginBottom: 8 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surface, borderRadius: SIZE.r,
        borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, height: 52,
    },
    inputFocused: { borderColor: COLORS.primary },
    inputError: { borderColor: COLORS.error },
    input: { flex: 1, marginLeft: 10, fontSize: SIZE.base, color: COLORS.text },
    errText: { color: COLORS.error, fontSize: SIZE.xs, marginTop: 5, marginLeft: 4 },
    strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: -8 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
    strengthLabel: { fontSize: SIZE.xs, color: COLORS.textMuted, minWidth: 36 },
    submitBtn: { height: 54, borderRadius: SIZE.r, alignItems: 'center', justifyContent: 'center' },
    submitText: { fontSize: SIZE.base, fontWeight: FONT.bold, color: '#fff', letterSpacing: 0.5 },
    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    loginHint: { fontSize: SIZE.sm, color: COLORS.textMuted },
    loginLink: { fontSize: SIZE.sm, fontWeight: FONT.bold, color: COLORS.primary },
});
