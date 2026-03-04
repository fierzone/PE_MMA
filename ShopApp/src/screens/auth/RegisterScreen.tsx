import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, ScrollView, SafeAreaView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<any, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const { register } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [focused, setFocused] = useState<string | null>(null);
    const [showPass, setShowPass] = useState(false);

    const validateEmail = (e: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.toLowerCase().trim());

    const handleRegister = async () => {
        setError(null);
        if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        if (!validateEmail(email)) {
            setError('Định dạng email không hợp lệ. Vd: ten@gmail.com');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);
        try {
            const result = await register(fullName, email, password);
            if (result.success) {
                Toast.show({
                    type: 'success',
                    text1: '🎉 Tạo tài khoản thành công!',
                    text2: 'Vui lòng đăng nhập để tiếp tục.',
                    visibilityTime: 3000,
                });
                setTimeout(() => navigation.navigate('Login'), 800);
            } else {
                setError(result.error || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        } catch (e) {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { key: 'name', label: 'Họ và Tên', value: fullName, onChange: setFullName, icon: 'person-outline', secure: false, type: 'default' },
        { key: 'email', label: 'Địa chỉ Email', value: email, onChange: setEmail, icon: 'mail-outline', secure: false, type: 'email-address' },
        { key: 'password', label: 'Mật khẩu (tối thiểu 6 ký tự)', value: password, onChange: setPassword, icon: 'lock-closed-outline', secure: !showPass, type: 'default' },
        { key: 'confirm', label: 'Xác nhận Mật khẩu', value: confirmPassword, onChange: setConfirmPassword, icon: 'shield-checkmark-outline', secure: !showPass, type: 'default' },
    ];

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.topBar}>
                <View style={styles.logoRow}>
                    <Ionicons name="diamond" size={18} color="#16869C" />
                    <Text style={styles.logoText}>Minimalist Prime</Text>
                </View>
                <Text style={styles.supportText}>Hỗ trợ</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.logoBig}>
                                <Ionicons name="person-add" size={24} color="#16869C" />
                            </View>
                            <Text style={styles.cardTitle}>Tạo Tài Khoản</Text>
                            <Text style={styles.cardSubtitle}>Đăng ký miễn phí, bắt đầu mua sắm ngay.</Text>
                        </View>

                        {/* Tabs */}
                        <View style={styles.tabs}>
                            <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.tabText}>Đăng Nhập</Text>
                            </TouchableOpacity>
                            <View style={[styles.tab, styles.tabActive]}>
                                <Text style={styles.tabTextActive}>Đăng Ký</Text>
                            </View>
                        </View>

                        {/* Form fields */}
                        <View style={styles.form}>
                            {fields.map(field => (
                                <View
                                    key={field.key}
                                    style={[styles.fieldGroup, focused === field.key && styles.fieldGroupFocused]}
                                >
                                    <Ionicons
                                        name={field.icon as any}
                                        size={18}
                                        color={focused === field.key ? '#16869C' : '#94A3B8'}
                                    />
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={field.value}
                                        onChangeText={(t) => { field.onChange(t); setError(null); }}
                                        onFocus={() => setFocused(field.key)}
                                        onBlur={() => setFocused(null)}
                                        placeholder={field.label}
                                        placeholderTextColor="#94A3B8"
                                        secureTextEntry={field.secure}
                                        keyboardType={field.type as any}
                                        autoCapitalize={field.key === 'name' ? 'words' : 'none'}
                                    />
                                    {(field.key === 'password' || field.key === 'confirm') && (
                                        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                                            <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color="#94A3B8" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            {/* Error */}
                            {error && (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            {/* Submit */}
                            <TouchableOpacity
                                style={[styles.registerBtn, loading && { opacity: 0.7 }]}
                                onPress={handleRegister}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                {loading ? (
                                    <Text style={styles.registerBtnText}>ĐANG XỬ LÝ...</Text>
                                ) : (
                                    <>
                                        <Text style={styles.registerBtnText}>TẠO TÀI KHOẢN</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                                    </>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.termsText}>
                                Bằng cách đăng ký, bạn đồng ý với{' '}
                                <Text style={styles.termsLink}>Điều khoản dịch vụ</Text>
                                {' '}và{' '}
                                <Text style={styles.termsLink}>Chính sách bảo mật</Text>.
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.footer}>PHIÊN AN TOÀN · V2.0.4</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F6F8F8' },
    flex: { flex: 1 },
    topBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 24, paddingVertical: 16,
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
    supportText: { fontSize: 13, color: '#94A3B8' },
    scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 32 },
    card: {
        width: '100%', maxWidth: 440, backgroundColor: '#FFFFFF', borderRadius: 16,
        paddingHorizontal: Platform.OS === 'web' ? 48 : 28, paddingVertical: 36,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
    },
    cardHeader: { alignItems: 'center', marginBottom: 24 },
    logoBig: {
        width: 56, height: 56, borderRadius: 16, backgroundColor: '#EFF9FB',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    cardTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A', letterSpacing: -1, marginBottom: 6 },
    cardSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center' },
    tabs: {
        flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 28,
    },
    tab: {
        flex: 1, paddingBottom: 12, alignItems: 'center',
        borderBottomWidth: 2, borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: '#16869C' },
    tabText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
    tabTextActive: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
    form: { gap: 20 },
    fieldGroup: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0', paddingBottom: 10,
    },
    fieldGroupFocused: { borderBottomColor: '#16869C' },
    input: { fontSize: 15, color: '#0F172A', paddingVertical: 4 },
    errorBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FFF5F5', borderRadius: 8, padding: 12,
        borderWidth: 1, borderColor: '#FECACA',
    },
    errorText: { fontSize: 13, color: '#EF4444', flex: 1 },
    registerBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#16869C', paddingVertical: 16, borderRadius: 8, gap: 8, marginTop: 4,
    },
    registerBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
    termsText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 18 },
    termsLink: { color: '#16869C', fontWeight: '600' },
    footer: {
        marginTop: 32, fontSize: 10, color: '#CBD5E1', letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', textAlign: 'center',
    },
});
