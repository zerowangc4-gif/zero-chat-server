# 1. 使用 Node 镜像
FROM node:18-alpine

# 2. 设置工作目录
WORKDIR /app

# 3. 拷贝 package.json 并安装依赖
COPY package*.json ./
RUN npm install --production

# 4. 拷贝所有源代码
COPY . .

# 5. 暴露你的端口 (比如 3000)
EXPOSE 3000

# 6. 启动命令
CMD ["npm", "start"]