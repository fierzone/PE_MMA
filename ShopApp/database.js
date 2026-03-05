
import * as SQLite from 'expo-sqlite';

import { Platform, Alert } from 'react-native';

const DATABASE_NAME = 'shop.db';

// Khởi tạo cơ sở dữ liệu và tạo bảng nếu chưa tồn tại
export const initDatabase = async () => {
    if (Platform.OS === 'web') {
        console.warn("SQLite không được hỗ trợ trên trình duyệt web. Vui lòng chạy trên thiết bị di động (Expo Go).");
        return null;
    }

    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT,
      text TEXT,
      completed INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      priority INTEGER DEFAULT 1,
      category TEXT DEFAULT 'Chung'
    );
  `);

    // Kiểm tra và cập nhật schema (cho các bản cài đặt cũ)
    try {
        await db.execAsync(`
            ALTER TABLE tasks RENAME COLUMN text TO title;
        `);
    } catch (e) { /* Cột title đã tồn tại hoặc cột text không tồn tại */ }

    try {
        await db.execAsync(`
            ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 1;
        `);
    } catch (e) { /* Cột đã tồn tại */ }

    try {
        await db.execAsync(`
            ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT 'Chung';
        `);
    } catch (e) { /* Cột đã tồn tại */ }

    return db;
};

// Lấy danh sách tất cả các công việc, sắp xếp theo độ ưu tiên giảm dần và thời gian tạo mới nhất
export const getTasks = async (db) => {
    return await db.getAllAsync('SELECT * FROM tasks ORDER BY priority DESC, createdAt DESC');
};

// Thêm một công việc mới vào cơ sở dữ liệu
export const addTask = async (db, title, createdAt, priority = 1, category = 'Chung') => {
    const result = await db.runAsync(
        'INSERT INTO tasks (title, completed, createdAt, priority, category) VALUES (?, ?, ?, ?, ?)',
        [title, 0, createdAt, priority, category]
    );
    return result.lastInsertRowId;
};

// Cập nhật nội dung, độ ưu tiên và danh mục của một công việc
export const updateTask = async (db, id, title, priority, category) => {
    await db.runAsync(
        'UPDATE tasks SET title = ?, priority = ?, category = ? WHERE id = ?',
        [title, priority, category, id]
    );
};

// Đảo ngược trạng thái hoàn thành của một công việc
export const toggleTaskCompletion = async (db, id, completed) => {
    await db.runAsync('UPDATE tasks SET completed = ? WHERE id = ?', [completed ? 1 : 0, id]);
};

// Xóa một công việc khỏi cơ sở dữ liệu
export const deleteTask = async (db, id) => {
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
};
