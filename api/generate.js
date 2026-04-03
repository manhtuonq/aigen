// /api/generate.js
export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userDescription, frameCount, style, motionType } = req.body;

  if (!userDescription) {
    return res.status(400).json({ error: 'Thiếu mô tả' });
  }

  // Lấy key từ biến môi trường Vercel (KHÔNG hardcode)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server chưa cấu hình API key' });
  }

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // nhanh + rẻ
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Tạo ${frameCount} prompt tiếng Anh cho Stable Diffusion để tạo chuỗi ảnh animation.
Mô tả: "${userDescription}"
Style: ${style}
Chuyển động: ${motionType}

Trả về JSON array, không giải thích thêm:
[
  {"frame": 1, "prompt": "...", "neg": "blurry, distorted, low quality"},
  ...
]`
        }]
      })
    });

    const data = await claudeRes.json();
    
    if (!claudeRes.ok) {
      return res.status(502).json({ error: data.error?.message || 'Claude lỗi' });
    }

    // Parse JSON từ response của Claude
    const text = data.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(502).json({ error: 'Claude trả về định dạng không đúng' });
    }

    const frames = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ frames });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}