PROJECT_DIR="/home/ubuntu/zero-chat"

echo "开始深度重置部署环境"


cd $PROJECT_DIR || { echo "找不到目录 $PROJECT_DIR"; exit 1; }


echo "停止容器中"
sudo docker-compose down --remove-orphans


if [ -d "data/mysql" ]; then
    echo "正在清理 MySQL 数据目录"
    sudo rm -rf data/mysql
fi

if [ -d "data/redis" ]; then
    echo "正在清理 Redis 数据目录"
    sudo rm -rf data/redis
fi


echo "清理未使用的 Docker 卷"
sudo docker volume prune -f

echo "---------------------------------------"
echo "环境重置完成！"
echo "目前目录状态："
ls -F
echo "---------------------------------------"
echo "现在你可以重新运行 GitHub Actions 部署"