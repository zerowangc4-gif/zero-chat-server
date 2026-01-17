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

echo "⚙️ 正在同步应用用户权限..."

# 构建 SQL
SQL_COMMAND="CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}'; \
             GRANT ALL PRIVILEGES ON ${MYSQL_NAME}.* TO '${MYSQL_USER}'@'%'; \
             FLUSH PRIVILEGES;"

# --- 终极方案：直接在容器内写一个临时配置文件来避开命令行密码报错 ---
sudo docker exec zero-chat-mysql bash -c "echo '[client]' > /tmp/my.cnf && \
  echo 'user=root' >> /tmp/my.cnf && \
  echo 'password=${MYSQL_ROOT_PASSWORD}' >> /tmp/my.cnf && \
  mysql --defaults-extra-file=/tmp/my.cnf -e \"$SQL_COMMAND\" && \
  rm /tmp/my.cnf"

if [ $? -eq 0 ]; then
  echo "🎉 数据库权限同步成功！"
else
  # 如果上面的还是失败，尝试最后的“免密破门”法
  echo "⚠️ 正在尝试免密授权模式..."
  sudo docker exec zero-chat-mysql mysql -u root -p'${MYSQL_ROOT_PASSWORD}' -e "$SQL_COMMAND" 2>/dev/null || \
  sudo docker exec zero-chat-mysql mysql -e "$SQL_COMMAND"
  
  if [ $? -eq 0 ]; then
     echo "🎉 数据库权限同步成功（通过备选方案）！"
  else
     echo "❌ 权限同步彻底失败。"
     exit 1
  fi
fi