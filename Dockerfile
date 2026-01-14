FROM node:18-alpine

WORKDIR /app

# 安装 PM2 和 编译工具
RUN npm install pm2 -g && npm install typescript tsc-alias -g

# 拷贝依赖配置
COPY package*.json ./

# 安装所有依赖
RUN npm install

# 拷贝源码
COPY . .

# 【关键点】如果本地 npm run build 还是报错，可以尝试直接运行编译指令
RUN npm run build

EXPOSE 3000

# 启动 (使用 pm2-runtime)
CMD ["pm2-runtime", "start", "dist/index.js", "--name", "zero-chat-api"]