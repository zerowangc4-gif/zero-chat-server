#!/bin/bash
if [ -f .env ]; then
  MYSQL_ROOT_PWD=$(grep '^MYSQL_ROOT_PASSWORD=' .env | cut -d '"' -f 2)
fi

echo "正在等待 MySQL 容器完全就绪"
export MYSQL_PWD="${MYSQL_ROOT_PWD}"

for i in {1..30}; do
  
  if sudo docker exec zero-chat-mysql mysqladmin ping -u root --silent; then
    echo "MySQL引擎已启动并响应"
    
    if [ -f "database/init.sql" ]; then
      echo "正在同步表结构"
      sudo docker exec -i zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PWD}" < database/init.sql
      if [ $? -eq 0 ]; then
        echo "数据库表结构同步成功"
      else
        echo "数据库表结构同步失败"
        exit 1
      fi
    fi
    break
  fi
  
  echo "正在初始化中... ($((i*2))s)"
  sleep 2
done

sleep 5
echo "所有初始化指令已下达，启动流程完成。"
sudo docker exec zero-chat-app pm2 flush