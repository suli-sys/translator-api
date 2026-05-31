const axios = require('axios');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let text, sourceLang, targetLang;

    if (req.method === 'POST') {
      text = req.body.text || req.body.q;
      sourceLang = req.body.source_lang || req.body.sl || 'auto';
      targetLang = req.body.target_lang || req.body.tl || 'zh-CN';
    } else {
      text = req.query.q;
      sourceLang = req.query.sl || 'auto';
      targetLang = req.query.tl || 'zh-CN';
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMETER', message: '缺少必要参数: text 或 q' }
      });
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;

    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });

    const result = response.data;

    if (result && result[0]) {
      const translatedText = result[0].map(item => item[0]).join('');
      const detectedLanguage = result[2] || sourceLang;

      return res.json({
        success: true,
        data: {
          original_text: text,
          translated_text: translatedText,
          source_lang: detectedLanguage,
          target_lang: targetLang,
          confidence: 0.95,
          processing_time: 0
        }
      });
    } else {
      throw new Error('Invalid response');
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'TRANSLATION_FAILED', message: '翻译失败' }
    });
  }
};
