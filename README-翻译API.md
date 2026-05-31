# 实时屏幕文字翻译API

一个支持手机端和电脑端的实时文字翻译服务，基于Google Translate免费API。

## ✨ 功能特点

- 🌍 支持100+语言互译
- 📱 手机端和电脑端均可使用
- ⚡ 实时翻译，毫秒级响应
- 🆓 免费使用，无需注册
- 🔌 RESTful API，易于集成
- 📦 支持批量翻译

## 🚀 快速开始

### 方式一：本地部署（推荐）

#### 1. 安装依赖

```bash
npm install express cors axios
```

#### 2. 启动服务

```bash
node translate-server-express.js
```

#### 3. 访问服务

服务启动后，访问：
- 翻译接口: `http://localhost:3000/translate`
- 语言列表: `http://localhost:3000/languages`
- 健康检查: `http://localhost:3000/health`

### 方式二：使用批处理脚本（Windows）

双击运行 `deploy-translator.bat`，自动完成安装和启动。

---

## 📖 API文档

### 1. 翻译单条文字

**POST** `/translate`

**请求参数：**
```json
{
  "text": "Hello World",
  "source_lang": "en",
  "target_lang": "zh-CN"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "original_text": "Hello World",
    "translated_text": "你好世界",
    "source_lang": "en",
    "target_lang": "zh-CN",
    "confidence": 0.95,
    "processing_time": 150
  }
}
```

**curl示例：**
```bash
curl -X POST http://localhost:3000/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World", "target_lang": "zh-CN"}'
```

---

### 2. GET方式翻译（兼容Google API）

**GET** `/translate?q=Hello&sl=en&tl=zh-CN`

**curl示例：**
```bash
curl "http://localhost:3000/translate?q=Hello&sl=en&tl=zh-CN"
```

---

### 3. 批量翻译

**POST** `/translate/batch`

**请求参数：**
```json
{
  "texts": ["Hello", "World", "Good morning"],
  "source_lang": "en",
  "target_lang": "zh-CN"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "success": true,
      "data": {
        "original_text": "Hello",
        "translated_text": "你好",
        "confidence": 0.95
      }
    },
    ...
  ]
}
```

---

### 4. 获取支持的语言

**GET** `/languages`

**响应示例：**
```json
{
  "success": true,
  "data": {
    "languages": [
      { "code": "auto", "name": "自动检测" },
      { "code": "zh", "name": "中文" },
      { "code": "en", "name": "英语" },
      ...
    ]
  }
}
```

---

### 5. 健康检查

**GET** `/health`

**响应示例：**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-31T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

---

## 🌐 公网访问

### 方式一：使用ngrok（推荐）

1. 安装ngrok: https://ngrok.com/
2. 启动服务后运行：
   ```bash
   ngrok http 3000
   ```
3. 获取公网URL，如：`https://xxxx.ngrok.io`

### 方式二：部署到云服务器

1. 上传代码到服务器
2. 安装Node.js和依赖
3. 使用PM2启动：
   ```bash
   npm install -g pm2
   pm2 start translate-server-express.js --name translator
   pm2 save
   pm2 startup
   ```

### 方式三：使用Vercel/Netlify

1. 将代码推送到GitHub
2. 在Vercel/Netlify中导入项目
3. 自动部署并获取公网URL

---

## 📱 移动端集成

### Android/iOS App

```javascript
// 使用fetch调用翻译API
async function translate(text) {
  const response = await fetch('https://your-api-url/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      target_lang: 'zh-CN'
    })
  });

  const result = await response.json();
  return result.data.translated_text;
}
```

### 微信小程序

```javascript
wx.request({
  url: 'https://your-api-url/translate',
  method: 'POST',
  data: {
    text: 'Hello',
    target_lang: 'zh-CN'
  },
  header: {
    'Content-Type': 'application/json'
  },
  success(res) {
    console.log(res.data.data.translated_text);
  }
});
```

---

## 🔧 高级配置

### 环境变量

- `PORT`: 服务端口（默认3000）
- `HOST`: 监听地址（默认0.0.0.0）

### 启动参数

```bash
PORT=8080 node translate-server-express.js
```

---

## 💡 使用场景

1. **屏幕翻译工具** - 截图后识别文字并翻译
2. **浏览器插件** - 网页文字实时翻译
3. **聊天应用** - 多语言消息翻译
4. **文档翻译** - 批量翻译文档内容
5. **学习工具** - 外语学习辅助

---

## ⚠️ 注意事项

1. 本服务基于Google Translate免费API，有请求频率限制
2. 商业使用建议申请Google Cloud Translation API密钥
3. 翻译质量取决于源语言和目标语言的复杂度
4. 建议配合OCR服务使用，实现完整的屏幕翻译功能

---

## 📊 支持的语言代码

| 语言 | 代码 |
|------|------|
| 自动检测 | auto |
| 简体中文 | zh-CN |
| 繁体中文 | zh-TW |
| 英语 | en |
| 日语 | ja |
| 韩语 | ko |
| 法语 | fr |
| 德语 | de |
| 西班牙语 | es |
| 俄语 | ru |
| 阿拉伯语 | ar |
| 葡萄牙语 | pt |
| 意大利语 | it |
| 泰语 | th |
| 越南语 | vi |
| 印尼语 | id |
| 马来语 | ms |
| 土耳其语 | tr |
| 波兰语 | pl |
| 荷兰语 | nl |
| 瑞典语 | sv |

---

## 🤝 技术支持

如有问题，请提交Issue或联系开发者。

---

## 📄 许可证

MIT License