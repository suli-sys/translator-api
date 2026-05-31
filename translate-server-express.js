#!/usr/bin/env node
/**
 * 实时屏幕文字翻译API服务 - Express版本
 * 支持手机端和电脑端
 * 使用Google Translate免费API
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 支持的语言
const LANGUAGES = {
  'auto': '自动检测',
  'zh': '中文',
  'zh-CN': '简体中文',
  'zh-TW': '繁体中文',
  'en': '英语',
  'ja': '日语',
  'ko': '韩语',
  'fr': '法语',
  'de': '德语',
  'es': '西班牙语',
  'ru': '俄语',
  'ar': '阿拉伯语',
  'pt': '葡萄牙语',
  'it': '意大利语',
  'th': '泰语',
  'vi': '越南语',
  'id': '印尼语',
  'ms': '马来语',
  'tr': '土耳其语',
  'pl': '波兰语',
  'nl': '荷兰语',
  'sv': '瑞典语'
};

// 翻译函数
async function translateText(text, sourceLang = 'auto', targetLang = 'zh-CN') {
  const startTime = Date.now();

  try {
    const encodedText = encodeURIComponent(text);
    const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
    const tl = targetLang;

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodedText}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const result = response.data;

    if (result && result[0]) {
      const translatedText = result[0].map(item => item[0]).join('');
      const detectedLanguage = result[2] || sourceLang;

      return {
        success: true,
        data: {
          original_text: text,
          translated_text: translatedText,
          source_lang: detectedLanguage,
          target_lang: targetLang,
          confidence: 0.95,
          processing_time: Date.now() - startTime
        }
      };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    // 备用API
    try {
      const backupResult = await translateWithBackup(text, sourceLang, targetLang);
      return {
        success: true,
        data: {
          original_text: text,
          translated_text: backupResult.translatedText,
          source_lang: sourceLang,
          target_lang: targetLang,
          confidence: 0.85,
          processing_time: Date.now() - startTime
        }
      };
    } catch (backupError) {
      return {
        success: false,
        error: {
          code: 'TRANSLATION_FAILED',
          message: '翻译服务暂时不可用，请稍后重试'
        }
      };
    }
  }
}

// 备用翻译API
async function translateWithBackup(text, sourceLang, targetLang) {
  const encodedText = encodeURIComponent(text);
  const sl = sourceLang === 'auto' ? 'en' : sourceLang;
  const tl = targetLang;

  const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sl}|${tl}`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'ScreenTranslator/1.0'
    },
    timeout: 10000
  });

  const result = response.data;

  if (result.responseStatus === 200) {
    return {
      translatedText: result.responseData.translatedText,
      detectedLanguage: sourceLang
    };
  } else {
    throw new Error('Backup translation failed');
  }
}

// API路由

// 翻译接口
app.post('/translate', async (req, res) => {
  try {
    const { text, q, source_lang = 'auto', sl = 'auto', target_lang = 'zh-CN', tl = 'zh-CN' } = req.body;

    const textToTranslate = text || q;

    if (!textToTranslate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETER',
          message: '缺少必要参数: text 或 q'
        }
      });
    }

    const sourceLang = source_lang || sl;
    const targetLang = target_lang || tl;

    const result = await translateText(textToTranslate, sourceLang, targetLang);
    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});

// GET方式翻译（兼容Google Translate API格式）
app.get('/translate', async (req, res) => {
  try {
    const { q, sl = 'auto', tl = 'zh-CN', client = 'gtx', dt = 't' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETER',
          message: '缺少必要参数: q'
        }
      });
    }

    const encodedText = encodeURIComponent(q);
    const url = `https://translate.googleapis.com/translate_a/single?client=${client}&sl=${sl}&tl=${tl}&dt=${dt}&q=${encodedText}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'TRANSLATION_FAILED',
        message: '翻译失败'
      }
    });
  }
});

// 批量翻译
app.post('/translate/batch', async (req, res) => {
  try {
    const { texts, source_lang = 'auto', target_lang = 'zh-CN' } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'texts必须是数组'
        }
      });
    }

    const results = await Promise.all(
      texts.map(async (text) => {
        try {
          return await translateText(text, source_lang, target_lang);
        } catch (error) {
          return {
            success: false,
            error: {
              code: 'TRANSLATION_FAILED',
              message: '翻译失败'
            }
          };
        }
      })
    );

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});

// 获取支持的语言
app.get('/languages', (req, res) => {
  res.json({
    success: true,
    data: {
      languages: Object.entries(LANGUAGES).map(([code, name]) => ({
        code,
        name
      }))
    }
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime()
    }
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '实时屏幕文字翻译API',
    version: '1.0.0',
    description: '支持手机端和电脑端的实时文字翻译服务',
    endpoints: {
      'POST /translate': '翻译单条文字',
      'GET /translate': '翻译单条文字（兼容Google API格式）',
      'POST /translate/batch': '批量翻译',
      'GET /languages': '获取支持的语言列表',
      'GET /health': '健康检查'
    },
    usage: {
      example: {
        method: 'POST',
        url: '/translate',
        body: {
          text: 'Hello World',
          source_lang: 'en',
          target_lang: 'zh-CN'
        }
      }
    }
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log('=========================================');
  console.log('实时屏幕文字翻译API服务已启动');
  console.log('=========================================');
  console.log(`监听地址: http://0.0.0.0:${PORT}`);
  console.log('');
  console.log('API端点:');
  console.log(`  POST http://localhost:${PORT}/translate`);
  console.log(`  GET  http://localhost:${PORT}/translate?q=Hello`);
  console.log(`  POST http://localhost:${PORT}/translate/batch`);
  console.log(`  GET  http://localhost:${PORT}/languages`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log('');
  console.log('使用示例:');
  console.log(`  curl -X POST http://localhost:${PORT}/translate \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"text": "Hello World", "target_lang": "zh-CN"}'`);
  console.log('');
  console.log('按 Ctrl+C 停止服务');
});

module.exports = app;
