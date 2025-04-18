# SM2 数字签名系统

基于国密 SM2 算法的数字签名系统，提供图形界面（GUI）和 Web 界面两种使用方式，支持完整的密钥管理、文件签名和验证功能。

## 功能特点 ✨

- 🔐 完整实现 SM2 椭圆曲线数字签名算法
- 💻 同时支持桌面客户端（GUI）和 Web 界面
- 🔑 完整的密钥对管理功能
  - 生成新的密钥对
  - 导入/导出密钥对
  - 私钥安全显示/隐藏
- 📝 文件签名功能
  - 支持对文本文件进行签名
  - 自动计算文件 SM3 哈希值
  - 生成包含完整签名信息的 .sig 文件
- ✅ 签名验证功能
  - 验证签名的有效性
  - 支持导入 .sig 签名文件
  - 详细的验证信息展示
- 🎯 用户友好的界面设计
  - 简洁直观的操作流程
  - 优雅的动画过渡效果
  - 即时的操作反馈

## 系统要求 🖥️

- Python 3.8+
- 操作系统：Windows / Linux / MacOS
- 主要依赖：
  - gmssl >= 3.2.1（国密算法实现）
  - flask >= 2.0.0（Web 服务器）
  - flask-cors >= 3.0.10（跨域支持）
  - tkinter（GUI 界面，Python 标准库）

## 快速开始 🚀

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/sm2-signature-system.git
cd sm2-signature-system
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 运行程序

#### GUI 客户端

```bash
python src/launcher.py
```

#### Web 界面

```bash
cd src/web
python run_server.py
```

然后在浏览器中访问：http://localhost:5000

## 使用说明 📖

### 密钥管理

1. 程序启动时会自动生成或加载已有的 SM2 密钥对
2. 可以通过界面上的按钮生成新的密钥对
3. 支持将密钥对导出到文件或从文件导入
4. Web 界面中私钥默认以密文显示，可点击显示/隐藏

### 签名操作

1. 选择要签名的文本文件（.txt）
2. 系统会自动计算文件的 SM3 哈希值
3. 点击"生成签名"按钮
4. 签名结果会显示在界面上，同时生成 .sig 文件

### 签名验证

1. 选择原始文件
2. 可以通过以下两种方式提供签名信息：
   - 直接导入 .sig 签名文件
   - 手动输入签名值（r、s）和公钥信息
3. 点击"验证签名"按钮
4. 系统会显示验证结果

## 项目结构 📁

```
src/
├── launcher.py      # 程序启动入口
├── main.py         # 主程序
├── sm2_core.py     # SM2 算法核心实现
├── sm2_gui.py      # GUI 界面实现
├── assets/         # 资源文件
│   └── keys/       # 密钥存储
├── data/           # 数据目录
│   ├── input/      # 待签名文件
│   └── signed/     # 签名后的文件
└── web/           # Web 界面
    ├── api.py     # Web API 实现
    ├── index.html # Web 页面
    └── js/        # JavaScript 文件
```

## 安全说明 🛡️

- 私钥默认以加密形式显示
- 密钥存储在本地文件系统中
- 使用标准的 SM2/SM3 算法
- 签名验证过程严格遵循标准规范
- 建议定期备份重要的密钥和签名文件

## 开发说明 🔧

### 代码规范

- 遵循 PEP 8 Python 编码规范
- 使用 TypeScript 编写前端代码
- 完整的代码注释和文档字符串

### 测试

- 包含完整的单元测试
- 椭圆曲线运算测试
- 签名验证功能测试
- 与 gmssl 标准实现的对比测试

## 技术栈 🛠️

- 后端：Python 3.8+
  - Flask (Web 框架)
  - gmssl (国密算法)
  - tkinter (GUI)
- 前端：
  - Bootstrap 5
  - 原生 JavaScript

## 贡献指南 👥

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交改动：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 许可证 📄

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 更新日志 📋

### v1.0.0 (2025-04-18)

- ✨ 同时支持 GUI 和 Web 界面
- 🔒 完整的密钥管理功能
- 📝 文件签名和验证
- 🎨 优化的用户界面
- 🐛 修复已知问题

---

如有问题或建议，欢迎提交 Issue 或 Pull Request。