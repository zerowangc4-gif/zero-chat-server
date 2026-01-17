#!/bin/bash

if [ -f .env ]; then
  MYSQL_ROOT_PWD=$(grep '^MYSQL_ROOT_PASSWORD=' .env | cut -d '"' -f 2)
  MYSQL_U=$(grep '^MYSQL_USER=' .env | cut -d '"' -f 2)
  MYSQL_P=$(grep '^MYSQL_PASSWORD=' .env | cut -d '"' -f 2)
  MYSQL_D=$(grep '^MYSQL_NAME=' .env | cut -d '"' -f 2)
fi

echo "正在等待 MySQL 容器完全就绪..."

export MYSQL_PWD="${MYSQL_ROOT_PWD}"

for i in {1..20}; do
  if sudo docker exec zero-chat-mysql mysqladmin ping -u root --silent; then
    echo "✅ MySQL 已准备就绪！"
    break
  fi
  echo "正在初始化中..."
  sleep 3
done

echo "⚙️ 正在执行权限同步 (环境变量模式)"


SQL_COMMAND="CREATE USER IF NOT EXISTS '${MYSQL_U}'@'%' IDENTIFIED BY '${MYSQL_P}'; \
             GRANT ALL PRIVILEGES ON ${MYSQL_D}.* TO '${MYSQL_U}'@'%'; \
             FLUSH PRIVILEGES;"

# 核心修改：使用 -e 注入环境变量，不再在命令行带 -p
if sudo docker exec -e MYSQL_PWD="${MYSQL_ROOT_PWD}" zero-chat-mysql mysql -u root -e "$SQL_COMMAND"; then
  echo "权限同步终于成功了！"
else
  echo "权限同步依然失败。"
  echo "尝试查看应用日志以定位 502 原因..."
  sudo docker logs zero-chat-app --tail 50
  exit 1
fi