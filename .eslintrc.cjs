module.exports = {
  root: true,
  // 环境定义为 node
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended", // 这一行必须放在最后，确保 Prettier 覆盖其他规则
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    // Prettier 具体的格式要求在这里强制执行
    "prettier/prettier": [
      "error",
      {
        "tabWidth": 2,          // 强制 2 空格
        "doubleQuote": true,    // 强制双引号
        "semi": true,           // 强制分号
        "endOfLine": "auto",
        "trailingComma": "none" // 结尾不加逗号
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",   // 禁止使用 any
    "@typescript-eslint/no-unused-vars": "error",   // 禁止未使用的变量
    "no-console": "off",                            // 后端允许使用 console.log
  },
};