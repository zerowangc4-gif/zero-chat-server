#!/bin/bash
if [ -f .env ]; then
  # 使用 tr 删掉所有可能的引号和回车符，确保变量干净
  MYSQL_ROOT_PWD=$(grep '^MYSQL_ROOT_PASSWORD=' .env | cut -d '=' -f 2 | tr -d '"\r ')
  # 同时也拿到数据库名
  DB_NAME=$(grep '^MYSQL_NAME=' .env | cut -d '=' -f 2 | tr -d '"\r ')
fi

echo "正在等待 MySQL 容器完全就绪"

for i in {1..30}; do
  # 这里的 -p 不要加空格
  if sudo docker exec zero-chat-mysql mysqladmin ping -u root -p"${MYSQL_ROOT_PWD}" --silent; then
    echo "MySQL引擎已启动并响应"
    
    if [ -f "database/init.sql" ]; then
      echo "正在同步表结构到数据库: ${DB_NAME}"
      
      # 重点：在这里显式指定 ${DB_NAME}
      sudo docker exec -i zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PWD}" "${DB_NAME}" < database/init.sql
      
      if [ $? -eq 0 ]; then
        echo "数据库表结构同步成功"
      else
        echo "数据库表结构同步失败，尝试先创建数据库..."
        # 如果是因为库不存在而失败，先建库再同步
        sudo docker exec -i zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PWD}" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
        sudo docker exec -i zero-chat-mysql mysql -u root -p"${MYSQL_ROOT_PWD}" "${DB_NAME}" < database/init.sql
      fi
    fi
    break
  fi
  
  echo "正在初始化中... ($((i*2))s)"
  sleep 2
done

sleep 5
echo "清理后端 PM2 日志并重启"
sudo docker exec zero-chat-app pm2 flush
sudo docker restart zero-chat-app