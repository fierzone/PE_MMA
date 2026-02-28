import * as SQLite from 'expo-sqlite';

let db = null;

// Khởi tạo kết nối cơ sở dữ liệu
export const getDatabase = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('shopapp.db');
    }
    return db;
};

// Tạo bảng và chèn dữ liệu mẫu ban đầu
export const initializeDatabase = async () => {
    const database = await getDatabase();

    await database.execAsync(`
    PRAGMA journal_mode = WAL;

    -- Bảng người dùng (Users)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    -- Bảng sản phẩm (Products)
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      imageUrl TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    -- Bảng đơn hàng (Orders)
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      totalAmount REAL NOT NULL,
      orderDate TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    -- Bảng chi tiết đơn hàng (Order Items)
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER,
      productId INTEGER,
      productName TEXT,
      price REAL,
      quantity INTEGER,
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );
  `);

    // Thêm dữ liệu sản phẩm mẫu cực đẹp nếu db trống
    const products = await database.getAllAsync('SELECT id FROM products LIMIT 1');
    if (products.length === 0) {
        await database.execAsync(`
      INSERT INTO products (name, description, price, imageUrl) VALUES
        ('Tai nghe chống ồn Sony', 'Tai nghe over-ear cao cấp với thời lượng pin 30h và công nghệ Hi-Res Audio.', 349.00, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80'),
        ('Bàn phím cơ không dây', 'Bàn phím cơ switch Cherry MX đỏ, có đèn nền RGB và kết nối Bluetooth siêu nhạy.', 129.50, 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80'),
        ('Đồng hồ thông minh', 'Theo dõi nhịp tim, đo oxy trong máu và màn hình AMOLED sắc nét tràn viền.', 299.99, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=400&q=80'),
        ('Máy ảnh Kỹ thuật số Retro', 'Cảm biến full-frame, quay video 4K sắc nét và thiết kế hoài cổ tuyệt đẹp.', 899.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80'),
        ('Kính râm thời trang', 'Kính râm phân cực bảo vệ mắt tia UV400, gọng kim loại titan siêu nhẹ.', 45.00, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80'),
        ('Giày Sneaker Phá Cách', 'Thiết kế form chuẩn, phối màu thời thượng dành cho dân chơi hệ streetwear.', 110.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'),
        ('Nước hoa nam cao cấp', 'Hương gỗ trầm ấm tự nhiên, lưu hương lâu đến 12h, phong cách lịch lãm.', 85.00, 'https://images.unsplash.com/photo-1523293115678-d29062015096?auto=format&fit=crop&w=400&q=80'),
        ('Túi xách da nữ', 'Chất liệu da bò thật 100%, thiết kế phong cách thanh lịch hiện đại dạo phố.', 150.00, 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=400&q=80');
    `);
    }
};

// ─── Lệnh thao tác với Người Dùng (User) ────────────────────────────────

// Đăng ký tài khoản
export const registerUser = async (fullName, email, password) => {
    const database = await getDatabase();
    const existing = await database.getFirstAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) throw new Error('Email này đã được sử dụng!'); // Thông báo nếu email trùng lặp
    await database.runAsync(
        'INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)',
        [fullName, email, password]
    );
};

// Đăng nhập
export const loginUser = async (email, password) => {
    const database = await getDatabase();
    const user = await database.getFirstAsync(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
    );
    if (!user) throw new Error('Email hoặc mật khẩu không chính xác!'); // Xử lý sai mật khẩu
    return user;
};

// ─── Lệnh thao tác với Sản Phẩm (Products) ────────────────────────────────

// Lấy danh sách toàn bộ sản phẩm
export const getAllProducts = async () => {
    const database = await getDatabase();
    return await database.getAllAsync('SELECT * FROM products ORDER BY createdAt DESC');
};

// Xem chi tiết 1 sản phẩm
export const getProductById = async (id) => {
    const database = await getDatabase();
    return await database.getFirstAsync('SELECT * FROM products WHERE id = ?', [id]);
};

// Thêm sản phẩm mới (Create)
export const addProduct = async (name, description, price, imageUrl) => {
    const database = await getDatabase();
    const result = await database.runAsync(
        'INSERT INTO products (name, description, price, imageUrl) VALUES (?, ?, ?, ?)',
        [name, description, parseFloat(price), imageUrl]
    );
    return result.lastInsertRowId;
};

// Cập nhật sản phẩm (Update)
export const updateProduct = async (id, name, description, price, imageUrl) => {
    const database = await getDatabase();
    await database.runAsync(
        'UPDATE products SET name = ?, description = ?, price = ?, imageUrl = ? WHERE id = ?',
        [name, description, parseFloat(price), imageUrl, id]
    );
};

// Xóa sản phẩm (Delete)
export const deleteProduct = async (id) => {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM products WHERE id = ?', [id]);
};

// ─── Lệnh thao tác với Giỏ hàng & Thống kê doanh thu ─────────────────────

// Thanh toán giỏ hàng: tạo đơn hàng & chi tiết đơn hàng
export const placeOrder = async (userId, cartItems, totalAmount) => {
    const database = await getDatabase();

    // Lưu bảng orders chính
    const orderResult = await database.runAsync(
        'INSERT INTO orders (userId, totalAmount) VALUES (?, ?)',
        [userId, totalAmount]
    );
    const orderId = orderResult.lastInsertRowId;

    // Lưu danh sách từng sản phẩm order_items
    for (const item of cartItems) {
        await database.runAsync(
            'INSERT INTO order_items (orderId, productId, productName, price, quantity) VALUES (?, ?, ?, ?, ?)',
            [orderId, item.id, item.name, item.price, item.quantity]
        );
    }
    return orderId;
};

// Lấy lịch sử order của User
export const getOrders = async (userId) => {
    const database = await getDatabase();
    return await database.getAllAsync(
        'SELECT * FROM orders WHERE userId = ? ORDER BY orderDate DESC',
        [userId]
    );
};

// Lấy chi tiết các sản phẩm trong 1 order
export const getOrderItems = async (orderId) => {
    const database = await getDatabase();
    return await database.getAllAsync(
        'SELECT * FROM order_items WHERE orderId = ?',
        [orderId]
    );
};

// Hàm thống kê doanh thu theo Tổng, Ngày, Tháng, Năm
export const getRevenueStats = async (userId) => {
    const database = await getDatabase();
    const total = await database.getFirstAsync(
        'SELECT SUM(totalAmount) as total FROM orders WHERE userId = ?',
        [userId]
    );
    const daily = await database.getAllAsync(
        `SELECT date(orderDate) as date, SUM(totalAmount) as revenue, COUNT(*) as count
     FROM orders WHERE userId = ?
     GROUP BY date(orderDate) ORDER BY date DESC LIMIT 30`,
        [userId]
    );
    const monthly = await database.getAllAsync(
        `SELECT strftime('%Y-%m', orderDate) as month, SUM(totalAmount) as revenue, COUNT(*) as count
     FROM orders WHERE userId = ?
     GROUP BY strftime('%Y-%m', orderDate) ORDER BY month DESC LIMIT 12`,
        [userId]
    );
    const yearly = await database.getAllAsync(
        `SELECT strftime('%Y', orderDate) as year, SUM(totalAmount) as revenue, COUNT(*) as count
     FROM orders WHERE userId = ?
     GROUP BY strftime('%Y', orderDate) ORDER BY year DESC`,
        [userId]
    );

    return {
        total: total?.total || 0,
        daily,
        monthly,
        yearly
    };
};
