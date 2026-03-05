import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert, StatusBar, Modal, FlatList
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import * as SQLite from 'expo-sqlite';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormInput } from '../../components/FormInput';

type Props = NativeStackScreenProps<any, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const { login, getSavedAccounts, removeSavedAccount } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savedAccounts, setSavedAccounts] = useState<any[]>([]);
    const [showAccounts, setShowAccounts] = useState(false);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        const accounts = await getSavedAccounts();
        setSavedAccounts(accounts);
        if (accounts.length > 0) {
            // Auto-fill last used
            setEmail(accounts[0].email);
            setPassword(accounts[0].password || '');
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await login(email.trim(), password, remember);
            if (!res.success) {
                setError(res.error || 'Lỗi đăng nhập.');
            } else {
                Toast.show({ type: 'success', text1: 'Đăng nhập thành công', text2: 'Chào mừng trở lại.' });
                loadAccounts(); // Refresh saved accounts
            }
        } catch (e) {
            setError('Không thể kết nối máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    const selectAccount = (acc: any) => {
        setEmail(acc.email);
        setPassword(acc.password || '');
        setShowAccounts(false);
    };

    const handleRemoveAccount = async (email: string) => {
        await removeSavedAccount(email);
        loadAccounts();
    };

    const handleResetDB = () => {
        Alert.alert('⚠️ Nguy hiểm', 'Bạn sắp xóa toàn bộ dữ liệu hệ thống (Users, Orders, Products).', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa ngay', style: 'destructive',
                onPress: async () => {
                    const db = SQLite.openDatabaseSync('shop.db');
                    await db.execAsync('DROP TABLE IF EXISTS OrderItems; DROP TABLE IF EXISTS Orders; DROP TABLE IF EXISTS Cart; DROP TABLE IF EXISTS Users; DROP TABLE IF EXISTS Products; DROP TABLE IF EXISTS SavedAccounts; DROP TABLE IF EXISTS Licenses;');
                    Toast.show({ type: 'info', text1: 'Đã xóa DB', text2: 'Vui lòng khởi động lại app.' });
                }
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <Text style={styles.chapterMarker}>CHAPTER I · ACCESS</Text>
                        <Text style={styles.title}>Unified</Text>
                        <Text style={styles.titleAccent}>Platform.</Text>
                        <Text style={styles.subTitle}>Cổng truy cập dành cho cả khách hàng và quản trị viên hệ thống.</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.tabs}>
                            <View style={styles.activeTab}>
                                <Text style={styles.activeTabText}>ĐANG NHẬP</Text>
                            </View>
                            <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.tabText}>ĐĂNG KÝ</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ position: 'relative', zIndex: 10 }}>
                            <FormInput
                                label="DANH TÍNH (EMAIL)"
                                placeholder="your@email.com"
                                value={email}
                                onChangeText={(t) => { setEmail(t); setError(null); }}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            {savedAccounts.length > 0 && (
                                <TouchableOpacity
                                    style={styles.dropdownToggle}
                                    onPress={() => setShowAccounts(!showAccounts)}
                                >
                                    <Ionicons name={showAccounts ? "chevron-up" : "chevron-down"} size={20} color={ShopifyTheme.colors.accent} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <FormInput
                            label="MẬT MÃ"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={(t) => { setPassword(t); setError(null); }}
                            secureTextEntry={!showPass}
                        />

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.showPassBtn}
                                onPress={() => setShowPass(!showPass)}
                            >
                                <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.showPassText}>{showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.rememberRow}
                                onPress={() => setRemember(!remember)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                                    {remember && <Ionicons name="checkmark" size={12} color="#000" />}
                                </View>
                                <Text style={styles.rememberText}>Ghi nhớ</Text>
                            </TouchableOpacity>
                        </View>

                        {error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={16} color="#FF453A" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <TouchableOpacity style={[styles.loginBtn, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
                            <Text style={styles.loginBtnText}>{loading ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC →'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={handleResetDB} style={styles.devBtn}>
                            <Text style={styles.devText}>[ DEVELOPMENT: RESET CORE SYSTEM ]</Text>
                        </TouchableOpacity>
                        <Text style={styles.copyright}>© 2026 MINIMALIST PRIME · SECURE ACCESS</Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Saved Accounts Modal */}
            <Modal visible={showAccounts} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tài khoản đã lưu</Text>
                            <TouchableOpacity onPress={() => setShowAccounts(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={savedAccounts}
                            keyExtractor={(item) => item.email}
                            renderItem={({ item }) => (
                                <View style={styles.accountRow}>
                                    <TouchableOpacity style={styles.accountInfo} onPress={() => selectAccount(item)}>
                                        <View style={styles.accountAvatar}>
                                            <Text style={styles.avatarText}>{item.fullName[0]}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.accountName}>{item.fullName}</Text>
                                            <Text style={styles.accountEmail}>{item.email}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleRemoveAccount(item.email)}>
                                        <Ionicons name="trash-outline" size={20} color="#FF453A" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            contentContainerStyle={{ padding: 20 }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scroll: { flexGrow: 1, paddingBottom: 60 },
    header: { padding: 40, paddingTop: 60 },
    chapterMarker: { color: ShopifyTheme.colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 24 },
    title: { color: '#FFF', fontSize: 56, fontWeight: '900', letterSpacing: -2 },
    titleAccent: { color: ShopifyTheme.colors.accent, fontSize: 56, fontWeight: '900', letterSpacing: -4, marginTop: -10 },
    subTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 20, marginTop: 20, fontWeight: '600' },
    card: { marginHorizontal: 32, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 32, padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    tabs: { flexDirection: 'row', marginBottom: 32, gap: 20 },
    activeTab: { borderBottomWidth: 1, borderBottomColor: ShopifyTheme.colors.accent, paddingBottom: 8 },
    activeTabText: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    tab: { paddingBottom: 8 },
    tabText: { color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    dropdownToggle: { position: 'absolute', right: 16, top: 40, zIndex: 11 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    checkboxActive: { backgroundColor: ShopifyTheme.colors.accent, borderColor: ShopifyTheme.colors.accent },
    rememberText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
    showPassBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    showPassText: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '700' },
    loginBtn: { backgroundColor: '#FFF', height: 60, borderRadius: 100, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    loginBtnText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    errorBox: { backgroundColor: 'rgba(255,69,58,0.1)', padding: 12, borderRadius: 12, marginBottom: 20, flexDirection: 'row', gap: 8, alignItems: 'center' },
    errorText: { color: '#FF453A', fontSize: 12, fontWeight: '600' },
    footer: { alignItems: 'center', marginTop: 40, gap: 16 },
    devBtn: { padding: 10 },
    devText: { color: 'rgba(255,255,255,0.1)', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    copyright: { color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: '600', letterSpacing: 1 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
    accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
    accountInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
    accountAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: ShopifyTheme.colors.accent, fontWeight: '900', fontSize: 18 },
    accountName: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    accountEmail: { color: ShopifyTheme.colors.textMuted, fontSize: 13 },
});
