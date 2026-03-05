import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, StatusBar
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import Toast from 'react-native-toast-message';
import { FormInput } from '../../components/FormInput';

type Props = NativeStackScreenProps<any, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const { register } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleRegister = async () => {
        if (!fullName || !email || !password || confirmPassword === undefined) {
            setError('Vui lòng điền đầy đủ tất cả các trường.');
            return;
        }

        if (!validateEmail(email)) {
            setError('Định dạng email không hợp lệ.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Xác nhận mật khẩu không khớp.');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await register(fullName, email, password);
            if (res.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Đăng ký thành công',
                    text2: 'Vui lòng đăng nhập để bắt đầu.'
                });
                navigation.navigate('Login');
            } else {
                setError(res.error || 'Cần kiểm tra lại thông tin.');
            }
        } catch (e) {
            setError('Lỗi hệ thống trong quá trình khởi tạo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.chapterMarker}>CHAPTER II · ONBOARDING</Text>
                        <Text style={styles.title}>Create</Text>
                        <Text style={styles.titleAccent}>Identity.</Text>
                        <Text style={styles.subTitle}>Thiết lập hồ sơ định danh của bạn trên hệ thống Minimalist Prime.</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.tabs}>
                            <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.tabText}>ĐĂNG NHẬP</Text>
                            </TouchableOpacity>
                            <View style={styles.activeTab}>
                                <Text style={styles.activeTabText}>ĐĂNG KÝ</Text>
                            </View>
                        </View>

                        <FormInput
                            label="HỌ VÀ TÊN"
                            placeholder="VD: Nguyễn Văn A"
                            value={fullName}
                            onChangeText={(t) => { setFullName(t); setError(null); }}
                        />

                        <FormInput
                            label="EMAIL HỆ THỐNG"
                            placeholder="email@example.com"
                            value={email}
                            onChangeText={(t) => { setEmail(t); setError(null); }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <FormInput
                            label="MẬT MÃ TRUY CẬP"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={(t) => { setPassword(t); setError(null); }}
                            secureTextEntry
                        />

                        <FormInput
                            label="XÁC NHẬN MẬT MÃ"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
                            secureTextEntry
                        />

                        {error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={16} color="#FF453A" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text style={styles.submitBtnText}>{loading ? 'ĐANG KHỞI TẠO...' : 'HOÀN TẤT ĐĂNG KÝ'}</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scroll: { flexGrow: 1, paddingBottom: 60 },
    header: { padding: 40, paddingTop: 60 },
    backBtn: { marginBottom: 32 },
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
    submitBtn: { backgroundColor: '#FFF', height: 60, borderRadius: 100, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    submitBtnText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    errorBox: { backgroundColor: 'rgba(255,69,58,0.1)', padding: 12, borderRadius: 12, marginBottom: 20, flexDirection: 'row', gap: 8, alignItems: 'center' },
    errorText: { color: '#FF453A', fontSize: 12, fontWeight: '600', flex: 1 },
});
