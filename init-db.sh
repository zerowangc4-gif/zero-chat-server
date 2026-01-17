#!/bin/bash
set -a; source .env; set +a

echo "⏳ 正在等待 MySQL 容器完全就绪..."

# 循环检查 MySQL 是否可以响应 ping
# 最多等待 60 秒
for i in {1..20}; do
  if sudo docker exec zero-chat-mysql mysqladmin ping -u root -p"${MYSQL_ROOT_PASSWORD}" --silent; then
    echo "✅ MySQL 已准备就绪！"
    break
  fi
  echo "正在初始化中... ($((i*3))s)"
  sleep 3
  if [ $i -eq 20 ]; then
    echo "❌ 等待超时，MySQL 启动失败。"
    sudo docker logs zero-chat-mysql --tail 20
    exit 1
  fi
done

echo "⚙️ 正在同步权限..."
SQL="ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
     GRANT ALL PRIVILEGES ON ${MYSQL_NAME}.* TO '${MYSQL_USER}'@'%';
     FLUSH PRIVILEGES;"

sudo docker exec zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "$SQL"