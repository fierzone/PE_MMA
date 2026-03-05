import { SQLiteDatabase } from 'expo-sqlite';

export async function initDatabase(db: SQLiteDatabase) {
    try {
        console.log('[Database] System initialization starting...');

        // 1. Luôn bật Foreign Keys để bảo vệ toàn vẹn dữ liệu
        await db.execAsync('PRAGMA foreign_keys = ON;');

        // 2. Tạo cấu trúc bảng chuẩn
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fullName TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'customer'
            );
            
            CREATE TABLE IF NOT EXISTS Products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                image TEXT,
                tier TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS Cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                productId INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS Orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                totalAmount REAL NOT NULL,
                createdAt TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            );
            
            CREATE TABLE IF NOT EXISTS OrderItems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId INTEGER NOT NULL,
                productId INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS Licenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                productId INTEGER NOT NULL,
                orderId INTEGER NOT NULL,
                licenseKey TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                activatedAt TEXT NOT NULL,
                expiresAt TEXT,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS SavedAccounts (
                email TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                fullName TEXT,
                lastUsed TEXT NOT NULL
            );
        `);

        // 3. ─── SCHEMA INTEGRITY CHECK ───
        // Check if Cart and Orders have userId column (common source of "no such column: userId" error)
        let needsRecreate = false;
        try {
            const cartInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(Cart)');
            const hasUserIdInCart = cartInfo.some(col => col.name === 'userId');

            const ordersInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(Orders)');
            const hasUserIdInOrders = ordersInfo.some(col => col.name === 'userId');

            if (!hasUserIdInCart || !hasUserIdInOrders) {
                console.warn('[Database] Schema mismatch detected: Missing userId column. Recreating tables...');
                needsRecreate = true;
            }
        } catch (e) {
            // Tables might not exist yet, CREATE TABLE IF NOT EXISTS will handle it
        }

        if (needsRecreate) {
            await db.execAsync(`
                DROP TABLE IF EXISTS OrderItems;
                DROP TABLE IF EXISTS Licenses;
                DROP TABLE IF EXISTS Cart;
                DROP TABLE IF EXISTS Orders;
                
                CREATE TABLE IF NOT EXISTS Cart (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER NOT NULL,
                    productId INTEGER NOT NULL,
                    quantity INTEGER NOT NULL,
                    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
                    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS Orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER NOT NULL,
                    totalAmount REAL NOT NULL,
                    createdAt TEXT NOT NULL,
                    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
                );
                
                CREATE TABLE IF NOT EXISTS OrderItems (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    orderId INTEGER NOT NULL,
                    productId INTEGER NOT NULL,
                    quantity INTEGER NOT NULL,
                    price REAL NOT NULL,
                    FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
                    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS Licenses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER NOT NULL,
                    productId INTEGER NOT NULL,
                    orderId INTEGER NOT NULL,
                    licenseKey TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    activatedAt TEXT NOT NULL,
                    expiresAt TEXT,
                    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
                );
            `);
        }

        // 4. ─── LOGIC DỌN DẸP TRIỆT ĐỂ (Dữ liệu cũ không tương thích) ───
        // Chúng ta kiểm tra sự hiện diện của bất kỳ sản phẩm cũ nào (YouTube, Canva, Netflix, Capcut)
        let oldProducts: { id: number }[] = [];
        try {
            oldProducts = await db.getAllAsync<{ id: number }>(
                "SELECT id FROM Products WHERE name LIKE '%YouTube%' OR name LIKE '%Canva%' OR name LIKE '%Netflix%' OR name LIKE '%Capcut%' OR name LIKE '%(1 Tháng)%'"
            );
        } catch (e) {
            // Nếu bảng chưa có thì bỏ qua check
        }

        if (oldProducts.length > 0) {
            console.log('[Database] Found legacy data. Performing deep clean...');
            await db.execAsync(`
                DELETE FROM Cart;
                DELETE FROM OrderItems;
                DELETE FROM Orders;
                DELETE FROM Licenses;
                DELETE FROM Products;
            `);
        }

        // 5. ─── NẠP DỮ LIỆU AI MỚI (SEEDING) ───
        const prodCheck = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Products');
        if (prodCheck && prodCheck.count === 0) {
            console.log('[Database] Seeding fresh AI packages list...');
            await db.execAsync(`
                INSERT INTO Products (name, description, price, image, tier) VALUES
                ('Claude 3.5 Opus', 'Trải nghiệm sức mạnh suy luận mới từ Anthropic.', 25.00, 'https://images.seeklogo.com/logo-png/55/2/claude-logo-png_seeklogo-554540.png', 'Premium'),
                ('GPT-4o Plus', 'Phiên bản AI đa phương thức tốt nhất của OpenAI.', 20.00, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/960px-ChatGPT-Logo.svg.png', 'Pro'),
                ('Cursor Pro', 'Công cụ lập trình tích hợp AI hàng đầu cho dev.', 20.00, 'https://raw.githubusercontent.com/getcursor/cursor/main/assets/icon.png', 'Pro'),
                ('GitHub Copilot', 'Trợ lý thông minh cho mọi dòng code.', 10.00, 'https://brandlogos.net/wp-content/uploads/2025/06/github_copilot_icon-logo_brandlogos.net_jxl0m-300x249.png', 'Basic'),
                ('Midjourney Pro', 'Sáng tạo hình ảnh nghệ thuật không giới hạn.', 30.00, 'https://www.fredzone.org/wp-content/uploads/2023/03/R-1.png', 'Premium');
            `);
        }

        // Đảm bảo các tài khoản mẫu luôn sẵn sàng
        const adminEmail = 'admin@store.com';
        const demoEmail = 'customer@demo.com';

        const hasAdmin = await db.getFirstAsync('SELECT id FROM Users WHERE email = ?', [adminEmail]);
        if (!hasAdmin) {
            await db.runAsync(
                "INSERT INTO Users (fullName, email, password, role) VALUES (?, ?, ?, ?)",
                ['Store Admin', adminEmail, 'admin123', 'admin']
            );
        }

        const hasDemo = await db.getFirstAsync('SELECT id FROM Users WHERE email = ?', [demoEmail]);
        if (!hasDemo) {
            await db.runAsync(
                "INSERT INTO Users (fullName, email, password, role) VALUES (?, ?, ?, ?)",
                ['Demo Customer', demoEmail, '123456', 'customer']
            );
        }

        console.log('[Database] System synched and ready.');
    } catch (error) {
        console.error('[Database] CRITICAL INIT FAILED:', error);
    }
}
