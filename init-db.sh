#!/bin/bash

# 1. 动态加载环境变量
if [ -f .env ]; then
  # 使用 export 确保子进程可见，同时用单引号保护变量内容
  export $(grep -v '^#' .env | xargs -d '\n')
else
  echo "错误: 未找到 .env 文件"
  exit 1
fi

echo "⏳ 正在等待 MySQL 容器完全就绪..."

# 2. 智能等待
for i in {1..20}; do
  if sudo docker exec zero-chat-mysql mysqladmin ping -u root -p"${MYSQL_ROOT_PASSWORD}" --silent; then
    echo "✅ MySQL 已准备就绪！"
    break
  fi
  echo "正在初始化中... ($((i*3))s)"
  sleep 3
  if [ $i -eq 20 ]; then
    echo "❌ 等待超时。"
    exit 1
  fi
done

echo "⚙️ 正在同步权限 (动态获取密码)..."

# 3. 核心修复：使用单引号 EOF 模式，这会阻止 Bash 解析 $ 符号
# 这样生成的 sql 文件里，密码会是原汁原味的 Zc_88@kP2m9v$7Lq...
cat << 'EOF' > sync_auth.sql
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
ALTER USER '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT ALL PRIVILEGES ON ${MYSQL_NAME}.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
EOF

# 4. 使用 sed 替换变量，确保即便有 $ 符号也能安全注入
sed -i "s/\${MYSQL_USER}/${MYSQL_USER}/g" sync_auth.sql
sed -i "s/\${MYSQL_PASSWORD}/${MYSQL_PASSWORD}/g" sync_auth.sql
sed -i "s/\${MYSQL_NAME}/${MYSQL_NAME}/g" sync_auth.sql

# 5. 执行授权 (通过输入重定向，最稳的方式)
sudo docker exec -i zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" < sync_auth.sql

if [ $? -eq 0 ]; then
  echo "🎉 数据库权限同步成功！"
  rm sync_auth.sql
else
  echo "❌ 权限同步依然失败，请检查 .env 密码是否包含特殊字符。"
  exit 1
fi