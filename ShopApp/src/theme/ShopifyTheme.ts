import { Platform } from 'react-native';

export const ShopifyTheme = {
    colors: {
        background: '#000000',
        card: '#111827',
        primary: '#FFFFFF',
        accent: '#5EEAD4', // Electric Teal
        text: '#FFFFFF',
        textMuted: '#94A3B8',
        border: 'rgba(255, 255, 255, 0.1)',
        buttonBg: '#FFFFFF',
        buttonText: '#000000',
        burgundy: '#3A1D2E', // Sidekick/Agentic color
    },
    typography: {
        megaTitle: {
            fontSize: Platform.OS === 'web' ? 88 : 56,
            fontWeight: '900' as const,
            letterSpacing: -2,
        },
        sectionTitle: {
            fontSize: 48,
            fontWeight: '900' as const,
            letterSpacing: -1.5,
        },
        cardTitle: {
            fontSize: 24,
            fontWeight: '800' as const,
            letterSpacing: -1,
        },
        body: {
            fontSize: 16,
            lineHeight: 24,
        },
        roman: {
            fontSize: 12,
            fontWeight: '700' as const,
            letterSpacing: 3,
            opacity: 0.5,
        }
    },
    spacing: {
        xl: 80,
        lg: 40,
        md: 24,
        sm: 16,
        xs: 8,
    },
    borderRadius: {
        pill: 100,
        card: 32,
        inner: 16,
    }
};
