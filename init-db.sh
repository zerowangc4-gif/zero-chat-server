#!/bin/bash
if [ -f .env ]; then
  MYSQL_ROOT_PWD=$(grep '^MYSQL_ROOT_PASSWORD=' .env | cut -d '"' -f 2)
fi

echo "正在等待 MySQL 容器完全就绪"
export MYSQL_PWD="${MYSQL_ROOT_PWD}"

for i in {1..30}; do
  if sudo docker exec zero-chat-mysql mysqladmin ping -u root --silent; then
    echo "MySQL已就绪"
    sudo docker exec -e MYSQL_PWD="${MYSQL_ROOT_PWD}" zero-chat-mysql mysql -u root -e "FLUSH PRIVILEGES;" 2>/dev/null
    break
  fi
  echo "正在初始化中... ($((i*2))s)"
  sleep 2
done

sleep 5
echo "🚀 启动流程完成。"