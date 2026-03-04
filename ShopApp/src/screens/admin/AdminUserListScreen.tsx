import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    TouchableOpacity, Modal, TextInput, Alert, Platform, ActivityIndicator, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUsers } from '../../context/UserContext';
import { User } from '../../types';
import { useSQLiteContext } from 'expo-sqlite';

export const AdminUserListScreen: React.FC = () => {
    const { users, isLoading, fetchUsers, deleteUser, resetPassword } = useUsers();
    const db = useSQLiteContext();
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filtered = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (user: User) => {
        if (user.role === 'admin') {
            Alert.alert('Không thể xóa', 'Tài khoản quản trị viên không thể bị xóa.');
            return;
        }
        Alert.alert(
            'Xóa người dùng',
            `Xóa "${user.fullName}" (${user.email})? Hành động này không thể hoàn tác.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa', style: 'destructive',
                    onPress: async () => {
                        await deleteUser(user.id);
                    }
                },
            ]
        );
    };

    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            setPasswordError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        setResetting(true);
        const ok = await resetPassword(selectedUser!.id, newPassword);
        setResetting(false);
        if (ok) {
            setShowResetModal(false);
            setNewPassword('');
            setSelectedUser(null);
            Alert.alert('Thành công', 'Mật khẩu đã được đặt lại.');
        } else {
            setPasswordError('Không thể thực hiện. Hãy thử lại.');
        }
    };

    const handleResetDatabase = () => {
        Alert.alert(
            '⚠️ Xóa tất cả khách hàng?',
            'Hành động này sẽ xóa toàn bộ người dùng (trừ admin). Bạn chắc chắn?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa', style: 'destructive',
                    onPress: async () => {
                        await db.runAsync("DELETE FROM Users WHERE role != 'admin'");
                        await fetchUsers();
                        Alert.alert('Xong', 'Tất cả khách hàng đã bị xóa.');
                    }
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: User }) => {
        const isAdminUser = item.role === 'admin';
        return (
            <View style={styles.row}>
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: isAdminUser ? '#0F172A' : '#16869C' }]}>
                    <Text style={styles.avatarText}>
                        {item.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                </View>

                {/* Info */}
                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName} numberOfLines={1}>{item.fullName}</Text>
                        {isAdminUser && (
                            <View style={styles.adminBadge}>
                                <Text style={styles.adminBadgeText}>ADMIN</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
                    <Text style={styles.userId}>ID: #{item.id} · {isAdminUser ? 'Quản trị viên' : 'Khách hàng'}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                            setSelectedUser(item);
                            setNewPassword('');
                            setPasswordError('');
                            setShowResetModal(true);
                        }}
                    >
                        <Ionicons name="key-outline" size={15} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, isAdminUser && styles.disabledBtn]}
                        onPress={() => !isAdminUser && handleDelete(item)}
                    >
                        <Ionicons name="trash-outline" size={15} color={isAdminUser ? 'rgba(255,255,255,0.15)' : '#FF453A'} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            {/* Header */}
            <View style={styles.pageHeader}>
                <View>
                    <Text style={styles.pageTitle}>Quản lý Khách hàng</Text>
                    <Text style={styles.pageSub}>
                        {users.length} người dùng đã đăng ký
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={15} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm người dùng..."
                            placeholderTextColor="#94A3B8"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <TouchableOpacity style={styles.dangerBtn} onPress={handleResetDatabase}>
                        <Ionicons name="refresh-outline" size={16} color="#EF4444" />
                        <Text style={styles.dangerBtnText}>Xóa hết</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Table header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 5 }]}>USER</Text>
                <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>ACTIONS</Text>
            </View>
            <View style={styles.divider} />

            {/* List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#5EEAD4" />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshing={isLoading}
                    onRefresh={fetchUsers}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
                        </View>
                    }
                />
            )}

            {/* Reset Password Modal */}
            <Modal visible={showResetModal} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Reset Password</Text>
                                <Text style={styles.modalSub}>{selectedUser?.email}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowResetModal(false)}>
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.inputLabel}>NEW PASSWORD</Text>
                            <View style={[styles.inputWrap, passwordError ? styles.inputError : null]}>
                                <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" />
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Min. 6 characters"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry
                                    value={newPassword}
                                    onChangeText={(t) => { setNewPassword(t); setPasswordError(''); }}
                                />
                            </View>
                            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowResetModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, resetting && { opacity: 0.7 }]}
                                onPress={handleResetPassword}
                                disabled={resetting}
                            >
                                <Text style={styles.confirmBtnText}>
                                    {resetting ? 'Saving...' : 'Save Changes'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    pageHeader: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: Platform.OS === 'web' ? 'flex-end' : 'flex-start',
        paddingHorizontal: 32,
        paddingTop: 48,
        paddingBottom: 24,
        gap: 16,
        backgroundColor: '#000',
    },
    pageTitle: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1.5,
        marginBottom: 4,
    },
    pageSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 100,
        paddingHorizontal: 16,
        height: 44,
        minWidth: 200,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#FFF',
    },
    dangerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,69,58,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,69,58,0.2)',
        borderRadius: 100,
        paddingHorizontal: 16,
        height: 44,
    },
    dangerBtnText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#FF453A',
        letterSpacing: 0.5,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 32,
        paddingVertical: 12,
    },
    th: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1.5,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginHorizontal: 32,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
        gap: 16,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    userInfo: {
        flex: 5,
        gap: 2,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFF',
    },
    adminBadge: {
        backgroundColor: 'rgba(94,234,212,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(94,234,212,0.3)',
        borderRadius: 100,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    adminBadgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#5EEAD4',
        letterSpacing: 1,
    },
    userEmail: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
    },
    userId: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.2)',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    actions: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#94A3B8',
    },

    // Modal
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modal: {
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#111827',
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 28,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.07)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -0.5,
    },
    modalSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 2,
    },
    modalBody: {
        padding: 28,
        gap: 12,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 2,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    inputError: { borderColor: '#FF453A' },
    modalInput: {
        flex: 1,
        fontSize: 14,
        color: '#FFF',
    },
    errorText: { fontSize: 12, color: '#FF453A', fontWeight: '600' },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        padding: 28,
        paddingTop: 0,
    },
    cancelBtn: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 100,
    },
    cancelBtnText: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '700' },
    confirmBtn: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        backgroundColor: '#FFF',
        borderRadius: 100,
    },
    confirmBtnText: { fontSize: 13, fontWeight: '900', color: '#000', letterSpacing: 0.5 },
});
