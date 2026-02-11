# OpenClaw MCP Bridge Plugin

> 为OpenClaw提供Model Context Protocol (MCP) 桥接能力的插件 - 连接任何MCP服务器到OpenClaw

## 🎯 项目概述

**OpenClaw MCP Bridge** 是一个OpenClaw通道插件，作为MCP（Model Context Protocol）客户端，将任何MCP服务器的能力桥接到OpenClaw。

### 核心功能

- ✅ **多MCP服务器支持** - 同时连接多个MCP服务器
- ✅ **自动工具发现** - 自动识别并注册MCP服务器提供的工具
- ✅ **工具调用转换** - 将OpenClaw的agent调用转发到MCP工具
- ✅ **Stdio和Http模式** - 支持两种MCP连接模式
- ✅ **配置管理** - 灵活的JSON配置和环境变量支持
- ✅ **错误处理和重试** - 完善的错误处理和自动重试机制
- ✅ **性能监控** - 工具调用统计和性能日志

### 支持的MCP服务器

- **智谱Vision MCP** - 图片理解、OCR、技术图纸分析
- **Context7 MCP** - 数据库、知识库集成
- **自定义MCP服务器** - 任何兼容MCP协议的服务器

---

## 📋 前置要求

- [ ] Node.js 22+
- [ ] OpenClaw已安装并运行
- [ ] 智谱AI API Key（或其他MCP服务器的API Key）

---

## 🚀 安装

### 方式1：通过ClawHub（推荐）

```bash
openclaw plugins install openclaw-mcp-bridge
```

### 方式2：手动安装

```bash
# 克隆仓库
git clone https://github.com/xiaoji/openclaw-mcp-bridge.git
cd openclaw-mcp-bridge

# 安装依赖
npm install

# 构建TypeScript
npm run build
```

---

## ⚙️ 配置

### 1. 添加到OpenClaw

编辑 `~/.openclaw/openclaw.json`：

```json
{
  "plugins": {
    "entries": {
      "openclaw-mcp-bridge": {
        "enabled": true,
        "config": {
          "mcpServers": {
            "zai-vision": {
              "type": "stdio",
              "command": "npx",
              "args": ["-y", "@z_ai/mcp-server"],
              "env": {
                "Z_AI_API_KEY": "YOUR_ZAI_API_KEY",
                "Z_AI_MODE": "ZHIPU"
              },
              "enabled": true
            }
          }
        }
      }
    }
  }
}
```

### 2. 配置MCP服务器

**智谱Vision MCP**：
```json
{
  "zai-vision": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@z_ai/mcp-server"],
    "env": {
      "Z_AI_API_KEY": "YOUR_ZAI_API_KEY",
      "Z_AI_MODE": "ZHIPU"
    },
    "enabled": true
  }
}
```

**Context7 MCP（HTTP模式）**：
```json
{
  "context7": {
    "type": "http",
    "url": "https://api.context7.com/mcp",
    "headers": {
      "Authorization": "Bearer YOUR_CONTEXT7_API_KEY"
    },
    "enabled": false
  }
}
```

---

## 🛠️ 使用示例

### 1. 配智谱Vision MCP

```bash
# 设置环境变量
export ZAI_API_KEY="your-zai-api-key"

# 配置OpenClaw
openclaw config set plugins.entries.openclaw-mcp-bridge.config.mcpServers.zai-vision.env.Z_AI_API_KEY "$ZAI_API_KEY"
```

### 2. 在OpenClaw中使用

```
你：帮我分析这张图片
用户：[发送图片]

小机：[使用zai-vision MCP的image_analysis工具]
结果：[图片分析结果]

你：提取这个截图中的文字
用户：[发送代码截图]

小机：[使用zai-vision MCP的extract_text_from_screenshot工具]
结果：[提取的文字内容]
```

### 3. 管理MCP服务器

```
你：列出已配置的MCP服务器
小机：[列出所有服务器及其状态]

你：添加Context7 MCP服务器
小机：[指导配置步骤]

你：测试zai-vision连接
小机：[测试连接并报告结果]
```

---

## 📊 工具调用流程

```
用户消息 → OpenClaw Agent → MCP Bridge → MCP Client → MCP Server
                                                 ↓
OpenClaw ← MCP Bridge ← MCP Client ← MCP Server
```

### 流程说明

1. **用户发送消息**到OpenClaw
2. **OpenClaw Agent**处理消息，识别需要MCP工具
3. **MCP Bridge**接收工具调用请求
4. **MCP Client**连接到指定的MCP服务器
5. **MCP Server**执行工具调用
6. **MCP Client**接收结果
7. **MCP Bridge**转换结果并返回给OpenClaw
8. **OpenClaw**将结果展示给用户

---

## 🔧 开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build

# 运行测试
npm test
```

---

## 📁 项目结构

```
openclaw-mcp-bridge/
├── src/
│   ├── index.ts              # 插件入口
│   ├── mcp/                   # MCP客户端实现
│   │   ├── client.ts        # MCP客户端包装器
│   │   └── server.ts        # MCP服务器管理
│   ├── bridge/                # OpenClaw桥接层
│   │   ├── registry.ts       # 工具注册表
│   │   └── transformer.ts    # 参数转换器
│   ├── config/                # 配置管理
│   │   ├── loader.ts        # 配置加载器
│   │   └── storage.ts       # 配置存储
│   └── utils/                 # 工具函数
│       ├── logger.ts         # 日志系统
│       └── errors.ts         # 错误类型
├── schemas/                    # 配置schema
│   ├── plugin.json            # 插件配置
│   └── mcp-server.json        # MCP服务器配置
├── docs/                       # 文档
│   ├── README.md
│   ├── CONFIGURATION.md
│   └── EXAMPLES.md
├── package.json                # NPM包配置
├── tsconfig.json               # TypeScript配置
├── .gitignore                  # Git忽略文件
└── LICENSE                     # MIT许可证
```

---

## 🎯 使用场景

### 1. 图片分析
```
用户：分析这张产品截图
小机：[使用image_analysis] "这是一张智能手机产品的截图，包含设备特性和价格信息"
```

### 2. OCR文字提取
```
用户：提取这个错误日志中的文字
小机：[使用extract_text_from_screenshot] 提取错误信息和堆栈追踪
```

### 3. 技术图纸解读
```
用户：理解这个系统架构图
小机：[使用understand_technical_diagram] 解读架构组件和数据流
```

### 4. 错误诊断
```
用户：这个错误怎么修复？
小机：[使用diagnose_error_screenshot] 分析错误并提供修复建议
```

---

## 🔐 安全性

- ✅ 环境变量存储敏感信息
- ✅ 白名单过滤输入
- ✅ 工具权限验证
- ✅ 错误信息脱敏
- ✅ 连接超时和重试机制

---

## 📈 性能优化

- ✅ MCP客户端连接池
- ✅ 工具调用结果缓存
- ✅ 异步非阻塞调用
- ✅ 请求超时控制
- ✅ 错误自动重试

---

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 👤 作者

**小机 (Xiao Ji)** - OpenClaw AI私人助理

---

## 🔗 链接

- [OpenClaw官网](https://openclaw.ai)
- [MCP协议文档](https://modelcontextprotocol.io)
- [智谱AI Vision MCP](https://docs.bigmodel.cn/cn/coding-plan/mcp/vision-mcp-server)
- [OpenClaw插件文档](https://docs.openclaw.ai/tools/plugin)
