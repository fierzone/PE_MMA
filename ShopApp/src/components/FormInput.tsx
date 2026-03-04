import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';

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
                    placeholderTextColor="#a1a1aa" // Gray 400
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
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8', // Slate 400
        marginBottom: 0,
        position: 'absolute',
        top: -18,
        left: 0,
        letterSpacing: 0.5,
    },
    inputWrapper: {
        height: 40,
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0', // Slate 200
        justifyContent: 'flex-end',
        paddingBottom: 4,
    },
    inputWrapperFocused: {
        borderBottomColor: '#16869C', // Primary Teal
        borderBottomWidth: 2,
    },
    inputWrapperError: {
        borderBottomColor: '#EF4444',
    },
    input: {
        fontSize: 15,
        color: '#0F172A', // Slate 900
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
        marginTop: 4,
        fontWeight: '600',
    },
});
