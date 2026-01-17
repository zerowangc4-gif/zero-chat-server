#!/bin/bash

if [ -f .env ]; then
  set -a; source .env; set +a
else
  echo "错误: 未找到 .env 文件"
  exit 1
fi

echo "正在等待数据库完全启动 (15s)..."
sleep 15

# --- 核心逻辑：多路径尝试修复 ---

# 尝试列表：1. 使用 .env 密码  2. 使用空密码
PASS_ATTEMPTS=("${MYSQL_PASSWORD}" "")

SUCCESS=false

for PASS in "${PASS_ATTEMPTS[@]}"; do
  echo "尝试连接数据库 (密码: ${PASS:0:3}***)..."
  
  # 尝试执行一个简单的指令
  if sudo docker exec zero-chat-mysql mysql -u root -p"${PASS}" -e "SELECT 1;" > /dev/null 2>&1; then
    echo "连接成功！正在对齐权限..."
    

    # 注意：我们要确保 root 的密码和应用用户的密码全部同步为 .env 里的值
    FIX_SQL="
    ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD}';
    CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
    ALTER USER '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
    GRANT ALL PRIVILEGES ON ${MYSQL_NAME}.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;"
    
    sudo docker exec zero-chat-mysql mysql -u root -p"${PASS}" -e "$FIX_SQL"
    SUCCESS=true
    break
  fi
done

if [ "$SUCCESS" = true ]; then
  echo "数据库权限已全自动同步成功！"
else
  echo "自动修复失败。原因可能是数据库已有旧数据且 Root 密码与 .env 不符。"
  echo "建议：如果是测试环境，请在 YAML 中临时添加 'rm -rf data/mysql' 后再 Push。"
  exit 1
fi