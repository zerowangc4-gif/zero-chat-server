#!/bin/bash

set -a; source .env; set +a

echo "正在等待 MySQL 容器完全就绪."

for i in {1..20}; do
  if sudo docker exec zero-chat-mysql mysqladmin ping -u root -p"${MYSQL_ROOT_PASSWORD}" --silent; then
    echo "MySQL 已准备就绪！"
    break
  fi
  echo "正在初始化中"
  sleep 3
  if [ $i -eq 20 ]; then
    echo "等待超时,MySQL 启动失败。"
    sudo docker logs zero-chat-mysql --tail 20
    exit 1
  fi
done

echo "正在同步应用用户权限..."


SQL_COMMAND="CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}'; \
             GRANT ALL PRIVILEGES ON ${MYSQL_NAME}.* TO '${MYSQL_USER}'@'%'; \
             FLUSH PRIVILEGES;"


if sudo docker exec zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "$SQL_COMMAND"; then
  echo "数据库权限同步成功！"
else
  echo "权限同步失败。"
  exit 1
fi