import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as SQLite from 'expo-sqlite';

type Props = NativeStackScreenProps<any, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Vui lòng nhập email và mật khẩu.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await login(email.trim(), password);
            if (!result.success) {
                setError(result.error || 'Email hoặc mật khẩu không đúng.');
            }
            // Navigation is handled automatically by AppNavigator once user state changes
        } catch (e) {
            setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetDB = () => {
        Alert.alert(
            'Xóa toàn bộ dữ liệu?',
            'Hành động này sẽ xóa sạch tất cả Users, Orders và Cart. Dùng để test lại từ đầu.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa sạch',
                    style: 'destructive',
                    onPress: async () => {
                        const db = SQLite.openDatabaseSync('shop.db');
                        await db.execAsync(
                            'DROP TABLE IF EXISTS OrderItems; DROP TABLE IF EXISTS Orders; DROP TABLE IF EXISTS Cart; DROP TABLE IF EXISTS Users; DROP TABLE IF EXISTS Products;'
                        );
                        Toast.show({ type: 'success', text1: 'Đã xóa sạch DB', text2: 'Vui lòng reload lại trang.' });
                    }
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Top Bar */}
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
                        {/* Header */}
                        <View style={styles.cardHeader}>
                            <View style={styles.logoBig}>
                                <Ionicons name="diamond" size={28} color="#16869C" />
                            </View>
                            <Text style={styles.cardTitle}>Truy Cập Hệ Thống</Text>
                            <Text style={styles.cardSubtitle}>Nhập thông tin để tiếp tục.</Text>
                        </View>

                        {/* Tabs */}
                        <View style={styles.tabs}>
                            <View style={[styles.tab, styles.tabActive]}>
                                <Text style={styles.tabTextActive}>Đăng Nhập</Text>
                            </View>
                            <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.tabText}>Đăng Ký</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Email */}
                            <View style={[styles.fieldGroup, emailFocused && styles.fieldGroupFocused]}>
                                <Ionicons name="mail-outline" size={18} color={emailFocused ? '#16869C' : '#94A3B8'} />
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setError(null); }}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    placeholder="Địa chỉ Email"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>

                            {/* Password */}
                            <View style={[styles.fieldGroup, passwordFocused && styles.fieldGroupFocused]}>
                                <Ionicons name="lock-closed-outline" size={18} color={passwordFocused ? '#16869C' : '#94A3B8'} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={password}
                                    onChangeText={(t) => { setPassword(t); setError(null); }}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    placeholder="Mật khẩu"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry={!showPass}
                                />
                                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                                    <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            {/* Error */}
                            {error && (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            {/* Submit */}
                            <TouchableOpacity
                                style={[styles.loginBtn, loading && { opacity: 0.7 }]}
                                onPress={handleLogin}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                {loading ? (
                                    <Text style={styles.loginBtnText}>ĐANG XỬ LÝ...</Text>
                                ) : (
                                    <>
                                        <Text style={styles.loginBtnText}>ĐĂNG NHẬP</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.forgotRow}>
                                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>PHIÊN AN TOÀN · V2.0.4</Text>
                        <TouchableOpacity onPress={handleResetDB} style={styles.resetBtn}>
                            <Text style={styles.resetText}>[ DEV: RESET DB ]</Text>
                        </TouchableOpacity>
                    </View>
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
    scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40 },
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
    hintBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#EFF9FB', borderRadius: 8, padding: 12, marginBottom: 20,
    },
    hintText: { fontSize: 12, color: '#334155', flex: 1 },
    hintBold: { fontWeight: '700', color: '#16869C' },
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
    input: { flex: 1, fontSize: 15, color: '#0F172A', paddingVertical: 4 },
    errorBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FFF5F5', borderRadius: 8, padding: 12,
        borderWidth: 1, borderColor: '#FECACA',
    },
    errorText: { fontSize: 13, color: '#EF4444', flex: 1 },
    loginBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 8, gap: 8,
    },
    loginBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
    forgotRow: { alignItems: 'center' },
    forgotText: { fontSize: 13, color: '#94A3B8' },
    footer: { alignItems: 'center', gap: 12, marginTop: 32 },
    footerText: {
        fontSize: 10, color: '#CBD5E1', letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    resetBtn: { opacity: 0.5 },
    resetText: { fontSize: 10, color: '#EF4444', fontWeight: '700', textDecorationLine: 'underline' },
});
