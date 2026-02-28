const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Đảm bảo hỗ trợ đuôi file .wasm cho Expo Web
if (!config.resolver.assetExts.includes('wasm')) {
    config.resolver.assetExts.push('wasm');
}

module.exports = config;
