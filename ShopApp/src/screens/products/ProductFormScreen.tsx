import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    KeyboardAvoidingView, Platform, Alert, TouchableOpacity, StatusBar
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useProduct } from '../../context/ProductContext';
import { Ionicons } from '@expo/vector-icons';
import { Tier } from '../../types';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import { FormInput } from '../../components/FormInput';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductForm'>;

export const ProductFormScreen: React.FC<Props> = ({ route, navigation }) => {
    const { product } = route.params || {};
    const isEditing = !!product;
    const { addProduct, updateProduct } = useProduct();

    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price?.toString() || '');
    const [image, setImage] = useState(product?.image || '');
    const [tier, setTier] = useState<Tier>(product?.tier || 'Basic');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !price || !tier) {
            Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
            return;
        }

        setLoading(true);
        const productData = {
            name,
            description,
            price: parseFloat(price),
            image,
            tier,
        };

        try {
            let success = false;
            if (isEditing) {
                success = await updateProduct({ ...productData, id: product!.id });
            } else {
                success = await addProduct(productData);
            }

            if (success) {
                navigation.goBack();
            } else {
                Alert.alert('Lỗi', 'Không thể lưu bản ghi vào hệ thống.');
            }
        } catch (e) {
            Alert.alert('Lỗi', 'Đã xảy ra lỗi không xác định.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.chapterMarker}>INVENTORY MANAGEMENT</Text>
                    <Text style={styles.title}>{isEditing ? 'Cập Nhật' : 'Tạo Mới'}</Text>
                    <Text style={styles.titleAccent}>Sản Phẩm.</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>

                        <FormInput
                            label="TÊN SẢN PHẨM *"
                            value={name}
                            onChangeText={setName}
                            placeholder="VD: Smart Watch Pro"
                        />

                        <FormInput
                            label="MÔ TẢ CHI TIẾT"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Nhập mô tả sản phẩm..."
                            inputStyle={styles.textArea}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <FormInput
                                    label="GIÁ NIÊM YẾT ($) *"
                                    value={price}
                                    onChangeText={setPrice}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>PHÂN CẤP TIER *</Text>
                                <View style={styles.tierPicker}>
                                    {(['Basic', 'Pro', 'Premium'] as Tier[]).map((t) => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[styles.tierIconBtn, tier === t && styles.tierIconBtnActive]}
                                            onPress={() => setTier(t)}
                                        >
                                            <Text style={[styles.tierIconText, tier === t && styles.tierIconTextActive]}>
                                                {t[0]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <FormInput
                            label="URL HÌNH ẢNH"
                            value={image}
                            onChangeText={setImage}
                            placeholder="https://..."
                            autoCapitalize="none"
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.submitBtnText}>{loading ? 'ĐANG LƯU...' : 'HOÀN TẤT THAY ĐỔI'}</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { padding: 32, paddingTop: 60, backgroundColor: '#000' },
    backBtn: { marginBottom: 24 },
    chapterMarker: { color: ShopifyTheme.colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 16 },
    title: { color: '#FFF', fontSize: 40, fontWeight: '900', letterSpacing: -1 },
    titleAccent: { color: ShopifyTheme.colors.accent, fontSize: 40, fontWeight: '900', letterSpacing: -3, marginTop: -8 },
    scrollContent: { paddingHorizontal: 32, paddingBottom: 60 },
    form: { gap: 8 },
    inputGroup: { marginBottom: 20 },
    label: { color: ShopifyTheme.colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' },
    textArea: { height: 120, paddingTop: 16, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 20 },
    tierPicker: { flexDirection: 'row', gap: 10, height: 56 },
    tierIconBtn: {
        flex: 1, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    tierIconBtnActive: { backgroundColor: ShopifyTheme.colors.accent, borderColor: ShopifyTheme.colors.accent },
    tierIconText: { color: 'rgba(255,255,255,0.3)', fontWeight: '900', fontSize: 14 },
    tierIconTextActive: { color: '#000' },
    submitBtn: {
        backgroundColor: '#FFF', height: 64, borderRadius: 100,
        alignItems: 'center', justifyContent: 'center', marginTop: 20,
    },
    submitBtnText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});
