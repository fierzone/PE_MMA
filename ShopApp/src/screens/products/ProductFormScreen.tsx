import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useProduct } from '../../context/ProductContext';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { Tier } from '../../types';

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
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
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
                Alert.alert('Lỗi', 'Không thể lưu sản phẩm.');
            }
        } catch (e) {
            Alert.alert('Lỗi', 'Đã xảy ra lỗi không xác định.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{isEditing ? 'Cập nhật Dịch vụ' : 'Dịch vụ Mới'}</Text>
                        <Text style={styles.subtitle}>Niêm yết giải pháp AI mới lên thị trường</Text>
                    </View>

                    <View style={styles.form}>
                        <FormInput
                            label="Tên dịch vụ *"
                            value={name}
                            onChangeText={setName}
                            placeholder="VD: OpenAI GPT-4"
                        />
                        <FormInput
                            label="Mô tả"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Tổng quan ngắn gọn về dịch vụ"
                            style={{ height: 100 }}
                            inputStyle={{ textAlignVertical: 'top' }}
                        />
                        <FormInput
                            label="Giá ($) *"
                            value={price}
                            onChangeText={setPrice}
                            placeholder="0.00"
                            keyboardType="numeric"
                        />
                        <FormInput
                            label="URL Hình ảnh"
                            value={image}
                            onChangeText={setImage}
                            placeholder="https://example.com/image.png"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Gói thuê bao *</Text>
                        <View style={styles.tierContainer}>
                            {(['Basic', 'Pro', 'Premium'] as Tier[]).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.tierOption, tier === t && styles.tierOptionActive]}
                                    onPress={() => setTier(t)}
                                >
                                    <Text style={[styles.tierText, tier === t && styles.tierTextActive]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Button
                            title={isEditing ? 'Lưu Thay đổi' : 'Tạo Sản phẩm'}
                            onPress={handleSubmit}
                            isLoading={loading}
                            style={styles.submitBtn}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F8F8',
    },
    scrollContent: {
        padding: 32,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111617',
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#A1A1AA',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tierContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    tierOption: {
        flex: 1,
        height: 48,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    tierOptionActive: {
        borderColor: '#16869C',
        backgroundColor: '#F0F9FB',
    },
    tierText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    tierTextActive: {
        color: '#16869C',
        fontWeight: '700',
    },
    submitBtn: {
        height: 60,
        borderRadius: 4,
    },
});
