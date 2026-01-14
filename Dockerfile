FROM node:18-alpine

WORKDIR /app

# 1. 安装 PM2
RUN npm install pm2 -g

# 2. 安装依赖
COPY package*.json ./
RUN npm install

# 3. 拷贝源码并编译 (这一步绝对不能少，否则没 dist 文件夹)
COPY . .
RUN npm run build

# 4. 暴露端口
EXPOSE 3000

# 5. 使用 pm2-runtime 启动 (注意：必须用 pm2-runtime，不能用 pm2 start)
# 这样进程才会在前台运行，容器才不会退出
CMD ["pm2-runtime", "start", "dist/index.js", "--name", "zero-chat-api"]