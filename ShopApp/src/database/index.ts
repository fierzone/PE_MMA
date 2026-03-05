import { SQLiteDatabase } from 'expo-sqlite';

export async function initDatabase(db: SQLiteDatabase) {
    try {
        // 1. Users with role column
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fullName TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'customer'
            );
        `);

        // Migration: add role column if missing (for existing DBs)
        try {
            await db.execAsync(`ALTER TABLE Users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer';`);
        } catch (_) { /* column already exists */ }

        // 2. Products
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                image TEXT,
                tier TEXT NOT NULL
            );
        `);

        // 3. Cart
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                productId INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY (userId) REFERENCES Users(id),
                FOREIGN KEY (productId) REFERENCES Products(id)
            );
        `);

        // 4. Orders
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                totalAmount REAL NOT NULL,
                createdAt TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES Users(id)
            );
        `);

        // 5. OrderItems
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS OrderItems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId INTEGER NOT NULL,
                productId INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (orderId) REFERENCES Orders(id),
                FOREIGN KEY (productId) REFERENCES Products(id)
            );
        `);

        // 6. Licenses (Auto-activation)
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Licenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                productId INTEGER NOT NULL,
                orderId INTEGER NOT NULL,
                licenseKey TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                activatedAt TEXT NOT NULL,
                expiresAt TEXT,
                FOREIGN KEY (userId) REFERENCES Users(id),
                FOREIGN KEY (productId) REFERENCES Products(id),
                FOREIGN KEY (orderId) REFERENCES Orders(id)
            );
        `);

        // 7. Saved Accounts (for Remember Me)
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS SavedAccounts (
                email TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                fullName TEXT,
                lastUsed TEXT NOT NULL
            );
        `);

        // Seed Products if empty
        const productCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Products');
        if (productCount && productCount.count === 0) {
            await db.execAsync(`
                INSERT INTO Products (name, description, price, image, tier) VALUES
                ('Claude 3.5 Opus', 'Mô hình suy luận mạnh nhất của Anthropic. Xuất sắc trong lập trình và phân tích.', 20.00, 'https://images.seeklogo.com/logo-png/55/2/claude-logo-png_seeklogo-554540.png', 'Premium'),
                ('GPT-4o Plus', 'Trải nghiệm đa phương thức từ OpenAI. Thông minh, nhanh chóng và tinh tế.', 20.00, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/960px-ChatGPT-Logo.svg.png', 'Pro'),
                ('Cursor Pro', 'IDE tích hợp AI đỉnh cao. Cách mạng hóa quy trình lập trình của bạn.', 20.00, 'https://img.icons8.com/color/512/cursor-ai.png', 'Pro'),
                ('GitHub Copilot', 'Trợ lý lập trình AI phổ biến nhất thế giới. Tiết kiệm 30% thời gian gõ code.', 10.00, 'https://brandlogos.net/wp-content/uploads/2025/06/github_copilot_icon-logo_brandlogos.net_jxl0m-300x249.png', 'Basic'),
                ('Midjourney Pro', 'Sáng tạo hình ảnh nghệ thuật đỉnh cao. Không giới hạn trí tưởng tượng.', 30.00, 'https://www.fredzone.org/wp-content/uploads/2023/03/R-1.png', 'Premium'),
                ('Suno AI Premium', 'Tạo nhạc chất lượng phòng thu chỉ từ vài dòng văn bản.', 10.00, 'https://sudo-labs.github.io/sudolabs/assets/imgs/sudo_logo.png', 'Basic');
            `);
        }

        // Seed Admin user if no admin exists
        const adminExists = await db.getFirstAsync<{ count: number }>(
            "SELECT COUNT(*) as count FROM Users WHERE role = 'admin'"
        );
        if (adminExists && adminExists.count === 0) {
            await db.runAsync(
                "INSERT OR IGNORE INTO Users (fullName, email, password, role) VALUES (?, ?, ?, ?)",
                ['Administrator', 'admin@store.com', 'admin123', 'admin']
            );
        }

        // Seed sample orders for admin dashboard demo
        const orderCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Orders');
        if (orderCount && orderCount.count === 0) {
            const adminUser = await db.getFirstAsync<{ id: number }>("SELECT id FROM Users WHERE role = 'admin'");
            if (adminUser) {
                const now = new Date();
                const d1 = new Date(now.getTime() - 1 * 86400000);
                const d7 = new Date(now.getTime() - 7 * 86400000);
                const d14 = new Date(now.getTime() - 14 * 86400000);
                const d30 = new Date(now.getTime() - 30 * 86400000);

                await db.runAsync('INSERT INTO Orders (totalAmount, createdAt, userId) VALUES (?, ?, ?)', [120.0, now.toISOString(), adminUser.id]);
                await db.runAsync('INSERT INTO Orders (totalAmount, createdAt, userId) VALUES (?, ?, ?)', [45.0, d1.toISOString(), adminUser.id]);
                await db.runAsync('INSERT INTO Orders (totalAmount, createdAt, userId) VALUES (?, ?, ?)', [240.0, d7.toISOString(), adminUser.id]);
                await db.runAsync('INSERT INTO Orders (totalAmount, createdAt, userId) VALUES (?, ?, ?)', [80.0, d14.toISOString(), adminUser.id]);
                await db.runAsync('INSERT INTO Orders (totalAmount, createdAt, userId) VALUES (?, ?, ?)', [320.0, d30.toISOString(), adminUser.id]);
            }
        }

    } catch (error) {
        console.error('Error initializing database:', error);
    }
}
