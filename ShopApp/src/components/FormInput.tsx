import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { ShopifyTheme } from '../theme/ShopifyTheme';

interface FormInputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    error?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    style?: ViewStyle;
    inputStyle?: TextStyle;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType = 'default',
    error,
    autoCapitalize = 'sentences',
    style,
    inputStyle,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputWrapper,
                    isFocused && styles.inputWrapperFocused,
                    error ? styles.inputWrapperError : null,
                ]}
            >
                <TextInput
                    style={[styles.input, inputStyle]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: ShopifyTheme.colors.textMuted,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    inputWrapper: {
        height: 56,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    inputWrapperFocused: {
        borderColor: ShopifyTheme.colors.accent,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    inputWrapperError: {
        borderColor: '#EF4444',
    },
    input: {
        fontSize: 15,
        color: '#FFF',
        fontWeight: '500',
        paddingVertical: 0,
        ...Platform.select({
            web: {
                outlineStyle: 'none',
                borderWidth: 0,
            }
        }) as any,
    },
    errorText: {
        fontSize: 11,
        color: '#EF4444',
        marginTop: 6,
        fontWeight: '600',
    },
});
