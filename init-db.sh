#!/bin/bash
# 1. 加载环境变量 (使用单引号和 grep 规避解析问题)
if [ -f .env ]; then
  MYSQL_ROOT_PWD=$(grep MYSQL_ROOT_PASSWORD .env | cut -d '"' -f 2)
  MYSQL_U=$(grep MYSQL_USER .env | cut -d '"' -f 2)
  MYSQL_P=$(grep MYSQL_PASSWORD .env | cut -d '"' -f 2)
  MYSQL_D=$(grep MYSQL_NAME .env | cut -d '"' -f 2)
fi

echo "⏳ 正在等待 MySQL 容器完全就绪..."
for i in {1..20}; do
  if sudo docker exec zero-chat-mysql mysqladmin ping -u root -p"${MYSQL_ROOT_PWD}" --silent; then
    echo "✅ MySQL 已准备就绪！"
    break
  fi
  echo "正在初始化中... ($((i*3))s)"
  sleep 3
done

echo "⚙️ 正在同步应用用户权限..."
# 构造 SQL：只负责创建用户和授权，不再动 root 本身
SQL_COMMAND="CREATE USER IF NOT EXISTS '${MYSQL_U}'@'%' IDENTIFIED BY '${MYSQL_P}'; \
             GRANT ALL PRIVILEGES ON ${MYSQL_D}.* TO '${MYSQL_U}'@'%'; \
             FLUSH PRIVILEGES;"

# 执行同步
if sudo docker exec zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PWD}" -e "$SQL_COMMAND"; then
  echo "🎉🎉🎉 权限同步成功！"
else
  echo "❌ 权限同步失败。请确保你在服务器上执行过 rm -rf data/mysql"
  exit 1
fi