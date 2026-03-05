  const productCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Products');
        if (productCount && productCount.count === 0) {
            console.log('[Database] Seeding NEW AI packages...');
            await db.execAsync(`
                INSERT INTO Products (name, description, price, image, tier) VALUES
                ('Claude 3.5 Opus', 'Mô hình suy luận mạnh nhất của Anthropic.', 25.00, 'https://images.seeklogo.com/logo-png/55/2/claude-logo-png_seeklogo-554540.png', 'Premium'),
                ('GPT-4o Plus', 'Trải nghiệm đa phương thức từ OpenAI.', 20.00, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/960px-ChatGPT-Logo.svg.png', 'Pro'),
                ('Cursor Pro', 'IDE tích hợp AI đỉnh cao.', 20.00, 'https://img.icons8.com/color/512/cursor-ai.png', 'Pro'),
                ('GitHub Copilot', 'Trợ lý lập trình AI phổ biến.', 15.00, 'https://brandlogos.net/wp-content/uploads/2025/06/github_copilot_icon-logo_brandlogos.net_jxl0m-300x249.png', 'Basic'),
                ('Midjourney Pro', 'Sáng tạo hình ảnh nghệ thuật.', 30.00, 'https://www.fredzone.org/wp-content/uploads/2023/03/R-1.png', 'Premium');
            `);
        }
