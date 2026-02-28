import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SIZE, gs, ELEVATION } from '../theme/theme';
import { addProduct, updateProduct } from '../database/database';

function FormField({ label, icon, value, onChange, placeholder, keyboard, multiline, error }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={{ marginBottom: 20 }}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputWrap, multiline && styles.inputWrapMulti, focused && styles.inputFocused, error && styles.inputError]}>
                <Ionicons name={icon} size={18} color={focused ? COLORS.primary : COLORS.textMuted} style={multiline && { marginTop: 4 }} />
                <TextInput
                    style={[styles.input, multiline && styles.inputMulti]}
                    placeholder={placeholder} placeholderTextColor={COLORS.textMuted}
                    value={value} onChangeText={onChange}
                    keyboardType={keyboard || 'default'}
                    multiline={multiline} autoCapitalize="none"
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                />
            </View>
            {error ? <Text style={styles.errText}>{error}</Text> : null}
        </View>
    );
}

export default function ProductFormScreen({ route, navigation }) {
    const editProduct = route.params?.product || null;
    const isEdit = !!editProduct;

    const [form, setForm] = useState({
        name: editProduct?.name || '',
        description: editProduct?.description || '',
        price: editProduct?.price?.toString() || '',
        imageUrl: editProduct?.imageUrl || '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(editProduct?.imageUrl || '');

    const set = (k, v) => {
        setForm(p => ({ ...p, [k]: v }));
        setErrors(p => ({ ...p, [k]: '' }));
        if (k === 'imageUrl') setPreview(v);
    };

    // Xác thực Input nhập liệu
    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Chưa điền tên SP!';
        if (!form.price.trim()) e.price = 'Bắt buộc điền giá';
        else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) e.price = 'Giá > 0';
        return e;
    };

    // Nhấn Lưu Giao Dịch
    const handleSubmit = async () => {
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;
        setLoading(true);
        try {
            if (isEdit) {
                await updateProduct(editProduct.id, form.name.trim(), form.description.trim(), form.price, form.imageUrl.trim());
                Alert.alert('✅ Lưu Thành Công', 'Sản phẩm đã được cập nhật!', [{ text: 'Tiếp Tục', onPress: () => navigation.goBack() }]);
            } else {
                await addProduct(form.name.trim(), form.description.trim(), form.price, form.imageUrl.trim());
                Alert.alert('✅ Thành Công Mới', 'Sản phầm đã thêm danh sách!', [{ text: 'Đồng ý', onPress: () => navigation.goBack() }]);
            }
        } catch (err) {
            Alert.alert('Chặn Lỗi', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <SafeAreaView style={gs.safe}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={gs.flex}>

                    {/* Menu Điều Hướng (Top Bar) */}
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <View style={styles.backBtnBg}>
                                <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.topTitle}>{isEdit ? 'Chỉnh Sửa SP' : 'Thêm Sinh Phẩm'}</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        {/* Box Hiển Thị Bức Ảnh Review (Image Preview) */}
                        <View style={styles.previewWrap}>
                            {preview ? (
                                <Image source={{ uri: preview }} style={styles.preview} resizeMode="cover" />
                            ) : (
                                <View style={styles.previewPlaceholder}>
                                    <Ionicons name="images-outline" size={48} color={COLORS.borderHigh} />
                                    <Text style={styles.previewText}>Chưa rõ có ảnh URL không</Text>
                                    <Text style={styles.previewSub}>Dán đường truyền mạng link .jpg .png xuống dưới.</Text>
                                </View>
                            )}
                        </View>

                        {/* Các thành phần khai báo Form */}
                        <View style={styles.card}>
                            <Text style={gs.sectionTitle}>Cấu hình thông số thẻ</Text>
                            <View style={{ height: 16 }} />

                            <FormField label="Tên gọi * (Bắt Buộc)" icon="cube-outline" placeholder="VD: Tai nghe Premium"
                                value={form.name} onChange={v => set('name', v)} error={errors.name} />

                            <View style={gs.row}>
                                <View style={{ flex: 1, marginRight: 12 }}>
                                    <FormField label="Mức Cước Phí ($) *" icon="pricetag-outline" placeholder="0.00"
                                        value={form.price} onChange={v => set('price', v)} keyboard="decimal-pad" error={errors.price} />
                                </View>
                            </View>

                            {/* Ô Nhập Đường Dẫn Link Ảnh Bọc Ngoài */}
                            <FormField label="Đường dẫn nguồn ảnh JPG/PNG Url" icon="link-outline" placeholder="https://..."
                                value={form.imageUrl} onChange={v => set('imageUrl', v)} />

                            <FormField label="Sơ Khảo Mô Tả Chi Tiết" icon="document-text-outline" placeholder="Mô tả cho tiết thêm..."
                                value={form.description} onChange={v => set('description', v)} multiline />

                            {/* Nút Ấn */}
                            <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.8} style={{ marginTop: 12 }}>
                                <LinearGradient colors={COLORS.gradPrimary} style={styles.submitBtn} start={[0, 0]} end={[1, 1]}>
                                    {loading
                                        ? <ActivityIndicator color="#fff" />
                                        : <>
                                            <Ionicons name={isEdit ? 'checkmark-done' : 'add'} size={20} color="#fff" />
                                            <Text style={styles.submitText}>{isEdit ? 'Lưu Áp Dụng Thay Đổi' : 'Chốt Publish Nhóm'}</Text>
                                        </>
                                    }
                                </LinearGradient>
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
    topTitle: { fontSize: SIZE.lg, fontWeight: FONT.bold, color: COLORS.text },
    scroll: { paddingHorizontal: SIZE.pad, paddingBottom: 40 },
    previewWrap: { marginBottom: 24, ...ELEVATION.sm },
    preview: { width: '100%', height: 220, borderRadius: SIZE.rLg, borderWidth: 1, borderColor: COLORS.border },
    previewPlaceholder: {
        width: '100%', height: 220, borderRadius: SIZE.rLg,
        backgroundColor: COLORS.surfaceHigh, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', gap: 8,
    },
    previewText: { color: COLORS.textSoft, fontSize: SIZE.base, fontWeight: FONT.semiBold, marginTop: 8 },
    previewSub: { color: COLORS.textMuted, fontSize: SIZE.sm },
    card: {
        backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.rLg, padding: SIZE.pad2,
        borderWidth: 1, borderColor: COLORS.border, ...ELEVATION.md,
    },
    label: { fontSize: SIZE.xs, fontWeight: FONT.bold, color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
        borderRadius: SIZE.r, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, height: 52,
    },
    inputWrapMulti: { height: 100, alignItems: 'flex-start', paddingTop: 14 },
    inputFocused: { borderColor: COLORS.primary },
    inputError: { borderColor: COLORS.error },
    input: { flex: 1, marginLeft: 10, fontSize: SIZE.base, color: COLORS.text },
    inputMulti: { height: 75, textAlignVertical: 'top' },
    errText: { color: COLORS.error, fontSize: SIZE.xs, marginTop: 6, marginLeft: 4 },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        height: 56, borderRadius: SIZE.r,
    },
    submitText: { fontSize: SIZE.base, fontWeight: FONT.bold, color: '#fff', letterSpacing: 0.5 },
});
