
if [ -f .env ]; then
    MYSQL_ROOT_PWD=$(grep '^MYSQL_ROOT_PASSWORD=' .env | head -1 | cut -d'=' -f2- | sed 's/^["'\'']//;s/["'\'']$//' | tr -d '\r ')
    DB_NAME=$(grep '^MYSQL_NAME=' .env | head -1 | cut -d'=' -f2- | sed 's/^["'\'']//;s/["'\'']$//' | tr -d '\r ')
fi

# 如果变量为空，给出友好提示
if [ -z "$MYSQL_ROOT_PWD" ] || [ -z "$DB_NAME" ]; then
    echo "❌ 错误: 无法从 .env 文件中获取 MYSQL_ROOT_PASSWORD 或 MYSQL_NAME"
    exit 1
fi

echo "🚀 开始检查 MySQL 容器状态..."

# --- 2. 轮询检查 MySQL 是否真正可用 ---
# 不仅仅是 ping，而是尝试执行简单的查询语句
for i in {1..30}; do
    # 尝试执行一次 SELECT 1
    sudo docker exec zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PWD}" -e "SELECT 1;" &>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ MySQL 引擎已启动并响应"
        
        # --- 3. 确保数据库存在 ---
        echo "🛠️ 正在检查/创建数据库: ${DB_NAME}"
        sudo docker exec -i zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PWD}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

        # --- 4. 同步表结构 ---
        if [ -f "database/init.sql" ]; then
            echo "📥 正在同步表结构到数据库: ${DB_NAME}"
            
            # 加上 --default-character-set 预防编码问题
            sudo docker exec -i zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PWD}" --default-character-set=utf8mb4 "${DB_NAME}" < database/init.sql
            
            if [ $? -eq 0 ]; then
                echo "⭐ 数据库表结构同步成功！"
            else
                echo "❌ 数据库同步失败，请检查 database/init.sql 文件语法或内容。"
                exit 1
            fi
        else
            echo "⚠️ 警告: 未找到 database/init.sql，跳过表同步。"
        fi
        
        # 成功后退出循环
        SYNC_SUCCESS=true
        break
    fi
    
    echo "⏳ 正在初始化中... 容器暂未就绪 ($((i*2))s/60s)"
    sleep 2
done

if [ "$SYNC_SUCCESS" != true ]; then
    echo "❌ 错误: MySQL 在 60 秒内未能就绪，请检查 docker logs zero-chat-mysql"
    exit 1
fi

# --- 5. 清理与重启业务 ---
sleep 5
echo "🧹 清理后端 PM2 日志并重启应用..."
sudo docker exec zero-chat-app pm2 flush
sudo docker restart zero-chat-app

echo "✨ 部署脚本执行完毕！"