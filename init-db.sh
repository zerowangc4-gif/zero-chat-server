#!/bin/bash


if [ -f .env ]; then

  set -a; source .env; set +a
else
  echo "错误: 未找到 .env 文件"
  exit 1
fi

echo "等待数据库启动中"
sleep 15

echo "正在同步 MySQL 用户权限..."


SQL_COMMAND="CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}'; \
ALTER USER '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}'; \
GRANT ALL PRIVILEGES ON ${MYSQL_NAME}.* TO '${MYSQL_USER}'@'%'; \
FLUSH PRIVILEGES;"


sudo docker exec zero-chat-mysql mysql -u root -p"${MYSQL_PASSWORD}" -e "$SQL_COMMAND"


if [ $? -eq 0 ]; then
  echo "数据库权限同步成功！"
else
  echo "权限同步失败,请检查数据库容器状态"
  exit 1
fi