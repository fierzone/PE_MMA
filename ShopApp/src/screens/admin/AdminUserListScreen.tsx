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
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filtered = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

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
                            setShowDetailModal(true);
                        }}
                    >
                        <Ionicons name="eye-outline" size={18} color="rgba(255,255,255,0.7)" />
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
                </View>
            </View>

            {/* Table header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 5 }]}>USER</Text>
                <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>DETAIL</Text>
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

            {/* Detail Modal */}
            <Modal visible={showDetailModal} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Chi Tiết Khách Hàng</Text>
                                <Text style={styles.modalSub}>ID: #{selectedUser?.id}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.detailGroup}>
                                <Text style={styles.detailLabel}>HỌ VÀ TÊN</Text>
                                <Text style={styles.detailValue}>{selectedUser?.fullName}</Text>
                            </View>

                            <View style={styles.detailGroup}>
                                <Text style={styles.detailLabel}>EMAIL</Text>
                                <Text style={styles.detailValue}>{selectedUser?.email}</Text>
                            </View>

                            <View style={styles.detailGroup}>
                                <Text style={styles.detailLabel}>LOẠI TÀI KHOẢN</Text>
                                <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>
                                    {selectedUser?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                </Text>
                            </View>

                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
                                <Text style={styles.infoText}>
                                    Bạn đang ở chế độ Chỉ Xem. Để thay đổi dữ liệu, hãy liên hệ với bộ phận kỹ thuật.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowDetailModal(false)}>
                                <Text style={styles.confirmBtnText}>Đã hiểu</Text>
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
    detailGroup: {
        marginBottom: 20,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(148,163,184,0.08)',
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 18,
    },
});
