const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Thêm hỗ trợ tệp .wasm cho expo-sqlite trên nền tảng web
config.resolver.assetExts.push('wasm');

module.exports = config;
