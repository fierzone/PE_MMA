import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    TouchableOpacity, Modal, TextInput, Alert, Platform, ActivityIndicator
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
                        <Ionicons name="key-outline" size={15} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, isAdminUser && styles.disabledBtn]}
                        onPress={() => !isAdminUser && handleDelete(item)}
                    >
                        <Ionicons name="trash-outline" size={15} color={isAdminUser ? '#CBD5E1' : '#EF4444'} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
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
                    <ActivityIndicator color="#16869C" />
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
        backgroundColor: '#F6F8F8',
    },
    pageHeader: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: Platform.OS === 'web' ? 'flex-end' : 'flex-start',
        padding: 24,
        gap: 16,
        backgroundColor: '#F6F8F8',
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -1,
        marginBottom: 4,
    },
    pageSub: {
        fontSize: 14,
        color: '#64748B',
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
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 6,
        paddingHorizontal: 12,
        height: 40,
        minWidth: 200,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
    },
    dangerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        borderRadius: 6,
        paddingHorizontal: 14,
        height: 40,
    },
    dangerBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#EF4444',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    th: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 0.8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 24,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
        gap: 14,
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
        fontWeight: '700',
        color: '#0F172A',
    },
    adminBadge: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    adminBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#92400E',
        letterSpacing: 0.5,
    },
    userEmail: {
        fontSize: 13,
        color: '#64748B',
    },
    userId: {
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    actions: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 6,
    },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
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
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modal: {
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    modalSub: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    modalBody: {
        padding: 24,
        gap: 8,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#F8FAFC',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    modalInput: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '500',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        padding: 24,
        paddingTop: 0,
    },
    cancelBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 6,
    },
    cancelBtnText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '600',
    },
    confirmBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#0F172A',
        borderRadius: 6,
    },
    confirmBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
